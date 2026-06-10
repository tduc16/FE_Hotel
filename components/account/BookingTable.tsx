'use client';

import { Booking } from '@/types/booking';
import StatusBadge from './StatusBadge';
import Link from 'next/link';
import { Calendar, Eye, Trash2 } from 'lucide-react';

interface BookingTableProps {
  bookings: Booking[];
  onCancel?: (bookingId: string) => void;
  loadingId?: string | null;
}

export default function BookingTable({ bookings, onCancel, loadingId }: BookingTableProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 p-8">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar size={28} className="text-slate-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">Không có đặt phòng nào</h3>
        <p className="text-sm text-slate-500 mt-1">
          Bạn chưa thực hiện bất kỳ đặt phòng nào hoặc không có phòng nào phù hợp với bộ lọc.
        </p>
        <Link href="/rooms" className="mt-5 inline-flex justify-center px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors">
          Khám phá phòng ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-4">Mã đặt phòng</th>
              <th className="px-6 py-4">Phòng</th>
              <th className="px-6 py-4">Check-in</th>
              <th className="px-6 py-4">Check-out</th>
              <th className="px-6 py-4">Tổng tiền</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {bookings.map((booking) => {
              const id = booking.id;
              const code = booking.booking_code || booking.bookingCode || '';
              const checkIn = booking.check_in || booking.checkInDate || booking.check_in_date;
              const checkOut = booking.check_out || booking.checkOutDate || booking.check_out_date;
              const price = booking.total_price ?? booking.totalPrice ?? 0;
              const status = booking.status || booking.bookingStatus || booking.booking_status || 'PENDING';
              const roomName = booking.room?.name || 'Phòng nghỉ dưỡng';

              const isCancelable = status === 'PENDING' || status === 'CONFIRMED';
              const isCanceling = loadingId === id;

              return (
                <tr key={id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">{code}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{roomName}</td>
                  <td className="px-6 py-4 text-slate-500">{formatDate(checkIn)}</td>
                  <td className="px-6 py-4 text-slate-500">{formatDate(checkOut)}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{formatPrice(price)}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/account/bookings/${id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                      >
                        <Eye size={14} />
                        Chi tiết
                      </Link>
                      {isCancelable && onCancel && (
                        <button
                          onClick={() => onCancel(id)}
                          disabled={isCanceling}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isCanceling ? (
                            <span className="w-3.5 h-3.5 border-2 border-red-500/30 border-t-red-600 rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                          Hủy
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
