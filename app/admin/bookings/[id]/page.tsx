'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { bookingService } from '@/services/booking.service';
import { Booking, BookingStatus, PaymentStatus } from '@/types/booking';
import BookingStatusBadge from '@/components/admin/BookingStatusBadge';
import BookingActions from '@/components/admin/BookingActions';

type ExtendedBooking = Booking & {
  roomCategory?: {
    name?: string | null;
    basePrice?: number | null;
  } | null;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const displayValue = (value: any) =>
  value !== null &&
  value !== undefined &&
  value !== ''
    ? value
    : '—';

function formatCurrency(amount?: number | string | null) {
  const num = Number(amount);
  if (amount == null || isNaN(num)) return "—";
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDatetime(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Badge Configs ────────────────────────────────────────────────────────────

const PAYMENT_CONFIG: Record<PaymentStatus, { label: string; className: string }> = {
  unpaid:   { label: 'Chưa thanh toán', className: 'bg-orange-100 text-orange-700 border-orange-200' },
  paid:     { label: 'Đã thanh toán',   className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  refunded: { label: 'Đã hoàn tiền',    className: 'bg-purple-100 text-purple-700 border-purple-200' },
};

function PaymentBadge({ status }: { status: PaymentStatus }) {
  if (!status) return <span>—</span>;
  const cfg = PAYMENT_CONFIG[status] ?? { label: status, className: 'bg-gray-100 text-gray-600 border-gray-200' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.className}`}>
      {displayValue(cfg.label)}
    </span>
  );
}

// ─── Info Card ────────────────────────────────────────────────────────────────

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 py-2 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-400 min-w-[120px] mt-0.5">{label}</span>
      <span className="text-sm text-slate-800 font-medium flex-1">{value}</span>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-64 bg-slate-200 rounded" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-200 rounded-xl" />)}
        </div>
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-36 bg-slate-200 rounded-xl" />)}
        </div>
      </div>
    </div>
  );
}

// ─── Timeline ────────────────────────────────────────────────────────────────

interface TimelineEvent {
  label: string;
  time: string;
  active: boolean;
  done: boolean;
  color: string;
}

function buildTimeline(booking: ExtendedBooking): TimelineEvent[] {
  const status = booking.status ?? booking.bookingStatus ?? booking.booking_status ?? 'PENDING';
  const steps: { key: BookingStatus; label: string; color: string }[] = [
    { key: 'PENDING',     label: 'Đặt phòng',     color: 'bg-amber-400' },
    { key: 'CONFIRMED',   label: 'Xác nhận',       color: 'bg-blue-500' },
    { key: 'CHECKED_IN',  label: 'Nhận phòng',     color: 'bg-green-500' },
    { key: 'CHECKED_OUT', label: 'Trả phòng',      color: 'bg-slate-400' },
  ];
  const order = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'];
  const currentIdx = status ? order.indexOf(status) : -1;

  return steps.map((step, i) => ({
    label: step.label,
    time: i === 0 ? formatDatetime(booking.createdAt)
        : i === 1 ? formatDate(booking.checkInDate)
        : i === 2 ? formatDate(booking.checkInDate)
        : formatDate(booking.checkOutDate),
    active: step.key === status,
    done: status !== 'CANCELLED' && i <= currentIdx,
    color: step.color,
  }));
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [booking, setBooking]     = useState<ExtendedBooking | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const fetchBooking = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingService.getBookingById(id) as ExtendedBooking;
      console.log('BOOKING DETAIL', data);
      console.table({
        customerName: data.customerName,
        email: data.email,
        phone: data.phone,
        roomCategory: data.roomCategory?.name,
        roomNumber: data.room?.roomNumber,
        guestCount: data.guestCount,
        nightCount: data.nightCount,
        totalAmount: data.totalAmount
      });
      setBooking(data);
    } catch (e: unknown) {
      if (e instanceof Error && e.message === 'UNAUTHORIZED') {
        setError('Phiên đăng nhập đã hết hạn hoặc bạn không có quyền truy cập. Đang chuyển hướng...');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('admin_access_token');
          localStorage.removeItem('admin_info');
        }
        setTimeout(() => {
          router.push('/admin/login');
        }, 1500);
      } else {
        setError(e instanceof Error ? e.message : 'Không thể tải thông tin booking.');
      }
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { fetchBooking(); }, [fetchBooking]);

  if (loading) return <DetailSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-slate-700 font-semibold mb-4">{error}</p>
        <button onClick={fetchBooking} className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-700">
          Thử lại
        </button>
      </div>
    );
  }

  if (!booking) return null;

  const actualStatus = booking.status ?? booking.bookingStatus ?? booking.booking_status ?? 'PENDING';

  const timeline = buildTimeline(booking);

  const roomNameParts = [booking.roomCategory?.name, booking.room?.roomNumber].filter(Boolean);
  const roomName = roomNameParts.length > 0 ? roomNameParts.join(' - ') : null;

  return (
    <>
      <div className="space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/bookings"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
                  Booking <span className="font-mono text-blue-600">#{displayValue(booking.bookingCode || booking.booking_code)}</span>
                </h1>
                <BookingStatusBadge status={actualStatus} showDot={true} />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Tạo lúc {formatDatetime(booking.createdAt)}</p>
            </div>
          </div>

          {/* Action buttons */}
          <BookingActions
            booking={booking as Booking}
            status={actualStatus}
            onSuccess={fetchBooking}
            size="md"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left column ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Customer info */}
            <InfoCard title="Thông tin khách hàng">
              <InfoRow label="Họ tên" value={displayValue(booking.customerName)} />
              <InfoRow label="Email" value={booking.email ? <a href={`mailto:${booking.email}`} className="text-blue-600 hover:underline">{displayValue(booking.email)}</a> : '—'} />
              <InfoRow label="Số điện thoại" value={displayValue(booking.phone)} />
            </InfoCard>

            {/* Room info */}
            <InfoCard title="Thông tin phòng">
              <InfoRow label="Tên phòng" value={displayValue(roomName)} />
              <InfoRow label="Giá / đêm" value={formatCurrency(booking.roomCategory?.basePrice)} />
              <InfoRow label="Check-in" value={formatDate(booking.checkInDate)} />
              <InfoRow label="Check-out" value={formatDate(booking.checkOutDate)} />
              <InfoRow label="Số đêm" value={booking.nightCount != null ? `${booking.nightCount} đêm` : '—'} />
              <InfoRow label="Số khách" value={booking.guestCount != null ? `${booking.guestCount} người` : '—'} />
            </InfoCard>

            {/* Timeline */}
            <InfoCard title="Timeline đặt phòng">
              <div className="space-y-0">
                {actualStatus === 'CANCELLED' ? (
                  <div className="flex items-center gap-3 py-3">
                    <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <span className="w-3 h-3 rounded-full bg-red-500" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-red-700">Đã hủy</p>
                      <p className="text-xs text-slate-400">{formatDatetime(booking.updatedAt)}</p>
                    </div>
                  </div>
                ) : (
                  timeline.map((event, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          event.done ? event.color : 'bg-slate-200'
                        }`}>
                          {event.done && (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        {i < timeline.length - 1 && (
                          <span className={`w-0.5 flex-1 min-h-[20px] my-1 ${event.done ? 'bg-slate-300' : 'bg-slate-100'}`} />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className={`text-sm font-semibold ${event.done ? 'text-slate-800' : 'text-slate-400'}`}>{event.label}</p>
                        <p className="text-xs text-slate-400">{event.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </InfoCard>

            {/* Notes */}
            {(booking.special_requests || booking.notes) && (
              <InfoCard title="Ghi chú">
                {booking.special_requests && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Yêu cầu đặc biệt</p>
                    <p className="text-sm text-slate-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">{displayValue(booking.special_requests)}</p>
                  </div>
                )}
                {booking.notes && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Ghi chú nội bộ</p>
                    <p className="text-sm text-slate-700">{displayValue(booking.notes)}</p>
                  </div>
                )}
              </InfoCard>
            )}
          </div>

          {/* ── Right column ── */}
          <div className="space-y-5">
            {/* Payment summary */}
            <InfoCard title="Thông tin thanh toán">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Trạng thái</span>
                  <PaymentBadge status={booking.paymentStatus!} />
                </div>
                <div className="border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span>Giá phòng</span>
                    <span>{formatCurrency(booking.roomCategory?.basePrice)} × {booking.nightCount != null ? `${booking.nightCount} đêm` : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>Tổng cộng</span>
                    <span className="text-lg">{formatCurrency(booking.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </InfoCard>

            {/* Booking meta */}
            <InfoCard title="Thông tin đặt phòng">
              <InfoRow label="Mã booking" value={<span className="font-mono font-bold text-blue-600">#{displayValue(booking.bookingCode)}</span>} />
              <InfoRow label="Tạo lúc" value={formatDatetime(booking.createdAt)} />
              <InfoRow label="Cập nhật" value={formatDatetime(booking.updatedAt)} />
            </InfoCard>
          </div>
        </div>
      </div>
    </>
  );
}
