'use client';

import { BookingStatus } from '@/types/booking';

export const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; className: string; dot: string }
> = {
  PENDING: {
    label: 'Chờ xác nhận',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
  },
  CHECKED_IN: {
    label: 'Đang ở',
    className: 'bg-green-100 text-green-700 border-green-200',
    dot: 'bg-green-500',
  },
  CHECKED_OUT: {
    label: 'Đã trả phòng',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  },
  CANCELLED: {
    label: 'Đã hủy',
    className: 'bg-red-100 text-red-700 border-red-200',
    dot: 'bg-red-500',
  },
  COMPLETED: {
    label: 'Đã hoàn thành',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  EXPIRED: {
    label: 'Đã hết hạn',
    className: 'bg-gray-100 text-gray-500 border-gray-200',
    dot: 'bg-gray-400',
  },
};

interface BookingStatusBadgeProps {
  status?: BookingStatus | null;
  showDot?: boolean;
  className?: string;
}

export default function BookingStatusBadge({
  status,
  showDot = false,
  className = '',
}: BookingStatusBadgeProps) {
  if (status === undefined || status === null) {
    return (
      <span
        className={`inline-flex items-center border font-semibold px-2.5 py-0.5 rounded-full text-xs bg-red-100 text-red-700 border-red-200 ${className}`}
      >
        {showDot && <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5" />}
        NO STATUS
      </span>
    );
  }

  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    className: 'bg-red-100 text-red-700 border-red-200',
    dot: 'bg-red-500',
  };

  return (
    <span
      className={`inline-flex items-center border font-semibold ${
        showDot
          ? 'gap-1.5 px-3 py-1 rounded-full text-sm'
          : 'px-2.5 py-0.5 rounded-full text-xs'
      } ${cfg.className} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
      {cfg.label}
    </span>
  );
}
