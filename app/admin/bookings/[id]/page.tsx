'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { bookingService } from '@/services/booking.service';
import { Booking, BookingStatus, PaymentStatus } from '@/types/booking';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDatetime(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Badge Configs ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<BookingStatus, { label: string; className: string; dot: string }> = {
  pending:     { label: 'Chờ xác nhận',  className: 'bg-amber-100 text-amber-700 border-amber-200',  dot: 'bg-amber-500' },
  confirmed:   { label: 'Đã xác nhận',   className: 'bg-blue-100 text-blue-700 border-blue-200',    dot: 'bg-blue-500' },
  checked_in:  { label: 'Đã nhận phòng', className: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
  checked_out: { label: 'Đã trả phòng',  className: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
  cancelled:   { label: 'Đã hủy',        className: 'bg-red-100 text-red-700 border-red-200',       dot: 'bg-red-500' },
};

const PAYMENT_CONFIG: Record<PaymentStatus, { label: string; className: string }> = {
  unpaid:   { label: 'Chưa thanh toán', className: 'bg-orange-100 text-orange-700 border-orange-200' },
  paid:     { label: 'Đã thanh toán',   className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  refunded: { label: 'Đã hoàn tiền',    className: 'bg-purple-100 text-purple-700 border-purple-200' },
};

function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, className: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${cfg.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function PaymentBadge({ status }: { status: PaymentStatus }) {
  const cfg = PAYMENT_CONFIG[status] ?? { label: status, className: 'bg-gray-100 text-gray-600 border-gray-200' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

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

function ConfirmModal({ open, title, message, confirmLabel, confirmClass = '', loading, onConfirm, onCancel }: ConfirmModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
        <h3 className="text-lg font-bold text-slate-900 mb-2" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>{title}</h3>
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
            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${confirmClass || 'bg-slate-900 hover:bg-slate-700'}`}
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
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

function buildTimeline(booking: Booking): TimelineEvent[] {
  const status = booking.status;
  const steps: { key: BookingStatus; label: string; color: string }[] = [
    { key: 'pending',     label: 'Đặt phòng',     color: 'bg-amber-400' },
    { key: 'confirmed',   label: 'Xác nhận',       color: 'bg-blue-500' },
    { key: 'checked_in',  label: 'Nhận phòng',     color: 'bg-green-500' },
    { key: 'checked_out', label: 'Trả phòng',      color: 'bg-slate-400' },
  ];
  const order = ['pending', 'confirmed', 'checked_in', 'checked_out'];
  const currentIdx = order.indexOf(status);

  return steps.map((step, i) => ({
    label: step.label,
    time: i === 0 ? formatDatetime(booking.created_at)
        : i === 1 ? formatDate(booking.check_in)
        : i === 2 ? formatDate(booking.check_in)
        : formatDate(booking.check_out),
    active: step.key === status,
    done: status !== 'cancelled' && i <= currentIdx,
    color: step.color,
  }));
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [booking, setBooking]     = useState<Booking | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  // Modal state
  const [modal, setModal] = useState<{
    open: boolean;
    action: BookingStatus | null;
    title: string;
    message: string;
    label: string;
    cls: string;
  }>({ open: false, action: null, title: '', message: '', label: '', cls: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError]     = useState<string | null>(null);

  const fetchBooking = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingService.getBookingById(id);
      setBooking(data);
    } catch (e: unknown) {
      if (e instanceof Error && e.message === 'UNAUTHORIZED') {
        setError('Phiên đăng nhập đã hết hạn hoặc bạn không có quyền truy cập. Đang chuyển hướng...');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
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

  const openModal = (action: BookingStatus) => {
    const cfg: Record<string, { title: string; message: string; label: string; cls: string }> = {
      confirmed:   { title: 'Xác nhận đặt phòng',   message: 'Bạn muốn xác nhận booking này?',               label: 'Xác nhận',   cls: 'bg-blue-600 hover:bg-blue-700' },
      cancelled:   { title: 'Hủy đặt phòng',         message: 'Thao tác này không thể hoàn tác. Tiếp tục?',  label: 'Hủy booking', cls: 'bg-red-600 hover:bg-red-700' },
      checked_in:  { title: 'Check-in khách',         message: 'Xác nhận khách đã nhận phòng?',               label: 'Check-in',   cls: 'bg-green-600 hover:bg-green-700' },
      checked_out: { title: 'Check-out khách',        message: 'Xác nhận khách đã trả phòng?',                label: 'Check-out',  cls: 'bg-slate-700 hover:bg-slate-800' },
    };
    const c = cfg[action] ?? { title: action, message: '', label: action, cls: '' };
    setModal({ open: true, action, ...c });
    setActionError(null);
  };

  const handleConfirm = async () => {
    if (!modal.action) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const updated = await bookingService.updateBookingStatus(id, modal.action);
      setBooking(updated);
      setModal(m => ({ ...m, open: false }));
    } catch (e: unknown) {
      if (e instanceof Error && e.message === 'UNAUTHORIZED') {
        setActionError('Phiên đăng nhập đã hết hạn. Đang chuyển hướng...');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('admin_info');
        }
        setTimeout(() => {
          router.push('/admin/login');
        }, 1500);
      } else {
        setActionError(e instanceof Error ? e.message : 'Có lỗi xảy ra.');
      }
    } finally {
      setActionLoading(false);
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

  const isCancelled = booking.status === 'cancelled';
  const isCheckedOut = booking.status === 'checked_out';

  const timeline = buildTimeline(booking);

  return (
    <>
      <ConfirmModal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        confirmLabel={modal.label}
        confirmClass={modal.cls}
        loading={actionLoading}
        onConfirm={handleConfirm}
        onCancel={() => setModal(m => ({ ...m, open: false }))}
      />

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
                  Booking <span className="font-mono text-blue-600">#{booking.booking_code}</span>
                </h1>
                <StatusBadge status={booking.status} />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Tạo lúc {formatDatetime(booking.created_at)}</p>
            </div>
          </div>

          {/* Action buttons */}
          {!isCancelled && !isCheckedOut && (
            <div className="flex flex-wrap gap-2">
              {booking.status === 'pending' && (
                <button
                  id="btn-confirm-booking"
                  onClick={() => openModal('confirmed')}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ✓ Xác nhận
                </button>
              )}
              {booking.status === 'confirmed' && (
                <button
                  id="btn-checkin"
                  onClick={() => openModal('checked_in')}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  → Check-in
                </button>
              )}
              {booking.status === 'checked_in' && (
                <button
                  id="btn-checkout"
                  onClick={() => openModal('checked_out')}
                  className="px-4 py-2 bg-slate-700 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                >
                  ← Check-out
                </button>
              )}
              {(booking.status === 'pending' || booking.status === 'confirmed') && (
                <button
                  id="btn-cancel-booking"
                  onClick={() => openModal('cancelled')}
                  className="px-4 py-2 bg-white text-red-600 text-sm font-semibold rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                >
                  ✕ Hủy booking
                </button>
              )}
            </div>
          )}

          {isCancelled && (
            <span className="px-4 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-lg border border-red-200">
              Booking đã bị hủy
            </span>
          )}
        </div>

        {/* ── Action error ── */}
        {actionError && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
            </svg>
            {actionError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left column ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Customer info */}
            <InfoCard title="Thông tin khách hàng">
              <InfoRow label="Họ tên" value={booking.customer?.name ?? '—'} />
              <InfoRow label="Email" value={<a href={`mailto:${booking.customer?.email}`} className="text-blue-600 hover:underline">{booking.customer?.email ?? '—'}</a>} />
              <InfoRow label="Số điện thoại" value={booking.customer?.phone ?? '—'} />
            </InfoCard>

            {/* Room info */}
            <InfoCard title="Thông tin phòng">
              <InfoRow label="Tên phòng" value={booking.room?.name ?? '—'} />
              <InfoRow label="Giá / đêm" value={formatCurrency(booking.room?.base_price ?? 0)} />
              <InfoRow label="Check-in" value={formatDate(booking.check_in)} />
              <InfoRow label="Check-out" value={formatDate(booking.check_out)} />
              <InfoRow label="Số đêm" value={`${booking.nights} đêm`} />
              <InfoRow label="Số khách" value={`${booking.guest_count} người`} />
            </InfoCard>

            {/* Timeline */}
            <InfoCard title="Timeline đặt phòng">
              <div className="space-y-0">
                {booking.status === 'cancelled' ? (
                  <div className="flex items-center gap-3 py-3">
                    <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <span className="w-3 h-3 rounded-full bg-red-500" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-red-700">Đã hủy</p>
                      <p className="text-xs text-slate-400">{formatDatetime(booking.updated_at)}</p>
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
                    <p className="text-sm text-slate-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">{booking.special_requests}</p>
                  </div>
                )}
                {booking.notes && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Ghi chú nội bộ</p>
                    <p className="text-sm text-slate-700">{booking.notes}</p>
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
                  <PaymentBadge status={booking.payment_status} />
                </div>
                <div className="border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span>Giá phòng</span>
                    <span>{formatCurrency(booking.room?.base_price ?? 0)} × {booking.nights} đêm</span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>Tổng cộng</span>
                    <span className="text-lg">{formatCurrency(booking.total_price)}</span>
                  </div>
                </div>
              </div>
            </InfoCard>

            {/* Booking meta */}
            <InfoCard title="Thông tin đặt phòng">
              <InfoRow label="Mã booking" value={<span className="font-mono font-bold text-blue-600">#{booking.booking_code}</span>} />
              <InfoRow label="Tạo lúc" value={formatDatetime(booking.created_at)} />
              <InfoRow label="Cập nhật" value={formatDatetime(booking.updated_at)} />
            </InfoCard>
          </div>
        </div>
      </div>
    </>
  );
}
