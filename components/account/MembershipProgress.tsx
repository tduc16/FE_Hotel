'use client';

import { MembershipLevel, MEMBERSHIP_CONFIG, getNextMembership, getMembershipProgress } from '@/types/customer';
import { Sparkles, Trophy } from 'lucide-react';

interface MembershipProgressProps {
  points: number;
  currentLevel: MembershipLevel;
}

export default function MembershipProgress({ points, currentLevel }: MembershipProgressProps) {
  const currentConfig = MEMBERSHIP_CONFIG[currentLevel];
  const nextLevel = getNextMembership(currentLevel);
  const nextConfig = nextLevel ? MEMBERSHIP_CONFIG[nextLevel] : null;
  const progress = getMembershipProgress(points, currentLevel);

  const pointsToNext = nextConfig ? nextConfig.minPoints - points : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Hạng thành viên
          </span>
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold text-slate-900">{currentConfig.label}</h3>
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ backgroundColor: currentConfig.bgColor, color: currentConfig.color }}
            >
              {points} điểm
            </span>
          </div>
        </div>

        {nextConfig && (
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
            <Trophy size={16} className="text-amber-500 flex-shrink-0" />
            <span>
              Cần thêm <strong className="text-slate-800 font-semibold">{pointsToNext} điểm</strong> để lên{' '}
              <strong className="text-slate-800 font-semibold">{nextConfig.label}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {nextConfig ? (
        <div className="space-y-2">
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-medium text-slate-400">
            <span>{currentConfig.minPoints} điểm</span>
            <span>{progress}%</span>
            <span>{nextConfig.minPoints} điểm</span>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-100/50 rounded-xl p-4 flex items-start gap-3">
          <Sparkles className="text-violet-500 mt-0.5 flex-shrink-0" size={18} />
          <div>
            <p className="text-sm font-semibold text-violet-900">Chúc mừng! Bạn đã đạt hạng cao nhất</p>
            <p className="text-xs text-violet-700/80 mt-0.5">
              Bạn đang nhận được toàn bộ quyền lợi đặc quyền của khách hàng Platinum.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
