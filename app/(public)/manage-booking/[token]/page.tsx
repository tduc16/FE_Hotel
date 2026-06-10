'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { publicBookingService } from '@/services/public-booking.service';
import { PublicBooking } from '@/types/public-booking';
import { BookingStatus } from '@/types/booking';
import { PublicBookingStatusBadge, PublicPaymentStatusBadge } from '@/components/booking/PublicBookingBadges';
import { CancelBookingModal } from '@/components/booking/CancelBookingModal';
import { BookingSummarySkeleton } from '@/components/booking/BookingSkeletons';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const [y, m, d] = dateStr.split('T')[0].split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('vi-VN', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

const CANCELLABLE_STATUSES: BookingStatus[] = ['PENDING', 'CONFIRMED'];

// ─────────────────────────────────────────────
// Info Row
// ─────────────────────────────────────────────

function InfoRow({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-surface-container-high last:border-0">
      <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant flex-shrink-0 pt-0.5">
        {label}
      </span>
      <span
        className={`text-sm text-right font-medium ${
          highlight ? 'text-primary text-base font-extrabold' : 'text-on-surface'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────

export default function ManageBookingPage() {
  const params = useParams();
  const token = decodeURIComponent(params?.token as string ?? '');

  const [booking, setBooking] = useState<PublicBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // ── Fetch booking ──
  const fetchBooking = useCallback(async () => {
    if (!token) {
      setError('Liên kết không hợp lệ.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await publicBookingService.getBookingByToken(token);
      if (result.success && result.data) {
        setBooking(result.data);
      } else {
        setError(result.message || 'Không tìm thấy đặt phòng hoặc liên kết đã hết hạn.');
      }
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi tải thông tin đặt phòng.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  // ── Cancel booking ──
  const handleConfirmCancel = async () => {
    if (!token) return;
    setIsCancelling(true);
    setCancelError(null);
    try {
      const result = await publicBookingService.cancelBooking({ token });
      if (result.success) {
        setCancelSuccess(true);
        setShowCancelModal(false);
        // Update local status instantly
        setBooking((prev) => prev ? { ...prev, status: 'CANCELLED' } : prev);
      } else {
        setCancelError(result.message || 'Không thể huỷ đặt phòng.');
        setShowCancelModal(false);
      }
    } catch (err: any) {
      setCancelError(err.message || 'Đã xảy ra lỗi khi huỷ đặt phòng.');
      setShowCancelModal(false);
    } finally {
      setIsCancelling(false);
    }
  };

  // ── Derived values ──
  const canCancel =
    booking?.status != null && CANCELLABLE_STATUSES.includes(booking.status);

  const bookingCode =
    booking?.booking_code ??
    booking?.id?.slice(0, 8).toUpperCase() ??
    '—';

  const customerName =
    booking?.customer?.name ??
    booking?.customer_name ??
    '—';

  const customerPhone =
    booking?.customer?.phone ??
    booking?.phone ??
    '—';

  const customerEmail =
    booking?.customer?.email ??
    booking?.email ??
    '—';

  const roomCategory =
    booking?.room?.name ??
    booking?.room_category ??
    '—';

  const roomNumber =
    booking?.room?.roomNumber ??
    booking?.room?.room_number ??
    booking?.room_number ??
    '—';

  const checkIn = booking?.check_in ?? booking?.check_in_date ?? null;
  const checkOut = booking?.check_out ?? booking?.check_out_date ?? null;

  const totalAmount =
    booking?.total_price ??
    booking?.total_amount ??
    null;

  // ════════════════════════════════════════════
  // RENDER STATES
  // ════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-background">
      {/* ── Page Header ── */}
      <div
        className="w-full px-4 py-12 md:py-16 text-center"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #00658f 100%)',
        }}
      >
        <div className="max-w-2xl mx-auto space-y-3">
          <Link
            href="/booking-lookup"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Tìm đặt phòng khác
          </Link>
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-white text-xl">hotel</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {isLoading ? 'Đang tải...' : bookingCode !== '—' ? `Đặt phòng #${bookingCode}` : 'Quản lý đặt phòng'}
          </h1>
          <p className="text-white/60 text-sm">Hotel Hoang Minh</p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">

        {/* ── Loading skeleton ── */}
        {isLoading && <BookingSummarySkeleton />}

        {/* ── Error state ── */}
        {!isLoading && error && (
          <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-red-500 text-3xl">error_outline</span>
            </div>
            <h2 className="text-xl font-bold text-on-surface">Không thể tải đặt phòng</h2>
            <p className="text-on-surface-variant text-sm leading-relaxed">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={fetchBooking}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                Thử lại
              </button>
              <Link
                href="/booking-lookup"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-surface-container-low text-on-surface rounded-xl font-semibold text-sm hover:bg-surface-container transition-all border border-outline-variant/30"
              >
                <span className="material-symbols-outlined text-sm">search</span>
                Tìm lại
              </Link>
            </div>
          </div>
        )}

        {/* ── Main content ── */}
        {!isLoading && booking && (
          <>
            {/* Success Banner */}
            {cancelSuccess && (
              <div
                role="alert"
                className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-6 py-4 shadow-sm"
              >
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
                </div>
                <div>
                  <p className="text-green-800 font-bold text-sm">Huỷ đặt phòng thành công.</p>
                  <p className="text-green-700 text-xs mt-0.5">
                    Đặt phòng của bạn đã được huỷ. Chúng tôi sẽ liên hệ nếu cần thêm thông tin.
                  </p>
                </div>
              </div>
            )}

            {/* Cancel Error Banner */}
            {cancelError && (
              <div
                role="alert"
                className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-6 py-4"
              >
                <span className="material-symbols-outlined text-red-500 text-xl flex-shrink-0">error</span>
                <p className="text-red-700 text-sm font-medium">{cancelError}</p>
              </div>
            )}

            {/* Booking Summary Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden">
              {/* Card Header */}
              <div className="px-8 py-6 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-xl">receipt_long</span>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-on-surface">Chi tiết đặt phòng</h2>
                    <p className="text-xs text-on-surface-variant mt-0.5">Mã: {bookingCode}</p>
                  </div>
                </div>
                <PublicBookingStatusBadge status={booking.status} size="md" />
              </div>

              {/* Info Rows */}
              <div className="px-8 py-4">
                <InfoRow label="Mã đặt phòng" value={bookingCode} />
                <InfoRow label="Khách hàng" value={customerName} />
                <InfoRow label="Điện thoại" value={customerPhone} />
                <InfoRow label="Email" value={customerEmail} />
                <InfoRow label="Loại phòng" value={roomCategory} />
                <InfoRow label="Số phòng" value={roomNumber} />
                <InfoRow label="Nhận phòng" value={formatDate(checkIn)} />
                <InfoRow label="Trả phòng" value={formatDate(checkOut)} />
                <InfoRow label="Số khách" value={`${booking.guest_count ?? 1} khách`} />
              </div>

              {/* Total + Payment Status */}
              <div className="px-8 py-6 border-t border-surface-container-high bg-surface-container-low/50">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                      Tổng tiền
                    </p>
                    <p className="text-2xl font-extrabold text-primary mt-1">
                      {formatCurrency(totalAmount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                      Thanh toán
                    </p>
                    <PublicPaymentStatusBadge status={booking.payment_status} />
                  </div>
                </div>
              </div>
            </div>

            {/* Cancel Booking Button */}
            {canCancel && !cancelSuccess && (
              <button
                id="cancel-booking-btn"
                onClick={() => setShowCancelModal(true)}
                className="w-full h-13 flex items-center justify-center gap-2 border-2 border-red-300 text-red-600 hover:bg-red-50 rounded-xl font-bold text-sm transition-all active:scale-95 py-3.5"
              >
                <span className="material-symbols-outlined text-xl">cancel</span>
                Huỷ đặt phòng
              </button>
            )}

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/booking-lookup"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-xl font-semibold text-sm transition-all border border-outline-variant/30"
              >
                <span className="material-symbols-outlined text-sm">search</span>
                Tìm đặt phòng khác
              </Link>
              <Link
                href="/rooms"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl font-semibold text-sm transition-all"
              >
                <span className="material-symbols-outlined text-sm">hotel</span>
                Đặt phòng mới
              </Link>
            </div>
          </>
        )}
      </div>

      {/* ── Cancel Modal ── */}
      <CancelBookingModal
        isOpen={showCancelModal}
        isCancelling={isCancelling}
        onKeep={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}
