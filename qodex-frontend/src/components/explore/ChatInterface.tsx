/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useRef } from 'react';
import { Repository, QodexChatResponse, ChatMessage } from '@/types';
import { useAuth } from '@/hooks/useAuth';

interface ChatInterfaceProps {
  repository: Repository;
}

export default function ChatInterface({ repository }: ChatInterfaceProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load existing messages from QODEX API
  useEffect(() => {
    loadChatHistory();
  }, [repository]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChatHistory = async () => {
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
        
        if (chatData.messages && chatData.messages.length > 0) {
          const formattedMessages: ChatMessage[] = chatData.messages.map((msg: any) => ({
            id: msg.id.toString(),
            role: msg.role,
            content: msg.content,
            sources: msg.citations || msg.sources || [], // Handle both field names
            timestamp: new Date(msg.created_at),
          }));
          
          setMessages(formattedMessages);
        } else {
          // Add welcome message if no history
          setMessages([{
            id: 'welcome',
            role: 'assistant',
            content: `Welcome to QODEX AI! 🤖\n\nI'm here to help you explore **${repository.name}**. You can ask me questions like:\n\n• "How does authentication work?"\n• "What is the main function?"\n• "Show me the API endpoints"\n• "Explain the database schema"\n• "What dependencies does this project use?"\n• "How is error handling implemented?"\n\nWhat would you like to know about this codebase?`,
            timestamp: new Date(),
          }]);
        }
      } else {
        console.warn('❌ Failed to load chat history:', response.status);
        // Add welcome message as fallback
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: `Welcome to QODEX AI! 🤖\n\nI'm ready to help you explore **${repository.name}**. Ask me anything about the code!`,
          timestamp: new Date(),
        }]);
      }
    } catch (error) {
      console.error('❌ Error loading chat history:', error);
      // Add welcome message as fallback
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Welcome to QODEX AI! 🤖\n\nI'm ready to help you explore **${repository.name}**. Ask me anything about the code!`,
        timestamp: new Date(),
      }]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

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
      console.log('🚀 Sending message to QODEX:', {
        query: input.trim(),
        repository_id: repository.repository_id,
      });

      // Call your QODEX chat API
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
        console.log('✅ QODEX AI Response:', chatData);
        
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: chatData.response,
          sources: chatData.sources || [], // Ensure it's always an array
          timestamp: new Date(),
          model_used: chatData.model_used,
          context_chunks_used: chatData.context_chunks_used,
        };

        setMessages(prev => [...prev, assistantMessage]);
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

  if (loadingMessages) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading chat history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">QODEX AI Chat</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ask questions about <span className="font-medium">{repository.name}</span>
            </p>
          </div>
          <div className="text-right">
            <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs font-medium">
              🤖 AI Ready
            </div>
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
            } rounded-2xl p-4 shadow-sm`}>
              
              {/* Message Content */}
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
              
              {/* Sources - Now properly typed with central interface */}
              {message.sources && Array.isArray(message.sources) && message.sources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-3 flex items-center">
                    📚 Sources ({message.sources.length} found):
                  </p>
                  <div className="space-y-3">
                    {message.sources.map((source, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-mono text-xs font-medium text-purple-600 dark:text-purple-400">
                            📄 {source.file_path || 'Unknown file'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Lines {source.start_line || 0}-{source.end_line || 0} • {Math.round((source.similarity || 0) * 100)}% match
                          </div>
                        </div>
                        <div className="text-xs text-gray-700 dark:text-gray-300 font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                          {/* Handle both preview (from history) and content (from direct chat) */}
                          {source.preview || source.content || 'No content available'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Message Footer */}
              <div className={`flex items-center justify-between mt-3 pt-2 border-t ${
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
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

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="flex space-x-3">
          <div className="flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about the code... (Press Enter to send, Shift+Enter for new line)"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none transition-all"
              rows={2}
              disabled={loading}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-3 rounded-xl transition-all transform hover:scale-105 disabled:scale-100 font-medium"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              '🚀 Send'
            )}
          </button>
        </div>
        
        {/* Quick Actions */}
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            "How does authentication work?",
            "What is the main function?", 
            "Show me the API endpoints",
            "Explain the project structure"
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setInput(suggestion)}
              disabled={loading}
              className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}