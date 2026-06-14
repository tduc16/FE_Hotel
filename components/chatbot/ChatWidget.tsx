'use client';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import ChatWindow from './ChatWindow';
export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [customerToken, setCustomerToken] = useState<string | null>(null);
  const pathname = usePathname();
  const { customer, isAuthenticated } = useCustomerAuth();
  // Tránh hydration mismatch
  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('customer_access_token');
    setCustomerToken(token);
  }, []);
  // Cập nhật token khi customer thay đổi (login/logout)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('customer_access_token');
      setCustomerToken(token);
    }
  }, [isAuthenticated, customer]);
  // Không render trên trang admin
  if (pathname?.startsWith('/admin')) return null;
  if (!mounted) return null;
  const toggleChat = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) setHasUnread(false);
  };
  return (
    <>
      {/* Overlay mờ khi mở trên mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 sm:hidden"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
          onClick={toggleChat}
        />
      )}
      {/* Chat Panel */}
      <div
        className="fixed z-50 transition-all duration-300 ease-in-out"
        style={{
          bottom: '90px',
          right: '20px',
          // Mobile: full width
          width: isOpen ? 'min(380px, calc(100vw - 24px))' : '0',
          height: isOpen ? '580px' : '0',
          maxHeight: isOpen ? 'calc(100vh - 120px)' : '0',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transformOrigin: 'bottom right',
          transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(20px)',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: isOpen
            ? '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(184,134,11,0.25), 0 0 40px rgba(184,134,11,0.08)'
            : 'none',
        }}
      >
        <ChatWindow
          isOpen={isOpen}
          onClose={toggleChat}
          customerName={customer?.fullName || null}
          customerToken={customerToken}
        />
      </div>
      {/* Floating Toggle Button */}
      <button
        onClick={toggleChat}
        aria-label={isOpen ? 'Đóng chat' : 'Mở chat với AI Concierge'}
        className="fixed z-50 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          bottom: '20px',
          right: '20px',
          width: '58px',
          height: '58px',
          borderRadius: '50%',
          background: isOpen
            ? 'linear-gradient(135deg, #1a0e00, #2d1a00)'
            : 'linear-gradient(135deg, #b8860b, #ffd700)',
          border: isOpen ? '2px solid rgba(184,134,11,0.5)' : 'none',
          boxShadow: isOpen
            ? '0 4px 20px rgba(0,0,0,0.4)'
            : '0 6px 24px rgba(184,134,11,0.45), 0 2px 8px rgba(0,0,0,0.3)',
          color: isOpen ? '#ffd700' : '#0d0800',
        }}
      >
        {/* Unread badge */}
        {hasUnread && !isOpen && (
          <span
            className="absolute top-0 right-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black"
            style={{ background: '#ef4444', color: '#fff', transform: 'translate(25%, -25%)' }}
          >
            1
          </span>
        )}
        {/* Pulse ring khi đóng */}
        {!isOpen && (
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background: 'rgba(184,134,11,0.3)',
              animation: 'chatPulse 2.5s ease-out infinite',
            }}
          />
        )}
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: '26px',
            transition: 'transform 0.3s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          {isOpen ? 'keyboard_arrow_down' : 'support_agent'}
        </span>
      </button>
      {/* Tooltip label khi đóng */}
      {!isOpen && (
        <div
          className="fixed z-40 transition-all duration-200"
          style={{
            bottom: '28px',
            right: '86px',
            background: 'linear-gradient(135deg, #1a0e00, #2d1a00)',
            border: '1px solid rgba(184,134,11,0.35)',
            borderRadius: '12px',
            padding: '6px 12px',
            pointerEvents: 'none',
          }}
        >
          <p className="text-xs font-semibold whitespace-nowrap" style={{ color: '#ffd700' }}>
            AI Concierge
          </p>
          <p className="text-[10px]" style={{ color: '#a08060' }}>
            Hoàng Minh Hotel
          </p>
          {/* Arrow */}
          <span
            className="absolute top-1/2 -translate-y-1/2"
            style={{
              right: '-6px',
              width: 0,
              height: 0,
              borderTop: '5px solid transparent',
              borderBottom: '5px solid transparent',
              borderLeft: '6px solid rgba(184,134,11,0.35)',
            }}
          />
        </div>
      )}
      {/* Global keyframe for pulse + chatbot styles */}
      <style jsx global>{`
        @keyframes chatPulse {
          0% { transform: scale(1); opacity: 0.7; }
          70% { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        /* Scrollbar chatbot */
        .chatbot-scroll::-webkit-scrollbar { width: 4px; }
        .chatbot-scroll::-webkit-scrollbar-track { background: transparent; }
        .chatbot-scroll::-webkit-scrollbar-thumb { background: rgba(184,134,11,0.3); border-radius: 2px; }
        /* Mobile full screen */
        @media (max-width: 480px) {
          .chatbot-panel-open {
            bottom: 0 !important;
            right: 0 !important;
            width: 100vw !important;
            height: 100dvh !important;
            max-height: 100dvh !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
    </>
  );
}