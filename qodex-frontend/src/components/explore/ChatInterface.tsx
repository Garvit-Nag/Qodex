/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useRef } from 'react';
import { Repository, QodexChatResponse, ChatMessage } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { canSendMessage } from '@/lib/quota';
import { AlertCircle, Send, Crown } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ChatHeader from './ChatHeader';
import ChatSources from './ChatSources';
import CustomLoader from '../ui/LoaderComponent';

interface ChatInterfaceProps {
  repository: Repository;
}

export default function ChatInterface({ repository }: ChatInterfaceProps) {
  const { user, userProfile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [messageCount, setMessageCount] = useState(0);
  const [canSend, setCanSend] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isNewRepository, setIsNewRepository] = useState(false);
  const [showQuote, setShowQuote] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quotes = [
    "Code is poetry written in logic.",
    "Every expert was once a beginner.",
    "The best code is no code at all.",
    "Simplicity is the ultimate sophistication.",
    "Clean code always looks like it was written by someone who cares.",
    "Programming is the art of telling another human what one wants the computer to do.",
    "The most important property of a program is whether it accomplishes the intention of its user."
  ];

  const [currentQuote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

  useEffect(() => {
    if (repository && user) {
      setMessages([]);
      setMessageCount(0);
      setConversationId(null);
      setShowQuote(true);
      setLoadingMessages(true);

      const repoCreatedAt = new Date(repository.created_at);
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      const isRecentlyCreated = repoCreatedAt > fiveMinutesAgo;
      setIsNewRepository(isRecentlyCreated);

      if (isRecentlyCreated && repository.status !== 'READY') {
        console.log('🆕 New repository detected, skipping history load');
        setLoadingMessages(false);
        setShowQuote(true);
      } else {
        loadChatHistory();
      }
    }
  }, [repository, user]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'user') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (userProfile) {
      console.log('🔄 Checking quota - messageCount:', messageCount, 'tier:', userProfile.subscription_tier);
      checkQuota();
    }
  }, [userProfile, conversationId, messageCount]);

  const checkQuota = async () => {
    if (!userProfile) {
      setCanSend(true);
      return;
    }

    if (userProfile.subscription_tier === 'premium') {
      setCanSend(true);
      return;
    }

    if (messageCount >= 25) {
      console.log('🚫 Quota exceeded:', messageCount, 'messages sent');
      setCanSend(false);
      return;
    }

    if (conversationId !== null) {
      try {
        const canSendMsg = await canSendMessage(conversationId, user!.$id, userProfile);
        console.log('📊 API quota check:', canSendMsg);
        setCanSend(canSendMsg);
      } catch (error) {
        console.error('Error checking quota:', error);
        setCanSend(false);
      }
    } else {
      setCanSend(true);
    }

  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const messagesContainer = document.querySelector('.messages-container');
      if (!messagesContainer) {
        console.log('❌ Messages container not found');
        return;
      }

      console.log('✅ Messages container found, adding scroll listener');

      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
        console.log('Scroll:', { scrollTop, scrollHeight, clientHeight, isNearBottom, showButton: !isNearBottom });
        setShowScrollButton(!isNearBottom && messages.length > 3); 
      };

      handleScroll();

      messagesContainer.addEventListener('scroll', handleScroll);
      return () => {
        console.log('🧹 Removing scroll listener');
        messagesContainer.removeEventListener('scroll', handleScroll);
      };
    }, 100);

    return () => clearTimeout(timer);
  }, [messages]); 

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
          setShowQuote(false);

          console.log(`📊 Loaded ${formattedMessages.length} messages, ${userMessages.length} from user`);
        } else {
          setShowQuote(true);
        }
      } else {
        console.warn('❌ Failed to load chat history:', response.status);
        setShowQuote(true);
      }
    } catch (error) {
      console.error('❌ Error loading chat history:', error);
      setShowQuote(true);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    const inputValue = inputRef.current?.value || '';
    if (!inputValue.trim() || loading || !canSend) return;

    setShowQuote(false);

    if (userProfile?.subscription_tier === 'free' && conversationId !== null) {
      try {
        const canSendMsg = await canSendMessage(conversationId, user!.$id, userProfile);
        if (!canSendMsg) {
          return;
        }
      } catch (error) {
        console.error('Error checking quota before send:', error);
        return;
      }
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    if (inputRef.current) inputRef.current.value = '';
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
          query: inputValue.trim(),
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      color: messageCount >= 20 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-white/60',
      showCount: true,
      remaining
    };
  };

  const markdownComponents = {
    h1: ({ children }: any) => (
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-b border-gray-300 dark:border-white/30 pb-2">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-xl font-bold mb-4 mt-6 text-gray-900 dark:text-white border-b border-gray-300 dark:border-white/30 pb-2">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-lg font-semibold mb-3 mt-5 text-gray-800 dark:text-gray-200">
        {children}
      </h3>
    ),
    p: ({ children }: any) => (
      <p className="mb-4 leading-relaxed text-gray-700 dark:text-white/80">
        {children}
      </p>
    ),
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
      <li className="leading-relaxed text-gray-700 dark:text-white/80">
        {children}
      </li>
    ),
    code: ({ inline, children, className }: any) => {
      const isInline = inline !== false && !className?.includes('language-');
      return isInline ? (
        <code className="bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 px-1.5 py-0.5 rounded text-sm font-mono">
          {children}
        </code>
      ) : (
        <pre className="border border-gray-300 dark:border-gray-600 p-4 rounded-xl overflow-x-auto mb-4">
          <code className="text-sm font-mono text-gray-800 dark:text-white/80">
            {children}
          </code>
        </pre>
      );
    },
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-gray-400 dark:border-gray-500 bg-white/90 dark:bg-white/5 pl-4 py-2 my-4 italic rounded-r-lg backdrop-blur-md">
        <div className="text-gray-800 dark:text-gray-200">
          {children}
        </div>
      </blockquote>
    ),
    strong: ({ children }: any) => (
      <strong className="font-semibold text-gray-900 dark:text-white">
        {children}
      </strong>
    ),
  };

  const hasQuotaError = (content: string) => {
    return content.includes('Gemini quota exceeded') || content.includes('quota') && content.includes('exceeded');
  };

  const quotaInfo = getQuotaInfo();

  if (loadingMessages) {
    return (
      <CustomLoader />
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      <ChatHeader
        repository={repository}
        userProfile={userProfile}
        messageCount={messageCount}
      />

      <div className="messages-container flex-1 overflow-auto px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6 custom-scrollbar">
        {showQuote && messages.length === 0 && (
          <div className="flex justify-center py-8 md:py-12">
            <div className="text-center max-w-md px-4">
              <p className="text-base md:text-lg italic text-gray-600 dark:text-gray-400 leading-relaxed">
                &quot;{currentQuote}&quot;
              </p>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-500 mt-4">
                Start exploring your codebase by asking a question below
              </p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] md:max-w-[calc(100%-2rem)] ${message.role === 'user'
              ? 'bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white'
              : 'border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white'
              } rounded-2xl p-4 md:p-6 shadow-lg transition-all duration-300 break-words`}>

              <div className="text-sm leading-relaxed">
                {message.role === 'user' ? (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                ) : hasQuotaError(message.content) ? (
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

              {message.role === 'assistant' && message.sources && Array.isArray(message.sources) && message.sources.length > 0 && (
                <ChatSources sources={message.sources} />
              )}

              <div className={`flex items-center justify-between mt-4 pt-3 border-t border-gray-300 dark:border-white/30`}>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTimestamp(message.timestamp)}
                </div>
                {message.role === 'assistant' && message.model_used && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {message.model_used} • {message.context_chunks_used} chunks used
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-3">
              <img
                src="/agent-light.png"
                alt="QODEX AI"
                className="w-8 h-8 object-contain dark:hidden"
              />
              <img
                src="/agent.png"
                alt="QODEX AI"
                className="w-8 h-8 object-contain hidden dark:block"
              />
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-200"></div>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">QODEX AI is analyzing your code...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {showScrollButton && (
        <div className="fixed bottom-32 md:bottom-28 right-4 md:right-6 z-50">
          <button
            onClick={scrollToBottom}
            className="bg-white/90 dark:bg-white/10 backdrop-blur-md border border-gray-300 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/20 text-gray-700 dark:text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 animate-bounce-slow"
            aria-label="Scroll to bottom"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>
        </div>
      )}


      {!canSend && quotaInfo && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-t border-red-200 dark:border-red-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Message limit reached (25/25)
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  You&apos;ve reached the free tier limit for this repository
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

      <div className="border-t border-gray-300 dark:border-white/20 bg-white/50 dark:bg-white/5 px-3 md:px-4 py-3 md:py-4">
        <div className="flex items-center gap-2 md:gap-3 bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-xl md:rounded-2xl px-3 md:px-4 py-2.5 md:py-3 shadow-lg">
          <input
            ref={inputRef}
            type="text"
            defaultValue=""
            onKeyDown={handleKeyPress}
            placeholder="Ask me anything about the code..."
            disabled={loading || !canSend}
            className="flex-1 bg-transparent text-sm md:text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50 focus:outline-none disabled:opacity-50 overflow-x-auto whitespace-nowrap scrollbar-hide"
            style={{
              textOverflow: 'clip',
              overflowX: 'auto',
              overflowY: 'hidden',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !canSend}
            className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-200 dark:hover:bg-gray-300 text-white dark:text-black p-2 md:p-2.5 rounded-lg md:rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:scale-100 shadow-lg flex-shrink-0"
            aria-label="Send message"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-4 h-4 md:w-5 md:h-5" />
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}