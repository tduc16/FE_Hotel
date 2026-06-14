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

const SERIF = { fontFamily: "var(--font-cormorant), Georgia, serif" };

function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '—';
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
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

function InfoRow({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4.5 border-b border-stone-100 last:border-0">
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C8A97E] flex-shrink-0 pt-0.5">
        {label}
      </span>
      <span
        className={`text-sm text-right font-medium ${
          highlight ? 'text-[#C8A97E] text-base font-semibold' : 'text-stone-800'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

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

  const handleConfirmCancel = async () => {
    if (!token) return;
    setIsCancelling(true);
    setCancelError(null);
    try {
      const result = await publicBookingService.cancelBooking({ token });
      if (result.success) {
        setCancelSuccess(true);
        setShowCancelModal(false);
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

  return (
    <div className="min-h-screen bg-[#F8F6F3]">
      {/* ── Page Header ── */}
      <div className="w-full px-6 py-20 text-center bg-[#1A1A1A] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1920&q=80')" }} />
        
        <div className="relative z-10 max-w-2xl mx-auto space-y-3">
          <Link
            href="/booking-lookup"
            className="inline-flex items-center gap-2 text-white/50 hover:text-[#C8A97E] text-xs font-semibold uppercase tracking-widest transition-colors"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Tìm đặt phòng khác
          </Link>
          
          <div className="w-12 h-12 border border-[#C8A97E]/30 flex items-center justify-center mx-auto mb-2">
            <span className="material-symbols-outlined text-[#C8A97E] text-xl">receipt_long</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-light text-white tracking-tight" style={SERIF}>
            {isLoading ? 'Đang tải...' : bookingCode !== '—' ? `Chi tiết đơn #${bookingCode}` : 'Chi tiết đặt phòng'}
          </h1>
          <p className="text-[#C8A97E] text-[10px] uppercase tracking-[0.3em] font-medium">Hotel Hoang Minh</p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">

        {/* ── Loading skeleton ── */}
        {isLoading && <BookingSummarySkeleton />}

        {/* ── Error state ── */}
        {!isLoading && error && (
          <div className="bg-white border border-stone-200 p-10 text-center space-y-5 shadow-sm">
            <div className="w-16 h-16 border border-[#C8A97E]/30 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[#C8A97E] text-3xl">error_outline</span>
            </div>
            <h2 className="text-xl font-light text-stone-900" style={SERIF}>Không thể tải đặt phòng</h2>
            <p className="text-stone-500 text-sm leading-relaxed">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={fetchBooking}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#C8A97E] hover:bg-[#b5956a] text-white text-xs font-medium uppercase tracking-widest transition-all"
              >
                <span className="material-symbols-outlined text-base">refresh</span>
                Thử lại
              </button>
              <Link
                href="/booking-lookup"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-stone-200 text-stone-600 text-xs font-medium uppercase tracking-widest hover:border-stone-400 transition-all"
              >
                <span className="material-symbols-outlined text-base">search</span>
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
                className="flex items-center gap-4 bg-emerald-50 border border-emerald-150 p-6 shadow-sm"
              >
                <div className="w-9 h-9 bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-emerald-600 text-lg">check</span>
                </div>
                <div>
                  <p className="text-emerald-800 font-bold text-sm">Đã hủy đơn đặt phòng thành công.</p>
                  <p className="text-emerald-700 text-xs mt-0.5 leading-relaxed">
                    Yêu cầu hủy đặt phòng của quý khách đã được thực hiện. Chúng tôi sẽ liên hệ lại nếu cần thêm thông tin.
                  </p>
                </div>
              </div>
            )}

            {/* Cancel Error Banner */}
            {cancelError && (
              <div
                role="alert"
                className="flex items-center gap-3 bg-red-50 border border-red-100 p-6"
              >
                <span className="material-symbols-outlined text-red-500 text-lg flex-shrink-0">error</span>
                <p className="text-red-700 text-sm font-medium">{cancelError}</p>
              </div>
            )}

            {/* Booking Summary Card */}
            <div className="bg-white border border-stone-100 shadow-sm">
              {/* Card Header */}
              <div className="px-8 py-6 bg-[#F8F6F3] border-b border-stone-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#C8A97E] text-xl">receipt_long</span>
                  <div>
                    <h2 className="text-xs uppercase tracking-widest font-semibold text-stone-850">Thông tin đơn phòng</h2>
                    <p className="text-[10px] text-stone-400 font-mono mt-0.5">MÃ: {bookingCode}</p>
                  </div>
                </div>
                <PublicBookingStatusBadge status={booking.status} size="md" />
              </div>

              {/* Info Rows */}
              <div className="px-8 py-3">
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
              <div className="px-8 py-6 border-t border-stone-100 bg-[#F8F6F3]/50">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
                      Tổng tiền
                    </p>
                    <p className="text-2xl font-semibold text-[#C8A97E] mt-1">
                      {formatCurrency(totalAmount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400 mb-1">
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
                className="w-full border border-red-300 hover:bg-red-50 text-red-600 py-3.5 text-xs font-semibold uppercase tracking-widest transition-all"
              >
                <span className="material-symbols-outlined text-base align-middle mr-1.5">cancel</span>
                Huỷ đặt phòng
              </button>
            )}

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/booking-lookup"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 border border-stone-200 text-stone-600 text-xs font-semibold uppercase tracking-widest hover:border-stone-400 transition-all"
              >
                <span className="material-symbols-outlined text-base">search</span>
                Tìm đặt phòng khác
              </Link>
              <Link
                href="/rooms"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-[#C8A97E] hover:bg-[#b5956a] text-white text-xs font-semibold uppercase tracking-widest transition-all"
              >
                <span className="material-symbols-outlined text-base">hotel</span>
                Đặt phòng mới
              </Link>
            </div>
          </>
        )}
      </div>

      <CancelBookingModal
        isOpen={showCancelModal}
        isCancelling={isCancelling}
        onKeep={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}
