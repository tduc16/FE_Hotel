'use client';

export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      {/* Bot Avatar */}
      <div
        className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
        style={{ background: 'linear-gradient(135deg, #b8860b, #ffd700)', color: '#1a1008' }}
      >
        HM
      </div>

      {/* Bubble */}
      <div
        className="px-4 py-3 rounded-2xl rounded-bl-sm max-w-[80px]"
        style={{
          background: 'linear-gradient(135deg, #1e1208, #2a1a0a)',
          border: '1px solid rgba(184,134,11,0.3)',
        }}
      >
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block w-2 h-2 rounded-full"
              style={{
                background: '#b8860b',
                animation: `typingDot 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes typingDot {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
