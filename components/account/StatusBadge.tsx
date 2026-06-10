import { BookingStatus } from '@/types/booking';

interface StatusBadgeProps {
  status: BookingStatus;
}

const STATUS_CONFIG: Record<BookingStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Chờ xác nhận',
    className: 'bg-amber-50 text-amber-700 ring-amber-600/20 border-amber-200/50',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    className: 'bg-sky-50 text-sky-700 ring-sky-600/20 border-sky-200/50',
  },
  CHECKED_IN: {
    label: 'Đã check-in',
    className: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20 border-indigo-200/50',
  },
  CHECKED_OUT: {
    label: 'Đã check-out',
    className: 'bg-slate-100 text-slate-700 ring-slate-600/20 border-slate-200/50',
  },
  COMPLETED: {
    label: 'Đã hoàn thành',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 border-emerald-200/50',
  },
  CANCELLED: {
    label: 'Đã hủy',
    className: 'bg-rose-50 text-rose-700 ring-rose-600/20 border-rose-200/50',
  },
  EXPIRED: {
    label: 'Hết hạn',
    className: 'bg-slate-50 text-slate-500 ring-slate-600/10 border-slate-200/30',
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    className: 'bg-slate-50 text-slate-600 ring-slate-600/10 border-slate-200/30',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset border ${config.className}`}>
      {config.label}
    </span>
  );
}
