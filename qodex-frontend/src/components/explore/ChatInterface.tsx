/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useRef } from 'react';
import { Repository, QodexChatResponse, ChatMessage } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { canSendMessage } from '@/lib/quota';
import { AlertCircle, Send, Crown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatInterfaceProps {
  repository: Repository;
}

export default function ChatInterface({ repository }: ChatInterfaceProps) {
  const { user, userProfile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [messageCount, setMessageCount] = useState(0);
  const [canSend, setCanSend] = useState(true);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isNewRepository, setIsNewRepository] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load existing messages from QODEX API when repository changes
  useEffect(() => {
    if (repository && user) {
      // Check if repository is newly created (within last 5 minutes)
      const repoCreatedAt = new Date(repository.created_at);
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      const isRecentlyCreated = repoCreatedAt > fiveMinutesAgo;
      setIsNewRepository(isRecentlyCreated);
      
      if (isRecentlyCreated && repository.status !== 'READY') {
        // Skip loading history for new repositories that aren't ready
        console.log('🆕 New repository detected, skipping history load');
        setLoadingMessages(false);
        showWelcomeMessage();
      } else {
        // Load history for existing repositories
        loadChatHistory();
      }
    }
  }, [repository, user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check quota when user profile or conversation changes
  useEffect(() => {
    if (userProfile && conversationId !== null) {
      checkQuota();
    }
  }, [userProfile, conversationId, messageCount]);

  const checkQuota = async () => {
    if (!userProfile || userProfile.subscription_tier === 'premium') {
      setCanSend(true);
      return;
    }

    if (conversationId !== null) {
      try {
        const canSendMsg = await canSendMessage(conversationId, user!.$id, userProfile);
        setCanSend(canSendMsg);
      } catch (error) {
        console.error('Error checking quota:', error);
        setCanSend(false);
      }
    }
  };

  const showWelcomeMessage = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `## Welcome to QODEX AI

I'm here to help you explore and understand the **${repository.name}** repository.

${repository.status === 'READY' ? 
  `### Ready to Chat!\n\nYour repository has been processed and I'm ready to answer questions about the code.` :
  `### Repository Processing\n\nYour repository is currently being processed. Once it's ready, I'll be able to answer detailed questions about the code.\n\n**Status**: ${repository.status}`
}

### What I Can Help You With

- Explain how specific features and functions work
- Analyze code architecture and design patterns  
- Walk through complex algorithms step-by-step
- Identify dependencies and relationships between components
- Suggest improvements and best practices

> **Note**: I provide detailed explanations with reasoning behind implementation decisions to help you understand the bigger picture.

### Getting Started

Try asking questions like:
- "How does authentication work?"
- "Explain the database schema"
- "What is the main application flow?"
- "How is error handling implemented?"`,
      timestamp: new Date(),
    }]);
    setMessageCount(0);
  };

  const loadChatHistory = async () => {
    setLoadingMessages(true);
    try {
      console.log('🔄 Loading chat history for repository:', repository.repository_id);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_QODEX_API_URL}/api/v1/chat/${repository.repository_id}/messages`, {
        headers: {
          'X-Client-Secret': process.env.NEXT_PUBLIC_QODEX_CLIENT_SECRET!,
          'X-User-ID': user!.$id,
        },
      });

      if (response.ok) {
        const chatData = await response.json();
        console.log('✅ Chat history loaded:', chatData);
        
        if (chatData.conversation_id) {
          setConversationId(chatData.conversation_id);
        }
        
        if (chatData.messages && chatData.messages.length > 0) {
          const formattedMessages: ChatMessage[] = chatData.messages.map((msg: any) => ({
            id: msg.id.toString(),
            role: msg.role,
            content: msg.content,
            sources: msg.citations || msg.sources || [],
            timestamp: new Date(msg.created_at),
          }));
          
          setMessages(formattedMessages);
          const userMessages = formattedMessages.filter(msg => msg.role === 'user');
          setMessageCount(userMessages.length);
          
          console.log(`📊 Loaded ${formattedMessages.length} messages, ${userMessages.length} from user`);
        } else {
          // No existing history, show welcome message
          showWelcomeMessage();
        }
      } else {
        console.warn('❌ Failed to load chat history:', response.status);
        showWelcomeMessage();
      }
    } catch (error) {
      console.error('❌ Error loading chat history:', error);
      showWelcomeMessage();
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading || !canSend) return;

    // Final quota check before sending
    if (userProfile?.subscription_tier === 'free' && conversationId !== null) {
      try {
        const canSendMsg = await canSendMessage(conversationId, user!.$id, userProfile);
        if (!canSendMsg) {
          return; // Let the quota warning show
        }
      } catch (error) {
        console.error('Error checking quota before send:', error);
        return;
      }
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_QODEX_API_URL}/api/v1/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Secret': process.env.NEXT_PUBLIC_QODEX_CLIENT_SECRET!,
          'X-User-ID': user!.$id,
        },
        body: JSON.stringify({
          query: input.trim(),
          repository_id: repository.repository_id,
        }),
      });

      if (response.ok) {
        const chatData: QodexChatResponse = await response.json();
        
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: chatData.response,
          sources: chatData.sources || [],
          timestamp: new Date(),
          model_used: chatData.model_used,
          context_chunks_used: chatData.context_chunks_used,
        };

        setMessages(prev => [...prev, assistantMessage]);
        setMessageCount(prev => prev + 1);
      } else {
        const errorData = await response.text();
        console.error('❌ QODEX API Error:', response.status, errorData);
        
        let errorMessage = 'Sorry, I encountered an error while processing your question.';
        try {
          const parsedError = JSON.parse(errorData);
          errorMessage = parsedError.detail || parsedError.error || errorMessage;
        } catch {
          // Use default error message
        }

        const errorResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `❌ Error: ${errorMessage}\n\nPlease try rephrasing your question or try again later.`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorResponse]);
      }
    } catch (error) {
      console.error('❌ Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Network error: Unable to connect to QODEX AI. Please check your connection and try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getQuotaInfo = () => {
    if (!userProfile) return null;
    
    if (userProfile.subscription_tier === 'premium') {
      return {
        text: 'Unlimited messages',
        color: 'text-green-600 dark:text-green-400',
        showCount: false
      };
    }
    
    const remaining = Math.max(0, 25 - messageCount);
    return {
      text: `${messageCount}/25 messages used`,
      color: messageCount >= 20 ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400',
      showCount: true,
      remaining
    };
  };

  // Enhanced markdown components for GitHub-like styling
  const markdownComponents = {
    // Headers
    h1: ({ children }: any) => (
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-xl font-bold mb-4 mt-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-lg font-semibold mb-3 mt-5 text-gray-800 dark:text-gray-200">
        {children}
      </h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="text-md font-semibold mb-2 mt-4 text-gray-800 dark:text-gray-200">
        {children}
      </h4>
    ),

    // Paragraphs
    p: ({ children }: any) => (
      <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
        {children}
      </p>
    ),

    // Lists
    ul: ({ children }: any) => (
      <ul className="mb-4 ml-6 space-y-2 list-disc">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="mb-4 ml-6 space-y-2 list-decimal">
        {children}
      </ol>
    ),
    li: ({ children }: any) => (
      <li className="leading-relaxed text-gray-700 dark:text-gray-300">
        {children}
      </li>
    ),

    // Code
    // Update the code component in your markdownComponents:
code: ({ inline, children, className }: any) => {
  // More reliable inline detection
  const isInline = inline !== false && !className?.includes('language-');
  
  return isInline ? (
    <code className="bg-gray-100 dark:bg-gray-800 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-200 dark:border-gray-600 inline">
      {children}
    </code>
  ) : (
    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto mb-4 border border-gray-200 dark:border-gray-600">
      <code className="text-sm font-mono text-gray-800 dark:text-gray-200 block">
        {children}
      </code>
    </pre>
  );
},

    // Blockquotes (for insights)
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-blue-400 bg-blue-50 dark:bg-blue-900/20 pl-4 py-2 my-4 italic">
        <div className="text-blue-800 dark:text-blue-200">
          {children}
        </div>
      </blockquote>
    ),

    // Emphasis
    strong: ({ children }: any) => (
      <strong className="font-semibold text-gray-900 dark:text-white">
        {children}
      </strong>
    ),
    em: ({ children }: any) => (
      <em className="italic text-gray-700 dark:text-gray-300">
        {children}
      </em>
    ),

    // Tables
    table: ({ children }: any) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border border-gray-200 dark:border-gray-600 rounded-lg">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: any) => (
      <thead className="bg-gray-50 dark:bg-gray-800">
        {children}
      </thead>
    ),
    tbody: ({ children }: any) => (
      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-600">
        {children}
      </tbody>
    ),
    th: ({ children }: any) => (
      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
        {children}
      </td>
    ),

    // Horizontal rules
    hr: () => (
      <hr className="border-t border-gray-300 dark:border-gray-600 my-6" />
    ),
  };

  // Check for Gemini quota error
  const hasQuotaError = (content: string) => {
    return content.includes('Gemini quota exceeded') || content.includes('quota') && content.includes('exceeded');
  };

  const quotaInfo = getQuotaInfo();

  // Updated loading screen with better messaging
  if (loadingMessages) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {isNewRepository ? 'Setting up chat...' : 'Loading chat history...'}
          </p>
          {isNewRepository && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Preparing your new repository
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center">
              <img
                src="/agent.png"
                alt="QODEX AI"
                className="w-6 h-6 object-contain"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">QODEX AI Chat</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Exploring <span className="font-medium">{repository.name}</span>
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-xs font-medium mb-1">
              AI Ready
            </div>
            {quotaInfo && (
              <p className={`text-xs ${quotaInfo.color}`}>
                {quotaInfo.text}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-6 space-y-6 bg-gray-50 dark:bg-gray-900">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-4xl ${
              message.role === 'user' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg'
            } rounded-2xl p-6 shadow-sm`}>
              
              {/* Message Content with Clean Markdown Rendering */}
              <div className="text-sm leading-relaxed">
                {message.role === 'user' ? (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                ) : hasQuotaError(message.content) ? (
                  // Show quota error
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                      <strong className="text-red-800 dark:text-red-200">Service Temporarily Unavailable</strong>
                    </div>
                    <p className="text-red-700 dark:text-red-300 mt-2">
                      The AI service is currently experiencing high demand. Please try again in a few minutes.
                    </p>
                  </div>
                ) : (
                  <div className="markdown-content">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={markdownComponents}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
              
              {/* Sources */}
              {message.sources && Array.isArray(message.sources) && message.sources.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-3 flex items-center">
                    <span className="mr-2">📚</span>Sources ({message.sources.length} found):
                  </p>
                  <div className="space-y-3">
                    {message.sources.map((source, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-mono text-xs font-medium text-purple-600 dark:text-purple-400 flex items-center">
                            <span className="mr-1">📄</span>
                            {source.file_path || 'Unknown file'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Lines {source.start_line || 0}-{source.end_line || 0} • {Math.round((source.similarity || 0) * 100)}% match
                          </div>
                        </div>
                        <div className="text-xs text-gray-700 dark:text-gray-300 font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                          {source.preview || source.content || 'No content available'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Message Footer */}
              <div className={`flex items-center justify-between mt-4 pt-3 border-t ${
                message.role === 'user' ? 'border-purple-500' : 'border-gray-200 dark:border-gray-600'
              }`}>
                <div className="text-xs opacity-75">
                  {formatTimestamp(message.timestamp)}
                </div>
                {message.role === 'assistant' && message.model_used && (
                  <div className="text-xs opacity-75">
                    {message.model_used} • {message.context_chunks_used} chunks used
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Loading Animation */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <img
                  src="/agent.png"
                  alt="QODEX AI"
                  className="w-5 h-5 object-contain"
                />
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-200"></div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">QODEX AI is analyzing your code...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Quota Warning with Upgrade Link */}
      {!canSend && quotaInfo && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-t border-red-200 dark:border-red-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Message limit reached (25/25)
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  You've reached the free tier limit for this repository
                </p>
              </div>
            </div>
            <Link
              href="/pricing"
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Crown className="w-4 h-4" />
              Upgrade to Pro
            </Link>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="flex space-x-3">
          <div className="flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={canSend ? "Ask about the code... (Press Enter to send, Shift+Enter for new line)" : "Message limit reached. Upgrade to premium for unlimited messages."}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              rows={2}
              disabled={loading || !canSend}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={loading || !input.trim() || !canSend}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white p-3 rounded-xl transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {/* Enhanced Quick Actions */}
        {canSend && (
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "How does authentication work?",
              "Explain the main application flow", 
              "What are the key components?",
              "How is data processing handled?"
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                disabled={loading}
                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900 hover:text-purple-600 dark:hover:text-purple-400 transition-colors disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}