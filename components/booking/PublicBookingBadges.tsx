'use client';

import { BookingStatus, PaymentStatus } from '@/types/booking';

// ============================================================
// Booking Status Badge (public-facing, same style as admin)
// ============================================================

const BOOKING_STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; className: string; dotClass: string }
> = {
  PENDING: {
    label: 'Chờ xác nhận',
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
    dotClass: 'bg-amber-500',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    className: 'bg-blue-50 text-blue-700 border border-blue-200',
    dotClass: 'bg-blue-500',
  },
  CHECKED_IN: {
    label: 'Đang ở',
    className: 'bg-green-50 text-green-700 border border-green-200',
    dotClass: 'bg-green-500',
  },
  CHECKED_OUT: {
    label: 'Đã trả phòng',
    className: 'bg-slate-100 text-slate-600 border border-slate-200',
    dotClass: 'bg-slate-400',
  },
  CANCELLED: {
    label: 'Đã huỷ',
    className: 'bg-red-50 text-red-700 border border-red-200',
    dotClass: 'bg-red-500',
  },
  COMPLETED: {
    label: 'Đã hoàn thành',
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  EXPIRED: {
    label: 'Hết hạn',
    className: 'bg-gray-100 text-gray-500 border border-gray-200',
    dotClass: 'bg-gray-400',
  },
};

interface BookingStatusBadgeProps {
  status: BookingStatus | null | undefined;
  size?: 'sm' | 'md' | 'lg';
}

export function PublicBookingStatusBadge({ status, size = 'md' }: BookingStatusBadgeProps) {
  if (!status) return null;
  const cfg = BOOKING_STATUS_CONFIG[status] ?? {
    label: status,
    className: 'bg-gray-100 text-gray-600 border border-gray-200',
    dotClass: 'bg-gray-500',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-sm px-4 py-1.5 gap-2 font-semibold',
  };

  const dotSizes = { sm: 'w-1.5 h-1.5', md: 'w-2 h-2', lg: 'w-2.5 h-2.5' };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${cfg.className}`}
    >
      <span className={`rounded-full flex-shrink-0 ${dotSizes[size]} ${cfg.dotClass}`} />
      {cfg.label}
    </span>
  );
}

// ============================================================
// Payment Status Badge
// ============================================================

const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  UNPAID: {
    label: 'Chưa thanh toán',
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  PAID: {
    label: 'Đã thanh toán',
    className: 'bg-green-50 text-green-700 border border-green-200',
  },
  REFUNDED: {
    label: 'Đã hoàn tiền',
    className: 'bg-blue-50 text-blue-700 border border-blue-200',
  },
  FAILED: {
    label: 'Thanh toán thất bại',
    className: 'bg-red-50 text-red-700 border border-red-200',
  },
};

interface PaymentStatusBadgeProps {
  status: PaymentStatus | null | undefined;
}

export function PublicPaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  if (!status) return null;
  const cfg = PAYMENT_STATUS_CONFIG[status] ?? {
    label: status,
    className: 'bg-gray-100 text-gray-600 border border-gray-200',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full text-sm px-3 py-1 font-medium ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}
