'use client';

import { useState } from 'react';
import Link from 'next/link';
import { publicBookingService } from '@/services/public-booking.service';
import { BookingLookupFormErrors } from '@/types/public-booking';
import { PublicBookingStatusBadge, PublicPaymentStatusBadge } from '@/components/booking/PublicBookingBadges';
import { CancelBookingModal } from '@/components/booking/CancelBookingModal';

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

function validate(bookingCode: string, phone: string): BookingLookupFormErrors {
  const errors: BookingLookupFormErrors = {};
  if (!bookingCode.trim()) errors.bookingCode = 'Vui lòng nhập mã đặt phòng.';
  if (!phone.trim()) {
    errors.phone = 'Vui lòng nhập số điện thoại.';
  } else if (!/^[0-9+\-\s]{7,15}$/.test(phone.trim())) {
    errors.phone = 'Số điện thoại không hợp lệ.';
  }
  return errors;
}

export default function BookingLookupPage() {
  const [bookingCode, setBookingCode] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<BookingLookupFormErrors>({});
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [booking, setBooking] = useState<any | null>(null);

  // States cho việc huỷ phòng
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotFound(false);
    setBooking(null);
    setCancelSuccess(false);
    setCancelError(null);

    const validationErrors = validate(bookingCode, phone);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsSearching(true);

    const payload = {
      bookingCode: bookingCode.trim().toUpperCase(),
      phone: phone.trim(),
    };

    try {
      const result = await publicBookingService.searchBooking(payload);

      if (result.success && result.data) {
        setBooking(result.data);
        return;
      }

      setNotFound(true);
      setErrors({ general: result.message || 'Không tìm thấy đơn đặt phòng phù hợp. Vui lòng kiểm tra lại mã đặt phòng và số điện thoại.' });
    } catch (err: any) {
      setErrors({ general: err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.' });
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!booking) return;
    setIsCancelling(true);
    setCancelError(null);
    try {
      const result = await publicBookingService.guestCancelBooking({
        bookingCode: booking.bookingCode || booking.booking_code || bookingCode.trim().toUpperCase(),
        phone: booking.phone || phone.trim(),
      });
      if (result.success) {
        setCancelSuccess(true);
        setShowCancelModal(false);
        setBooking((prev: any) => prev ? { ...prev, bookingStatus: 'CANCELLED', status: 'CANCELLED' } : prev);
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

  const handleChange =
    (setter: (v: string) => void, field: keyof BookingLookupFormErrors) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
      setNotFound(false);
    };

  const CANCELLABLE_STATUSES = ['PENDING', 'CONFIRMED'];
  const currentStatus = booking ? (booking.bookingStatus ?? booking.status) : null;
  const canCancel = booking && currentStatus != null && CANCELLABLE_STATUSES.includes(currentStatus);

  const bCode = booking ? (booking.bookingCode ?? booking.booking_code ?? '—') : '—';
  const cName = booking ? (booking.customerName ?? booking.customer_name ?? '—') : '—';
  const cPhone = booking ? (booking.phone ?? '—') : '—';
  const cEmail = booking ? (booking.email ?? '—') : '—';
  const rName = booking ? (booking.roomName ?? booking.room_category ?? '—') : '—';
  const rNumber = booking ? (booking.roomNumber ?? booking.room_number ?? '—') : '—';
  const chIn = booking ? (booking.checkInDate ?? booking.check_in ?? null) : null;
  const chOut = booking ? (booking.checkOutDate ?? booking.check_out ?? null) : null;
  const tAmount = booking ? (booking.totalAmount ?? booking.total_price ?? null) : null;
  const pStatus = booking ? (booking.paymentStatus ?? booking.payment_status ?? 'UNPAID') : 'UNPAID';

  return (
    <div className="min-h-screen bg-[#F8F6F3]">
      {/* ── Hero ── */}
      <section className="relative w-full flex flex-col items-center justify-center text-center px-6 py-24 bg-[#1A1A1A] overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80')" }} />
        
        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/50 hover:text-[#C8A97E] text-xs font-semibold uppercase tracking-widest transition-colors mb-2"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Trở lại trang chủ
          </Link>

          <div className="w-12 h-12 border border-[#C8A97E]/30 flex items-center justify-center mx-auto mb-2">
            <span className="material-symbols-outlined text-[#C8A97E] text-xl">confirmation_number</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-light text-white tracking-tight" style={SERIF}>
            Quản lý đặt phòng
          </h1>
          <p className="text-white/60 text-sm max-w-md mx-auto leading-relaxed font-light">
            Nhập mã đặt phòng và số điện thoại để tra cứu chi tiết và quản lý kỳ nghỉ của quý khách.
          </p>
        </div>
      </section>

      {/* ── Lookup Form / Booking Details Card ── */}
      {!booking ? (
        <section className="px-6 py-12 max-w-md mx-auto -mt-8 relative z-10">
          <div className="bg-white border border-stone-200/60 p-8 shadow-sm">
            {/* Card header */}
            <div className="mb-6 pb-4 border-b border-stone-100 flex items-center gap-3">
              <span className="material-symbols-outlined text-[#C8A97E] text-xl">search</span>
              <div>
                <h2 className="text-xs uppercase tracking-widest font-semibold text-stone-900">Tìm kiếm đơn phòng</h2>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Booking Code */}
              <div className="space-y-1.5">
                <label
                  htmlFor="bookingCode"
                  className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C8A97E]"
                >
                  Mã đặt phòng *
                </label>
                <input
                  id="bookingCode"
                  type="text"
                  value={bookingCode}
                  onChange={handleChange(setBookingCode, 'bookingCode')}
                  placeholder="VD: BK-2024-001"
                  autoComplete="off"
                  autoCapitalize="characters"
                  className={`w-full bg-[#F8F6F3] border border-stone-200 py-3 px-4 text-sm focus:border-[#C8A97E]/60 focus:ring-0 focus:outline-none transition-colors placeholder:text-stone-300 ${
                    errors.bookingCode ? 'border-red-400' : ''
                  }`}
                  aria-describedby={errors.bookingCode ? 'bookingCode-error' : undefined}
                  aria-invalid={!!errors.bookingCode}
                />
                {errors.bookingCode && (
                  <p id="bookingCode-error" className="text-red-500 text-xs font-medium flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {errors.bookingCode}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label
                  htmlFor="phone"
                  className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C8A97E]"
                >
                  Số điện thoại *
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={handleChange(setPhone, 'phone')}
                  placeholder="VD: 0901234567"
                  autoComplete="tel"
                  className={`w-full bg-[#F8F6F3] border border-stone-200 py-3 px-4 text-sm focus:border-[#C8A97E]/60 focus:ring-0 focus:outline-none transition-colors placeholder:text-stone-300 ${
                    errors.phone ? 'border-red-400' : ''
                  }`}
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                  aria-invalid={!!errors.phone}
                />
                {errors.phone && (
                  <p id="phone-error" className="text-red-500 text-xs font-medium flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* General / not-found error */}
              {errors.general && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-100 p-4">
                  <span className="material-symbols-outlined text-red-500 text-lg flex-shrink-0 mt-0.5">
                    {notFound ? 'search_off' : 'error'}
                  </span>
                  <div>
                    <p className="text-red-800 text-xs font-bold uppercase tracking-wider">
                      {notFound ? 'Không tìm thấy đơn đặt phòng' : 'Đã xảy ra lỗi'}
                    </p>
                    <p className="text-red-500 text-xs mt-0.5 leading-relaxed">{errors.general}</p>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                id="search-booking-btn"
                type="submit"
                disabled={isSearching}
                className="w-full bg-[#C8A97E] hover:bg-[#b5956a] text-white py-3 text-xs font-medium uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                    Đang tìm kiếm...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">search</span>
                    Tìm đặt phòng
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Help note */}
          <p className="text-center text-stone-400 text-[11px] mt-6 leading-relaxed">
            Mã đặt phòng được gửi qua email hoặc SMS khi bạn đặt phòng thành công.
            <br />
            Cần hỗ trợ?{' '}
            <Link href="/contact" className="text-[#C8A97E] hover:underline font-semibold">
              Liên hệ với chúng tôi
            </Link>
          </p>
        </section>
      ) : (
        <section className="px-6 py-12 max-w-2xl mx-auto -mt-8 relative z-10">
          <div className="space-y-8">
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
                    <p className="text-[10px] text-stone-400 font-mono mt-0.5">MÃ: {bCode}</p>
                  </div>
                </div>
                <PublicBookingStatusBadge status={currentStatus} size="md" />
              </div>

              {/* Info Rows */}
              <div className="px-8 py-3">
                <InfoRow label="Mã đặt phòng" value={bCode} />
                <InfoRow label="Khách hàng" value={cName} />
                <InfoRow label="Điện thoại" value={cPhone} />
                <InfoRow label="Email" value={cEmail} />
                <InfoRow label="Loại phòng" value={rName} />
                <InfoRow label="Số phòng" value={rNumber} />
                <InfoRow label="Nhận phòng" value={formatDate(chIn)} />
                <InfoRow label="Trả phòng" value={formatDate(chOut)} />
                <InfoRow label="Số khách" value={`${booking.guestCount ?? booking.guest_count ?? 1} khách`} />
              </div>

              {/* Total + Payment Status */}
              <div className="px-8 py-6 border-t border-stone-100 bg-[#F8F6F3]/50">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
                      Tổng tiền
                    </p>
                    <p className="text-2xl font-semibold text-[#C8A97E] mt-1">
                      {formatCurrency(tAmount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400 mb-1">
                      Thanh toán
                    </p>
                    <PublicPaymentStatusBadge status={pStatus} />
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
              <button
                onClick={() => {
                  setBooking(null);
                  setBookingCode('');
                  setPhone('');
                  setErrors({});
                  setCancelSuccess(false);
                  setCancelError(null);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 border border-stone-200 text-stone-600 text-xs font-semibold uppercase tracking-widest hover:border-stone-400 transition-all"
              >
                <span className="material-symbols-outlined text-base">search</span>
                Tìm đặt phòng khác
              </button>
              <Link
                href="/rooms"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-[#C8A97E] hover:bg-[#b5956a] text-white text-xs font-semibold uppercase tracking-widest transition-all text-center"
              >
                <span className="material-symbols-outlined text-base">hotel</span>
                Đặt phòng mới
              </Link>
            </div>
          </div>
        </section>
      )}

      <CancelBookingModal
        isOpen={showCancelModal}
        isCancelling={isCancelling}
        onKeep={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}
