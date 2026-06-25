'use client';

import { useEffect, useState, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { customerService } from '@/services/customer.service';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import type { Booking } from '@/types/booking';
import StatusBadge from '@/components/account/StatusBadge';
import toast from 'react-hot-toast';
import { ArrowLeft, Calendar, User, CreditCard, Clock, MapPin, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { refreshProfile } = useCustomerAuth();
  const id = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchDetail = async () => {
    try {
      const data = await customerService.getBookingById(id);
      setBooking(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể tải chi tiết đặt phòng');
      router.push('/account/bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const handleCancelBooking = async () => {
    if (!booking) return;
    if (!confirm('Bạn có chắc chắn muốn hủy đặt phòng này?')) return;
    setCancelLoading(true);
    try {
      await customerService.cancelBooking(booking.id);
      toast.success('Hủy đặt phòng thành công');
      fetchDetail(); // Reload detail
      refreshProfile(); // Reload points
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể hủy đặt phòng');
    } finally {
      setCancelLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateOnly = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Đang tải chi tiết đặt phòng...</p>
      </div>
    );
  }

  if (!booking) return null;

  const code = booking.booking_code || booking.bookingCode || '';
  const checkIn = booking.check_in || booking.checkInDate || booking.check_in_date;
  const checkOut = booking.check_out || booking.checkOutDate || booking.check_out_date;
  const price = booking.total_price ?? booking.totalPrice ?? 0;
  const status = booking.status || booking.bookingStatus || booking.booking_status || 'PENDING';
  const customerName = booking.customer?.name || booking.customerName || booking.guestName || 'Khách hàng';
  const customerEmail = booking.customer?.email || booking.email || '';
  const customerPhone = booking.customer?.phone || booking.phone || '';
  const nights = booking.nights ?? booking.nightCount ?? booking.night_count ?? 1;
  const guests = booking.guest_count ?? booking.guestCount ?? 1;

  const isCancelable = status === 'PENDING' || status === 'CONFIRMED';

  const payStatus = booking.payment_status || booking.paymentStatus || 'UNPAID';

  const paymentStatusMap: Record<string, { label: string; color: string }> = {
    UNPAID: { label: 'Chưa thanh toán', color: 'text-amber-700 bg-amber-50 border-amber-200/50' },
    PAID: { label: 'Đã thanh toán', color: 'text-emerald-700 bg-emerald-50 border-emerald-200/50' },
    REFUNDED: { label: 'Đã hoàn tiền', color: 'text-slate-600 bg-slate-100 border-slate-200/50' },
    FAILED: { label: 'Thanh toán thất bại', color: 'text-red-700 bg-red-50 border-red-200/50' },
  };

  const paymentConfig = paymentStatusMap[payStatus] || paymentStatusMap['UNPAID'];

  // Lịch sử timeline
  const histories = booking.histories || [];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link
          href="/account/bookings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={16} />
          Quay lại danh sách
        </Link>
        {isCancelable && (
          <button
            onClick={handleCancelBooking}
            disabled={cancelLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-100/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {cancelLoading ? (
              <span className="w-4 h-4 border-2 border-red-500/30 border-t-red-600 rounded-full animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            Hủy đặt phòng
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Booking Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Mã đặt phòng
                </span>
                <h2 className="text-2xl font-bold text-slate-900">{code}</h2>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <StatusBadge status={status} />
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${paymentConfig.color}`}>
                  {paymentConfig.label}
                </span>
              </div>
            </div>

            {/* Stay Info */}
            <div className="grid grid-cols-2 gap-6 py-2">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Check-in
                </span>
                <p className="font-semibold text-slate-800">{formatDateOnly(checkIn)}</p>
                <p className="text-xs text-slate-400">Từ 14:00</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Check-out
                </span>
                <p className="font-semibold text-slate-800">{formatDateOnly(checkOut)}</p>
                <p className="text-xs text-slate-400">Trước 12:00</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Số khách
                </span>
                <p className="font-semibold text-slate-800">{guests} khách</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Số đêm nghỉ
                </span>
                <p className="font-semibold text-slate-800">{nights} đêm</p>
              </div>
            </div>
          </div>

          {/* Room Details */}
          {booking.room && (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm flex flex-col sm:flex-row">
              {booking.room.thumbnail_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={booking.room.thumbnail_url}
                  alt={booking.room.name}
                  className="w-full sm:w-48 h-36 sm:h-auto object-cover flex-shrink-0"
                />
              )}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{booking.room.name}</h3>
                  <div className="flex items-center gap-1 text-slate-500 text-xs mt-1.5">
                    <MapPin size={12} />
                    <span>Tầng 3 - Tòa A, Hotel Hoang Minh</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mt-4 pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-400 font-medium">Đơn giá phòng:</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {formatPrice(booking.room.base_price)} / đêm
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Customer Info */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User size={18} className="text-slate-400" />
              Thông tin người đặt phòng
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm pt-2">
              <div>
                <span className="text-slate-400 block mb-0.5">Họ và tên</span>
                <strong className="text-slate-800 font-semibold">{customerName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Email</span>
                <strong className="text-slate-800 font-semibold">{customerEmail}</strong>
              </div>
              {customerPhone && (
                <div>
                  <span className="text-slate-400 block mb-0.5">Số điện thoại</span>
                  <strong className="text-slate-800 font-semibold">{customerPhone}</strong>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Timeline & Receipt */}
        <div className="space-y-6">
          {/* Price Summary */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard size={18} className="text-slate-400" />
              Tóm tắt chi phí
            </h3>
            <div className="space-y-2.5 text-sm pt-2">
              {booking.room && (
                <div className="flex justify-between text-slate-500">
                  <span>
                    Giá phòng ({nights} đêm)
                  </span>
                  <span>{formatPrice(booking.room.base_price * nights)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Phí dịch vụ</span>
                <span>Miễn phí</span>
              </div>
              <div className="flex justify-between text-slate-500 pb-2.5 border-b border-slate-100">
                <span>Thuế VAT (8%)</span>
                <span>Đã bao gồm</span>
              </div>
              <div className="flex justify-between font-bold text-base text-slate-900 pt-1">
                <span>Tổng chi phí</span>
                <span className="text-primary">{formatPrice(price)}</span>
              </div>
            </div>
          </div>

          {/* Timeline History */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock size={18} className="text-slate-400" />
              Lịch sử đặt phòng
            </h3>
            <div className="relative border-l border-slate-100 pl-4 ml-2.5 space-y-5 pt-2">
              {histories.length > 0 ? (
                histories.map((history) => {
                  const timestamp = history.createdAt || history.created_at || history.timestamp;
                  return (
                    <div key={history.id} className="relative text-xs">
                      {/* Timeline Dot */}
                      <span className="absolute -left-[22px] top-1 w-2.5 h-2.5 rounded-full bg-slate-200 border-2 border-white ring-4 ring-slate-50" />
                      <p className="font-semibold text-slate-800">{history.action}</p>
                      {history.note && <p className="text-slate-500 mt-0.5">{history.note}</p>}
                      <span className="text-[10px] text-slate-400 font-medium block mt-1">
                        {formatDate(timestamp)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="relative text-xs">
                  <span className="absolute -left-[22px] top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-white ring-4 ring-primary/15" />
                  <p className="font-semibold text-slate-800">Đặt phòng được khởi tạo</p>
                  <span className="text-[10px] text-slate-400 font-medium block mt-1">
                    {formatDate(booking.created_at || booking.createdAt || undefined)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
