'use client';

import { QUICK_ACTIONS } from './types';

interface QuickActionsProps {
  onSelect: (message: string) => void;
  suggestions?: string[];
}

export default function QuickActions({ onSelect, suggestions }: QuickActionsProps) {
  // Nếu có suggestions từ bot thì ưu tiên hiện suggestions
  if (suggestions && suggestions.length > 0) {
    return (
      <div className="flex flex-wrap gap-2 px-3 pb-2">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onSelect(s)}
            className="text-xs px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(184,134,11,0.12)',
              border: '1px solid rgba(184,134,11,0.35)',
              color: '#ffd700',
              fontSize: '11px',
            }}
          >
            {s}
          </button>
        ))}
      </div>
    );
  }

  // Default: hiện 6 quick actions ban đầu
  return (
    <div className="px-3 pb-2">
      <p className="text-xs mb-2 opacity-50" style={{ color: '#d4a017' }}>
        Tôi có thể giúp bạn:
      </p>
      <div className="grid grid-cols-2 gap-2">
        {QUICK_ACTIONS.map((action, i) => (
          <button
            key={i}
            onClick={() => onSelect(action.message)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group"
            style={{
              background: 'rgba(184,134,11,0.08)',
              border: '1px solid rgba(184,134,11,0.2)',
            }}
          >
            <span className="text-base flex-shrink-0">{action.icon}</span>
            <span
              className="text-xs font-medium leading-tight"
              style={{ color: '#d4b896' }}
            >
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
