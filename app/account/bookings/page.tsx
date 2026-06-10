'use client';

import { useEffect, useState, useCallback } from 'react';
import { customerService } from '@/services/customer.service';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import type { Booking, BookingStatus } from '@/types/booking';
import BookingTable from '@/components/account/BookingTable';
import toast from 'react-hot-toast';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const STATUS_FILTERS: { label: string; value: BookingStatus | '' }[] = [
  { label: 'Tất cả', value: '' },
  { label: 'Chờ xác nhận', value: 'PENDING' },
  { label: 'Đã xác nhận', value: 'CONFIRMED' },
  { label: 'Đã check-in', value: 'CHECKED_IN' },
  { label: 'Đã check-out', value: 'CHECKED_OUT' },
  { label: 'Đã hoàn thành', value: 'COMPLETED' },
  { label: 'Đã hủy', value: 'CANCELLED' },
  { label: 'Hết hạn', value: 'EXPIRED' },
];

export default function BookingsPage() {
  const { refreshProfile } = useCustomerAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoadingId, setCancelLoadingId] = useState<string | null>(null);

  // Pagination & Filter States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<BookingStatus | ''>('');
  const [search, setSearch] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customerService.getBookings({
        page,
        limit: 10,
        status: status || undefined,
        search: search || undefined,
      });
      setBookings(res.data);
      setTotalPages(res.totalPages || 1);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể tải danh sách đặt phòng');
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Reset to page 1 on filter changes
  const handleStatusChange = (newStatus: BookingStatus | '') => {
    setStatus(newStatus);
    setPage(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInputValue.trim());
    setPage(1);
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Bạn có chắc chắn muốn hủy đặt phòng này?')) return;
    setCancelLoadingId(bookingId);
    try {
      await customerService.cancelBooking(bookingId);
      toast.success('Hủy đặt phòng thành công');
      fetchBookings(); // Reload data
      refreshProfile(); // Reload points
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể hủy đặt phòng');
    } finally {
      setCancelLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Đặt phòng của tôi</h1>
        <p className="text-sm text-slate-500 mt-1">
          Xem lịch sử và trạng thái các phòng bạn đã đặt tại Hotel Hoang Minh.
        </p>
      </div>

      {/* Filters Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã đặt phòng..."
            value={searchInputValue}
            onChange={(e) => setSearchInputValue(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white text-sm transition-all"
          />
        </form>

        {/* Status Scroll Tab */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {STATUS_FILTERS.map((item) => (
            <button
              key={item.label}
              onClick={() => handleStatusChange(item.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                status === item.value
                  ? 'bg-primary text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Đang tải danh sách đặt phòng...</p>
        </div>
      ) : (
        <>
          <BookingTable
            bookings={bookings}
            onCancel={handleCancelBooking}
            loadingId={cancelLoadingId}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">
                Trang <strong className="text-slate-800">{page}</strong> trên <strong className="text-slate-800">{totalPages}</strong>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
