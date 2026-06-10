'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';

import { bookingService } from '@/services/booking.service';
import { Booking, BookingStatus } from '@/types/booking';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass?: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}


function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  confirmClass = '',
  loading,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Content */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        style={{ animation: 'modalIn 0.2s cubic-bezier(.16,1,.3,1)' }}
      >
        <h3
          className="text-lg font-bold text-slate-900 mb-2"
          style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
        >
          {title}
        </h3>
        <p className="text-sm text-slate-500 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${
              confirmClass || 'bg-slate-900 hover:bg-slate-700'
            }`}
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
            )}
            {confirmLabel}
          </button>
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

interface BookingActionsProps {
  booking: Booking;
  status: BookingStatus;
  onSuccess: () => void;
  size?: 'sm' | 'md';
}

export default function BookingActions({
  booking,
  status,
  onSuccess,
  size = 'sm',
}: BookingActionsProps) {
  const [modal, setModal] = useState<{
    open: boolean;
    action: BookingStatus | null;
    title: string;
    message: string;
    label: string;
    cls: string;
  }>({
    open: false,
    action: null,
    title: '',
    message: '',
    label: '',
    cls: '',
  });
  const [loading, setLoading] = useState(false);

  const openModal = (action: BookingStatus) => {
    if (loading) return;
    const cfg: Record<
      string,
      { title: string; message: string; label: string; cls: string }
    > = {
      CONFIRMED: {
        title: 'Xác nhận đặt phòng',
        message: 'Bạn muốn xác nhận booking này?',
        label: 'Xác nhận',
        cls: 'bg-blue-600 hover:bg-blue-700',
      },
      CANCELLED: {
        title: 'Hủy đặt phòng',
        message: 'Thao tác này không thể hoàn tác. Bạn có chắc chắn muốn hủy booking?',
        label: 'Hủy booking',
        cls: 'bg-red-600 hover:bg-red-700',
      },
      CHECKED_IN: {
        title: 'Check-in khách nhận phòng',
        message: 'Xác nhận khách đã nhận phòng?',
        label: 'Check-in',
        cls: 'bg-green-600 hover:bg-green-700',
      },
      CHECKED_OUT: {
        title: 'Check-out trả phòng',
        message: 'Xác nhận khách đã trả phòng?',
        label: 'Check-out',
        cls: 'bg-slate-700 hover:bg-slate-800',
      },
    };
    const c = cfg[action] ?? { title: action, message: '', label: action, cls: '' };
    setModal({ open: true, action, ...c });
  };

  const handleConfirm = async () => {
    if (!modal.action) return;
    if (loading) return; // Prevent double submit

    // 3. Trước khi gọi API: kiểm tra booking.id tồn tại.
    if (!booking || !booking.id) {
      toast.error('Booking ID is missing');
      return;
    }

    setLoading(true);

    console.log({
      bookingId: booking.id,
      bookingCode: booking.booking_code || booking.bookingCode
    });

    try {
      await bookingService.updateBookingStatus(booking.id, modal.action);
      // 8. Toast Success: "Booking status updated"
      toast.success('Booking status updated');
      setModal((m) => ({ ...m, open: false }));
      onSuccess();
    } catch (error: any) {
      // 8. Toast Error: hiển thị message từ API.
      const apiMessage = error?.message || 'Failed to update booking status';
      toast.error(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  const btnClass =
    size === 'sm'
      ? 'px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1 disabled:opacity-50'
      : 'px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50';

  // 2. Chỉ hiển thị button hợp lệ theo từng status:
  // PENDING -> Confirm, Cancel
  // CONFIRMED -> Check In, Cancel
  // CHECKED_IN -> Check Out
  // CHECKED_OUT -> Không hiển thị action
  // CANCELLED -> Không hiển thị action
  if (
    status === 'CHECKED_OUT' ||
    status === 'CANCELLED' ||
    status === 'EXPIRED'
  ) {
    return null;
  }

  return (
    <>
      <ConfirmModal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        confirmLabel={modal.label}
        confirmClass={modal.cls}
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={() => !loading && setModal((m) => ({ ...m, open: false }))}
      />

      <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
        {status === 'PENDING' && (
          <>
            <button
              onClick={() => openModal('CONFIRMED')}
              disabled={loading}
              className={`${btnClass} bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow transition-all`}
            >
              Xác nhận
            </button>
            <button
              onClick={() => openModal('CANCELLED')}
              disabled={loading}
              className={`${btnClass} bg-white text-red-600 border border-red-200 hover:bg-red-50 transition-all`}
            >
              Hủy
            </button>
          </>
        )}

        {status === 'CONFIRMED' && (
          <>
            <button
              onClick={() => openModal('CHECKED_IN')}
              disabled={loading}
              className={`${btnClass} bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow transition-all`}
            >
              Check-in
            </button>
            <button
              onClick={() => openModal('CANCELLED')}
              disabled={loading}
              className={`${btnClass} bg-white text-red-600 border border-red-200 hover:bg-red-50 transition-all`}
            >
              Hủy
            </button>
          </>
        )}

        {status === 'CHECKED_IN' && (
          <button
              onClick={() => openModal('CHECKED_OUT')}
              disabled={loading}
              className={`${btnClass} bg-slate-700 hover:bg-slate-800 text-white shadow-sm hover:shadow transition-all`}
          >
            Check-out
          </button>
        )}
      </div>
    </>
  );
}
