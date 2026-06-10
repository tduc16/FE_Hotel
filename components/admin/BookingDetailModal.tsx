'use client';

import { useEffect, useRef } from 'react';
import { Booking, BookingStatus, PaymentStatus } from '@/types/booking';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(iso?: string | null) {
  if (!iso) return "--";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "--";
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function fmtCurrency(n?: number | string | null) {
  const num = Number(n);
  if (n == null || isNaN(num)) return "—";
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<BookingStatus, { label: string; bg: string; dot: string }> = {
  PENDING:     { label: 'Chờ xác nhận', bg: 'bg-amber-50 border-amber-200',  dot: 'bg-amber-400' },
  CONFIRMED:   { label: 'Đã xác nhận',  bg: 'bg-blue-50 border-blue-200',    dot: 'bg-blue-500' },
  CHECKED_IN:  { label: 'Đang ở',       bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
  CHECKED_OUT: { label: 'Đã trả phòng', bg: 'bg-slate-50 border-slate-200',  dot: 'bg-slate-400' },
  COMPLETED:   { label: 'Đã hoàn thành', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-600' },
  CANCELLED:   { label: 'Đã hủy',       bg: 'bg-red-50 border-red-200',      dot: 'bg-red-500' },
  EXPIRED:     { label: 'Đã hết hạn',   bg: 'bg-slate-50 border-slate-200',  dot: 'bg-slate-400' },
};

const PAYMENT_CFG: Record<PaymentStatus, { label: string; cls: string }> = {
  unpaid:   { label: 'Chưa thanh toán', cls: 'text-orange-600 bg-orange-50 border-orange-200' },
  paid:     { label: 'Đã thanh toán',   cls: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  refunded: { label: 'Đã hoàn tiền',    cls: 'text-purple-600 bg-purple-50 border-purple-200' },
};

// ─── Row helper ──────────────────────────────────────────────────────────────

function Row({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <span className="material-symbols-outlined text-[18px] text-slate-400 mt-0.5 flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <div className="text-sm text-slate-800">{children}</div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  booking: Booking | null;
  onClose: () => void;
  onViewDetail?: (id: string) => void;
}

export default function BookingDetailModal({ booking, onClose, onViewDetail }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    if (booking) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [booking]);

  if (!booking) return null;

  const actualStatus = booking.status ?? booking.bookingStatus ?? booking.booking_status ?? 'PENDING';
  const status = STATUS_CFG[actualStatus] ?? { label: actualStatus, bg: 'bg-slate-50 border-slate-200', dot: 'bg-slate-400' };
  const payment = PAYMENT_CFG[booking.payment_status] ?? { label: booking.payment_status, cls: 'text-slate-600' };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ animation: 'modalIn 0.2s cubic-bezier(.16,1,.3,1)' }}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Mã booking</p>
              <h2 className="text-lg font-bold text-slate-900 font-mono">#{booking.bookingCode || booking.booking_code || '—'}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors flex-shrink-0"
              aria-label="Đóng"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Status pill */}
          <div className={`inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full border text-sm font-semibold ${status.bg}`}>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${status.dot}`} />
            {status.label}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
          {/* Room */}
          <Row icon="bed" label="Phòng">
            <span className="font-semibold">{booking.room?.name || '—'}</span>
          </Row>

          {/* Customer */}
          <Row icon="person" label="Khách hàng">
            <p className="font-semibold">{booking.customerName || booking.guestName || booking.customer?.name || '—'}</p>
            {booking.customer?.email && (
              <p className="text-slate-500 text-xs mt-0.5">{booking.customer.email}</p>
            )}
            {booking.customer?.phone && (
              <p className="text-slate-500 text-xs">{booking.customer.phone}</p>
            )}
          </Row>

          {/* Dates */}
          <Row icon="calendar_month" label="Thời gian lưu trú">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-mono font-medium">
                {fmt(booking.checkInDate || booking.check_in_date || booking.check_in)}
              </span>
              <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-mono font-medium">
                {fmt(booking.checkOutDate || booking.check_out_date || booking.check_out)}
              </span>
              <span className="text-slate-400 text-xs">({booking.nights} đêm)</span>
            </div>
          </Row>

          {/* Guests */}
          <Row icon="group" label="Số khách">
            {booking.guestCount || booking.guest_count} khách
          </Row>

          {/* Price */}
          <Row icon="payments" label="Tổng tiền">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-bold text-slate-900 text-base">{fmtCurrency(booking.totalPrice || booking.total_price)}</span>
              <span className={`inline-flex px-2 py-0.5 rounded-full border text-xs font-semibold ${payment.cls}`}>
                {payment.label}
              </span>
            </div>
          </Row>

          {/* Special requests */}
          {booking.special_requests && (
            <Row icon="note" label="Yêu cầu đặc biệt">
              <p className="text-slate-600 italic">{booking.special_requests}</p>
            </Row>
          )}

          {/* Notes */}
          {booking.notes && (
            <Row icon="sticky_note_2" label="Ghi chú nội bộ">
              <p className="text-slate-600">{booking.notes}</p>
            </Row>
          )}

          {/* Created at */}
          <Row icon="schedule" label="Ngày tạo">
            {booking.created_at || (booking as any).createdAt ? new Date(booking.created_at || (booking as any).createdAt).toLocaleString('vi-VN') : '—'}
          </Row>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Đóng
          </button>
          {onViewDetail && (
            <button
              onClick={() => { onViewDetail(booking.id); onClose(); }}
              className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              Xem chi tiết
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
