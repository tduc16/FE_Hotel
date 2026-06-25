'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from './types';
import { chatbotApiService } from './chatbot.service';
import MessageBubble from './MessageBubble';
import QuickActions from './QuickActions';
import TypingIndicator from './TypingIndicator';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  customerName?: string | null;
  customerToken?: string | null;
}

export default function ChatWindow({
  isOpen,
  onClose,
  customerName,
  customerToken,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lastSuggestions, setLastSuggestions] = useState<string[]>([]);
  const [hasGreeted, setHasGreeted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom khi có tin mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input khi mở
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Load session và gửi greeting khi lần đầu mở
  useEffect(() => {
    if (isOpen && !hasGreeted) {
      const storedSession = chatbotApiService.getSessionId();
      if (storedSession) setSessionId(storedSession);

      const greeting = customerName
        ? `Xin chào **${customerName}**! 👋 Tôi là AI Concierge của Khách sạn Hoàng Minh. Tôi có thể giúp gì cho Quý khách hôm nay?`
        : 'Xin chào Quý khách! 👋 Tôi là AI Concierge của Khách sạn Hoàng Minh. Tôi có thể giúp gì cho Quý khách?';

      setMessages([
        {
          id: uuidv4(),
          role: 'assistant',
          content: greeting,
          timestamp: new Date(),
        },
      ]);
      setHasGreeted(true);
    }
  }, [isOpen, hasGreeted, customerName]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      setInput('');
      setLastSuggestions([]);

      // Thêm user message
      const userMsg: ChatMessage = {
        id: uuidv4(),
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      try {
        const currentSessionId = sessionId || chatbotApiService.getSessionId() || undefined;
        const token = customerToken || chatbotApiService.getCustomerToken() || undefined;

        const response = await chatbotApiService.sendMessage(trimmed, currentSessionId, token);

        // Lưu sessionId mới
        if (response.sessionId) {
          setSessionId(response.sessionId);
          chatbotApiService.saveSessionId(response.sessionId);
        }

        const botMsg: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: response.reply,
          intent: response.intent,
          timestamp: new Date(),
          actions: response.actions,
        };

        setMessages((prev) => [...prev, botMsg]);
        setLastSuggestions(response.suggestions || []);
      } catch (err: any) {
        const errorMsg: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: 'Xin lỗi, đã xảy ra lỗi kết nối. Vui lòng thử lại hoặc liên hệ lễ tân.',
          timestamp: new Date(),
          isError: true,
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsTyping(false);
      }
    },
    [isTyping, sessionId, customerToken],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const showQuickActions = messages.length <= 1 && !isTyping;

  return (
    <div
      className="flex flex-col"
      style={{
        height: '100%',
        background: 'linear-gradient(180deg, #0d0800 0%, #1a1005 100%)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{
          background: 'linear-gradient(135deg, #1a0e00, #2d1a00)',
          borderBottom: '1px solid rgba(184,134,11,0.3)',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold tracking-tight flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #b8860b, #ffd700)', color: '#0d0800' }}
          >
            HM
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: '#ffd700' }}>
              AI Concierge
            </p>
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: '#4ade80', animation: 'pulse 2s infinite' }}
              />
              <p className="text-[10px]" style={{ color: '#a08060' }}>
                Hoàng Minh Hotel • Trực tuyến
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
          style={{ color: '#a08060' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            close
          </span>
        </button>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto px-3 py-3"
        style={{ minHeight: 0, scrollbarWidth: 'thin', scrollbarColor: 'rgba(184,134,11,0.3) transparent' }}
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {showQuickActions && (
        <div
          style={{ borderTop: '1px solid rgba(184,134,11,0.15)', paddingTop: '8px' }}
        >
          <QuickActions onSelect={sendMessage} />
        </div>
      )}

      {/* Suggestions sau mỗi reply */}
      {!showQuickActions && lastSuggestions.length > 0 && !isTyping && (
        <div style={{ borderTop: '1px solid rgba(184,134,11,0.1)', paddingTop: '6px' }}>
          <QuickActions onSelect={sendMessage} suggestions={lastSuggestions} />
        </div>
      )}

      {/* Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-3 py-3 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(184,134,11,0.2)' }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn..."
          maxLength={500}
          disabled={isTyping}
          className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none transition-all"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(184,134,11,0.25)',
            color: '#f5e6c8',
            fontSize: '13px',
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: input.trim() && !isTyping
              ? 'linear-gradient(135deg, #b8860b, #ffd700)'
              : 'rgba(184,134,11,0.2)',
            color: input.trim() && !isTyping ? '#0d0800' : '#b8860b',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            send
          </span>
        </button>
      </form>
    </div>
  );
}
