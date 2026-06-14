'use client';

import { ChatMessage } from './types';

interface MessageBubbleProps {
  message: ChatMessage;
}

function formatContent(content: string): React.ReactNode {
  // Convert markdown-like bold **text** and newlines
  const parts = content.split(/(\*\*[^*]+\*\*|\n)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} style={{ color: '#ffd700', fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part === '\n') return <br key={i} />;
    return part;
  });
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  const timeStr = message.timestamp.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isUser) {
    return (
      <div className="flex items-end justify-end gap-2 mb-4">
        <div className="flex flex-col items-end gap-1 max-w-[75%]">
          <div
            className="px-4 py-3 rounded-2xl rounded-br-sm text-sm leading-relaxed"
            style={{
              background: 'linear-gradient(135deg, #b8860b, #d4a017)',
              color: '#0d0800',
              fontWeight: 500,
            }}
          >
            {message.content}
          </div>
          <span className="text-xs opacity-50" style={{ color: '#b8860b' }}>
            {timeStr}
          </span>
        </div>
        {/* User Avatar */}
        <div
          className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs"
          style={{ background: 'rgba(184,134,11,0.15)', border: '1px solid rgba(184,134,11,0.4)', color: '#ffd700' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
            person
          </span>
        </div>
      </div>
    );
  }

  // Bot message
  return (
    <div className="flex items-end gap-2 mb-4">
      {/* Bot Avatar */}
      <div
        className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold tracking-tight"
        style={{ background: 'linear-gradient(135deg, #b8860b, #ffd700)', color: '#1a1008' }}
      >
        HM
      </div>

      <div className="flex flex-col gap-1 max-w-[80%]">
        <div
          className="px-4 py-3 rounded-2xl rounded-bl-sm text-sm leading-relaxed"
          style={{
            background: 'linear-gradient(135deg, #1e1208, #2a1a0a)',
            border: '1px solid rgba(184,134,11,0.25)',
            color: '#f5e6c8',
          }}
        >
          {message.isError ? (
            <span style={{ color: '#ff6b6b' }}>{message.content}</span>
          ) : (
            formatContent(message.content)
          )}
        </div>
        <span className="text-xs opacity-40 ml-1" style={{ color: '#b8860b' }}>
          {timeStr}
        </span>
      </div>
    </div>
  );
}
