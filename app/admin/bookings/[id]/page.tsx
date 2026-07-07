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
  bankQrUrl?: string | null;
  bankTransferContent?: string | null;
  paidAt?: string | null;
  paymentMethod?: string | null;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const displayValue = (value: any) =>
  value !== null && value !== undefined && value !== '' ? value : '—';

function formatCurrency(amount?: number | string | null) {
  const num = Number(amount);
  if (amount == null || isNaN(num)) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
}

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDatetime(iso?: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Badge Configs ────────────────────────────────────────────────────────────

const PAYMENT_CONFIG: Record<PaymentStatus, { label: string; className: string }> = {
  UNPAID:   { label: 'Chưa thanh toán', className: 'bg-orange-100 text-orange-700 border-orange-200' },
  PAID:     { label: 'Đã thanh toán',   className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  REFUNDED: { label: 'Đã hoàn tiền',    className: 'bg-purple-100 text-purple-700 border-purple-200' },
  FAILED:   { label: 'Thất bại',        className: 'bg-red-100 text-red-700 border-red-200' },
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
    { key: 'PENDING',     label: 'Đặt phòng',  color: 'bg-amber-400' },
    { key: 'CONFIRMED',   label: 'Xác nhận',    color: 'bg-blue-500' },
    { key: 'CHECKED_IN',  label: 'Nhận phòng',  color: 'bg-green-500' },
    { key: 'CHECKED_OUT', label: 'Trả phòng',   color: 'bg-slate-400' },
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

  const [booking, setBooking] = useState<ExtendedBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [confirmNote, setConfirmNote] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [qrLoaded, setQrLoaded] = useState(false);

  const fetchBooking = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingService.getBookingById(id) as ExtendedBooking;
      setBooking(data);
    } catch (e: unknown) {
      if (e instanceof Error && e.message === 'UNAUTHORIZED') {
        setError('Phiên đăng nhập đã hết hạn. Đang chuyển hướng...');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('admin_access_token');
          localStorage.removeItem('admin_info');
        }
        setTimeout(() => router.push('/admin/login'), 1500);
      } else {
        setError(e instanceof Error ? e.message : 'Không thể tải thông tin booking.');
      }
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { fetchBooking(); }, [fetchBooking]);

  const handleConfirmPayment = async () => {
    if (!booking) return;
    setConfirmingPayment(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_access_token') : null;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/bookings/${id}/confirm-payment`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ note: confirmNote || undefined }),
        },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Xác nhận thanh toán thất bại');
      }
      setShowConfirmModal(false);
      setConfirmNote('');
      await fetchBooking();
    } catch (e: any) {
      alert(e.message || 'Đã xảy ra lỗi');
    } finally {
      setConfirmingPayment(false);
    }
  };

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
  const isBankTransfer = booking.paymentMethod === 'BANK_TRANSFER';
  const isUnpaid = booking.paymentStatus === 'UNPAID';
  const canConfirmPayment = isBankTransfer && isUnpaid &&
    actualStatus !== 'CANCELLED' && actualStatus !== 'EXPIRED';

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/bookings" className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
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
          <BookingActions booking={booking as Booking} status={actualStatus} onSuccess={fetchBooking} size="md" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-5">
            <InfoCard title="Thông tin khách hàng">
              <InfoRow label="Họ tên" value={displayValue(booking.customerName)} />
              <InfoRow label="Email" value={booking.email ? <a href={`mailto:${booking.email}`} className="text-blue-600 hover:underline">{displayValue(booking.email)}</a> : '—'} />
              <InfoRow label="Số điện thoại" value={displayValue(booking.phone)} />
            </InfoCard>

            <InfoCard title="Thông tin phòng">
              <InfoRow label="Tên phòng" value={displayValue(roomName)} />
              <InfoRow label="Số lượng đặt" value={`${booking.roomCount || booking.room_count || 1} phòng`} />
              <InfoRow label="Giá / đêm" value={formatCurrency(booking.roomCategory?.basePrice)} />
              <InfoRow label="Check-in" value={formatDate(booking.checkInDate)} />
              <InfoRow label="Check-out" value={formatDate(booking.checkOutDate)} />
              <InfoRow label="Số đêm" value={booking.nightCount != null ? `${booking.nightCount} đêm` : '—'} />
              <InfoRow label="Số khách" value={`${booking.adultCount || booking.adult_count || 1} người lớn${(booking.childCount || booking.child_count || 0) > 0 ? `, ${booking.childCount || booking.child_count} trẻ em` : ''} (Tổng ${booking.guestCount || booking.guest_count || 1} người)`} />
            </InfoCard>

            {booking.bookingServices && booking.bookingServices.length > 0 && (
              <InfoCard title="Dịch vụ bổ sung đã chọn">
                <div className="space-y-2">
                  {booking.bookingServices.map((bs: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                      <div>
                        <span className="text-sm font-semibold text-slate-800">{bs.serviceName}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-750">{formatCurrency(bs.servicePrice)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 font-bold text-slate-900 border-t border-dashed border-slate-200">
                    <span className="text-xs uppercase text-slate-400">Tổng tiền dịch vụ bổ sung</span>
                    <span>{formatCurrency(booking.serviceAmount || booking.service_amount || 0)}</span>
                  </div>
                </div>
              </InfoCard>
            )}


            {/* Bank Transfer Info */}
            {isBankTransfer && (
              <InfoCard title="Thông tin chuyển khoản ngân hàng">
                <div className="space-y-4">
                  {/* Status banner */}
                  {isUnpaid ? (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                      <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span><strong>Chưa xác nhận thanh toán.</strong> Kiểm tra giao dịch ngân hàng rồi bấm xác nhận bên dưới.</span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
                      <svg className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span><strong>Đã xác nhận thanh toán</strong>{booking.paidAt ? ` lúc ${formatDatetime(booking.paidAt)}` : ''}.</span>
                    </div>
                  )}

                  {booking.bankTransferContent && (
                    <InfoRow
                      label="Nội dung CK"
                      value={
                        <span className="font-mono font-bold text-slate-900 bg-amber-50 px-2 py-0.5 border border-amber-100 text-sm">
                          {booking.bankTransferContent}
                        </span>
                      }
                    />
                  )}

                  {/* QR Image */}
                  {booking.bankQrUrl && (
                    <div className="flex flex-col items-center py-4 border-t border-slate-100">
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-3">Mã QR thanh toán của khách</p>
                      <div className="relative">
                        {!qrLoaded && (
                          <div className="w-48 h-48 bg-slate-50 border border-slate-200 flex items-center justify-center rounded">
                            <div className="w-6 h-6 rounded-full border-2 border-blue-200 border-t-blue-500 animate-spin"></div>
                          </div>
                        )}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={booking.bankQrUrl}
                          alt="VietQR"
                          className={`w-48 h-auto border border-slate-200 rounded ${qrLoaded ? 'block' : 'hidden'}`}
                          onLoad={() => setQrLoaded(true)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Confirm Payment Button */}
                  {canConfirmPayment && (
                    <div className="border-t border-slate-100 pt-4">
                      <button
                        onClick={() => setShowConfirmModal(true)}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Xác nhận đã nhận tiền chuyển khoản
                      </button>
                      <p className="text-xs text-slate-400 text-center mt-2">
                        Chỉ bấm sau khi đã kiểm tra giao dịch trong tài khoản ngân hàng
                      </p>
                    </div>
                  )}
                </div>
              </InfoCard>
            )}

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
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${event.done ? event.color : 'bg-slate-200'}`}>
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

          {/* Right column */}
          <div className="space-y-5">
            <InfoCard title="Thông tin thanh toán">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Trạng thái</span>
                  <PaymentBadge status={booking.paymentStatus!} />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Phương thức</span>
                  <span className="font-medium text-slate-700">
                    {booking.paymentMethod === 'BANK_TRANSFER' ? '🏦 Chuyển khoản' :
                     booking.paymentMethod === 'CASH' ? '💵 Tiền mặt' :
                     booking.paymentMethod || '—'}
                  </span>
                </div>
                {booking.paidAt && (
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Thanh toán lúc</span>
                    <span className="font-medium text-emerald-700">{formatDatetime(booking.paidAt)}</span>
                  </div>
                )}
                <div className="border-t border-slate-100 pt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Tiền phòng tạm tính</span>
                    <span>
                      {formatCurrency(
                        Number(booking.roomCategory?.basePrice || booking.roomPrice) *
                        Number(booking.nightCount || 0) *
                        Number(booking.roomCount || 1)
                      )}
                    </span>
                  </div>
                  {(booking.serviceAmount || booking.service_amount) ? (
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Dịch vụ bổ sung</span>
                      <span>+{formatCurrency(booking.serviceAmount || booking.service_amount)}</span>
                    </div>
                  ) : null}
                  {(booking.discountAmount || booking.discount_amount) ? (
                    <div className="flex items-center justify-between text-xs text-emerald-600">
                      <span>Giảm giá Voucher</span>
                      <span>-{formatCurrency(booking.discountAmount || booking.discount_amount)}</span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between font-bold text-slate-900 border-t border-slate-100 pt-2">
                    <span>Tổng thanh toán</span>
                    <span className="text-lg text-blue-600">{formatCurrency(booking.totalAmount)}</span>
                  </div>
                </div>

              </div>
            </InfoCard>

            <InfoCard title="Thông tin đặt phòng">
              <InfoRow label="Mã booking" value={<span className="font-mono font-bold text-blue-600">#{displayValue(booking.bookingCode)}</span>} />
              <InfoRow label="Tạo lúc" value={formatDatetime(booking.createdAt)} />
              <InfoRow label="Cập nhật" value={formatDatetime(booking.updatedAt)} />
            </InfoCard>
          </div>
        </div>
      </div>

      {/* Confirm Payment Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Xác nhận thanh toán chuyển khoản</h2>
            <p className="text-sm text-slate-500 mb-4">
              Bạn xác nhận đã nhận được tiền chuyển khoản từ khách?<br />
              Nội dung: <strong className="text-slate-800 font-mono">{booking?.bankTransferContent}</strong>
            </p>
            <textarea
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-400 mb-4"
              rows={3}
              placeholder="Ghi chú (tuỳ chọn)..."
              value={confirmNote}
              onChange={e => setConfirmNote(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowConfirmModal(false); setConfirmNote(''); }}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                disabled={confirmingPayment}
              >
                Huỷ
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={confirmingPayment}
                className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {confirmingPayment ? 'Đang xử lý...' : 'Xác nhận đã nhận tiền'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
