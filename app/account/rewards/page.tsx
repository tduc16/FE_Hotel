'use client';

import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { MEMBERSHIP_CONFIG, MembershipLevel } from '@/types/customer';
import MembershipProgress from '@/components/account/MembershipProgress';
import { Star, ShieldCheck, Check } from 'lucide-react';

export default function RewardsPage() {
  const { customer } = useCustomerAuth();

  const currentLevel = customer?.membership_level ?? 'STANDARD';
  const points = customer?.loyalty_points ?? 0;

  const levels: MembershipLevel[] = ['STANDARD', 'SILVER', 'GOLD', 'PLATINUM'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Chương trình Điểm thưởng</h1>
        <p className="text-sm text-slate-500 mt-1">
          Tích lũy điểm khi đặt phòng tại Hotel Hoang Minh để thăng hạng và tận hưởng những ưu đãi đặc biệt.
        </p>
      </div>

      {/* Progress Card */}
      <MembershipProgress points={points} currentLevel={currentLevel} />

      {/* Benefits Details */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="text-primary" size={20} />
          Đặc quyền của các hạng thành viên
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {levels.map((lvl) => {
            const config = MEMBERSHIP_CONFIG[lvl];
            const isCurrent = currentLevel === lvl;

            return (
              <div
                key={lvl}
                className={`bg-white rounded-2xl border p-6 flex flex-col justify-between shadow-xs transition-all relative ${
                  isCurrent
                    ? 'border-primary ring-2 ring-primary/10 scale-[1.02] md:scale-100 xl:scale-[1.02]'
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                {/* Active Indicator */}
                {isCurrent && (
                  <span className="absolute -top-3 right-6 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                    Hạng hiện tại
                  </span>
                )}

                <div>
                  {/* Name + points range */}
                  <div className="border-b border-slate-50 pb-4 mb-4">
                    <h3
                      className="text-lg font-bold"
                      style={{ color: config.color }}
                    >
                      {config.label}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {config.maxPoints
                        ? `${config.minPoints} - ${config.maxPoints} điểm`
                        : `>= ${config.minPoints} điểm`}
                    </p>
                  </div>

                  {/* Benefits List */}
                  <ul className="space-y-3">
                    {config.benefits.map((benefit, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2 text-slate-600 text-xs">
                        <Check size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{benefit.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-50 text-[10px] text-slate-400 font-medium">
                  {lvl === 'STANDARD' && 'Khởi đầu chuyến hành trình'}
                  {lvl === 'SILVER' && 'Nhận thêm các ưu đãi dịch vụ'}
                  {lvl === 'GOLD' && 'Nâng tầm kỳ nghỉ của bạn'}
                  {lvl === 'PLATINUM' && 'Đặc quyền tối thượng 24/7'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rules Description */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-sm text-slate-600 space-y-3">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Star size={16} className="text-amber-500" />
          Quy tắc tích lũy và sử dụng điểm
        </h3>
        <ul className="list-disc pl-5 space-y-2 text-xs text-slate-500">
          <li>Điểm thưởng được tích lũy tự động dựa trên số tiền thanh toán thực tế của mỗi đặt phòng thành công.</li>
          <li>Quy đổi mặc định: mỗi 100.000 VNĐ chi tiêu tương đương với 1 điểm cơ sở (Hạng Silver/Gold/Platinum có hệ số tích điểm cao hơn).</li>
          <li>Hạng thành viên được cập nhật ngay lập tức sau khi khách hàng đạt đủ điều kiện điểm số tích lũy.</li>
          <li>Điểm thưởng tích lũy có giá trị sử dụng trọn đời đối với tài khoản khách hàng hoạt động liên tục.</li>
        </ul>
      </div>
    </div>
  );
}
