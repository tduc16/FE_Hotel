'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { publicBookingService } from '@/services/public-booking.service';
import { BookingLookupFormErrors } from '@/types/public-booking';

const SERIF = { fontFamily: "var(--font-cormorant), Georgia, serif" };

function validate(bookingCode: string, phone: string): BookingLookupFormErrors {
  const errors: BookingLookupFormErrors = {};
  if (!bookingCode.trim()) errors.booking_code = 'Vui lòng nhập mã đặt phòng.';
  if (!phone.trim()) {
    errors.phone = 'Vui lòng nhập số điện thoại.';
  } else if (!/^[0-9+\-\s]{7,15}$/.test(phone.trim())) {
    errors.phone = 'Số điện thoại không hợp lệ.';
  }
  return errors;
}

export default function BookingLookupPage() {
  const router = useRouter();

  const [bookingCode, setBookingCode] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<BookingLookupFormErrors>({});
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotFound(false);

    const validationErrors = validate(bookingCode, phone);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsSearching(true);

    try {
      const result = await publicBookingService.searchBooking({
        booking_code: bookingCode.trim().toUpperCase(),
        phone: phone.trim(),
      });

      if (result.success && result.token) {
        router.push(`/manage-booking/${encodeURIComponent(result.token)}`);
        return;
      }

      if (result.success && result.data) {
        const token = result.data.manage_token ?? bookingCode.trim().toUpperCase();
        router.push(`/manage-booking/${encodeURIComponent(token)}`);
        return;
      }

      setNotFound(true);
      setErrors({ general: result.message || 'Không tìm thấy đặt phòng.' });
    } catch (err: any) {
      setErrors({ general: err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.' });
    } finally {
      setIsSearching(false);
    }
  };

  const handleChange =
    (setter: (v: string) => void, field: keyof BookingLookupFormErrors) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
      setNotFound(false);
    };

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

      {/* ── Lookup Card ── */}
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
                htmlFor="booking-code"
                className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C8A97E]"
              >
                Mã đặt phòng *
              </label>
              <input
                id="booking-code"
                type="text"
                value={bookingCode}
                onChange={handleChange(setBookingCode, 'booking_code')}
                placeholder="VD: BK-2024-001"
                autoComplete="off"
                autoCapitalize="characters"
                className={`w-full bg-[#F8F6F3] border border-stone-200 py-3 px-4 text-sm focus:border-[#C8A97E]/60 focus:ring-0 focus:outline-none transition-colors placeholder:text-stone-300 ${
                  errors.booking_code
                    ? 'border-red-400'
                    : ''
                }`}
                aria-describedby={errors.booking_code ? 'booking-code-error' : undefined}
                aria-invalid={!!errors.booking_code}
              />
              {errors.booking_code && (
                <p id="booking-code-error" className="text-red-500 text-xs font-medium flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {errors.booking_code}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label
                htmlFor="phone-number"
                className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C8A97E]"
              >
                Số điện thoại *
              </label>
              <input
                id="phone-number"
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
    </div>
  );
}
