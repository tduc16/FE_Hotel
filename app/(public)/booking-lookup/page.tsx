'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { publicBookingService } from '@/services/public-booking.service';
import { BookingLookupFormErrors } from '@/types/public-booking';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// Component: Booking Lookup Form
// ─────────────────────────────────────────────

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

      // Không có token nhưng có data — thử dùng booking_code làm token
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
    <div className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <section
        className="relative w-full flex flex-col items-center justify-center text-center px-4 py-20 md:py-28"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #00658f 100%)',
        }}
      >
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors mb-2"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Hotel Hoang Minh
          </Link>

          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-white text-2xl">hotel</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Quản lý đặt phòng
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-md mx-auto leading-relaxed">
            Nhập mã đặt phòng và số điện thoại để tra cứu và quản lý đặt phòng của bạn.
          </p>
        </div>
      </section>

      {/* ── Lookup Card ── */}
      <section className="px-4 py-12 max-w-lg mx-auto -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-outline-variant/20 overflow-hidden">
          {/* Card header */}
          <div className="px-8 pt-8 pb-6 border-b border-surface-container-high">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary text-xl">search</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-on-surface">Tìm đặt phòng</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">Nhập thông tin xác nhận</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5" noValidate>
            {/* Booking Code */}
            <div className="space-y-1.5">
              <label
                htmlFor="booking-code"
                className="block text-xs font-extrabold uppercase tracking-widest text-on-surface-variant"
              >
                Mã đặt phòng <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-xl pointer-events-none">
                  confirmation_number
                </span>
                <input
                  id="booking-code"
                  type="text"
                  value={bookingCode}
                  onChange={handleChange(setBookingCode, 'booking_code')}
                  placeholder="VD: BK-2024-001"
                  autoComplete="off"
                  autoCapitalize="characters"
                  className={`w-full bg-surface-container-highest border-none rounded-xl py-3.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none transition-shadow placeholder:text-on-surface-variant/40 ${
                    errors.booking_code
                      ? 'ring-2 ring-red-400 bg-red-50/50'
                      : ''
                  }`}
                  aria-describedby={errors.booking_code ? 'booking-code-error' : undefined}
                  aria-invalid={!!errors.booking_code}
                />
              </div>
              {errors.booking_code && (
                <p id="booking-code-error" className="text-red-600 text-xs font-medium flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {errors.booking_code}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label
                htmlFor="phone-number"
                className="block text-xs font-extrabold uppercase tracking-widest text-on-surface-variant"
              >
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-xl pointer-events-none">
                  phone
                </span>
                <input
                  id="phone-number"
                  type="tel"
                  value={phone}
                  onChange={handleChange(setPhone, 'phone')}
                  placeholder="VD: 0901234567"
                  autoComplete="tel"
                  className={`w-full bg-surface-container-highest border-none rounded-xl py-3.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none transition-shadow placeholder:text-on-surface-variant/40 ${
                    errors.phone ? 'ring-2 ring-red-400 bg-red-50/50' : ''
                  }`}
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                  aria-invalid={!!errors.phone}
                />
              </div>
              {errors.phone && (
                <p id="phone-error" className="text-red-600 text-xs font-medium flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {errors.phone}
                </p>
              )}
            </div>

            {/* General / not-found error */}
            {errors.general && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                <span className="material-symbols-outlined text-red-500 text-xl flex-shrink-0 mt-0.5">
                  {notFound ? 'search_off' : 'error'}
                </span>
                <div>
                  <p className="text-red-700 text-sm font-semibold">
                    {notFound ? 'Không tìm thấy đặt phòng' : 'Đã xảy ra lỗi'}
                  </p>
                  <p className="text-red-600 text-sm mt-0.5">{errors.general}</p>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              id="search-booking-btn"
              type="submit"
              disabled={isSearching}
              className="w-full h-13 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-primary/20 mt-2 py-3.5"
            >
              {isSearching ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                  Đang tìm kiếm...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-xl">search</span>
                  Tìm đặt phòng
                </>
              )}
            </button>
          </form>
        </div>

        {/* Help note */}
        <p className="text-center text-on-surface-variant/60 text-xs mt-6 leading-relaxed">
          Mã đặt phòng được gửi qua email hoặc SMS khi bạn đặt phòng thành công.
          <br />
          Cần hỗ trợ?{' '}
          <Link href="/contact" className="text-primary hover:underline font-semibold">
            Liên hệ với chúng tôi
          </Link>
        </p>
      </section>
    </div>
  );
}
