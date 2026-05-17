'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { bookingService } from '@/services/booking.service';
import { Booking, BookingQuery, BookingStatus, PaymentStatus } from '@/types/booking';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ─── Badges ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<BookingStatus, { label: string; className: string }> = {
  pending:     { label: 'Chờ xác nhận', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  confirmed:   { label: 'Đã xác nhận',  className: 'bg-blue-100 text-blue-700 border-blue-200' },
  checked_in:  { label: 'Đã nhận phòng', className: 'bg-green-100 text-green-700 border-green-200' },
  checked_out: { label: 'Đã trả phòng', className: 'bg-slate-100 text-slate-600 border-slate-200' },
  cancelled:   { label: 'Đã hủy',       className: 'bg-red-100 text-red-700 border-red-200' },
};

const PAYMENT_CONFIG: Record<PaymentStatus, { label: string; className: string }> = {
  unpaid:   { label: 'Chưa thanh toán', className: 'bg-orange-100 text-orange-700 border-orange-200' },
  paid:     { label: 'Đã thanh toán',   className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  refunded: { label: 'Đã hoàn tiền',    className: 'bg-purple-100 text-purple-700 border-purple-200' },
};

function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, className: 'bg-gray-100 text-gray-600 border-gray-200' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.className}`}>
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="animate-pulse">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex gap-4 px-6 py-4 border-b border-slate-100">
          {[...Array(8)].map((_, j) => (
            <div key={j} className="h-4 bg-slate-200 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function AdminBookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial state from URL
  const [search, setSearch]               = useState(searchParams.get('search') ?? '');
  const [status, setStatus]               = useState<BookingStatus | ''>(
    (searchParams.get('status') as BookingStatus) ?? ''
  );
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | ''>(
    (searchParams.get('payment_status') as PaymentStatus) ?? ''
  );
  const [dateFrom, setDateFrom]           = useState(searchParams.get('date_from') ?? '');
  const [dateTo, setDateTo]               = useState(searchParams.get('date_to') ?? '');
  const [page, setPage]                   = useState(Number(searchParams.get('page') ?? 1));

  const [bookings, setBookings]   = useState<Booking[]>([]);
  const [total, setTotal]         = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const limit = 10;

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query: BookingQuery = {
        page, limit, search: search || undefined,
        status: status || undefined,
        payment_status: paymentStatus || undefined,
        check_in_from: dateFrom || undefined,
        check_in_to: dateTo || undefined,
      };
      const res = await bookingService.getBookings(query);
      setBookings(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e: unknown) {
      if (e instanceof Error && e.message === 'UNAUTHORIZED') {
        // Token expired or invalid
        setError('Phiên đăng nhập đã hết hạn hoặc bạn không có quyền truy cập. Đang chuyển hướng...');
        // We can do authService.logout() if imported, but we can also just clear localStorage directly here or import it
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('admin_info');
        }
        setTimeout(() => {
          router.push('/admin/login');
        }, 1500);
      } else {
        setError(e instanceof Error ? e.message : 'Có lỗi xảy ra khi tải dữ liệu.');
      }
    } finally {
      setLoading(false);
    }
  }, [page, search, status, paymentStatus, dateFrom, dateTo, router]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (search)        params.set('search', search);
    if (status)        params.set('status', status);
    if (paymentStatus) params.set('payment_status', paymentStatus);
    if (dateFrom)      params.set('date_from', dateFrom);
    if (dateTo)        params.set('date_to', dateTo);
    if (page > 1)      params.set('page', String(page));
    router.replace(`/admin/bookings?${params.toString()}`, { scroll: false });
  }, [search, status, paymentStatus, dateFrom, dateTo, page, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const resetFilters = () => {
    setSearch(''); setStatus(''); setPaymentStatus(''); setDateFrom(''); setDateTo(''); setPage(1);
  };

  const hasFilters = search || status || paymentStatus || dateFrom || dateTo;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
            Quản lý Đặt phòng
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tổng cộng <span className="font-semibold text-slate-700">{total}</span> booking
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-white text-slate-900 shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Danh sách
          </span>
          <Link
            href="/admin/bookings/calendar"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-white hover:text-slate-900 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Lịch
          </Link>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Tìm kiếm
            </label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Tên khách, mã booking..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          {/* Status */}
          <div className="min-w-[160px]">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Trạng thái
            </label>
            <select
              value={status}
              onChange={e => { setStatus(e.target.value as BookingStatus | ''); setPage(1); }}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Tất cả</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          {/* Payment */}
          <div className="min-w-[160px]">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Thanh toán
            </label>
            <select
              value={paymentStatus}
              onChange={e => { setPaymentStatus(e.target.value as PaymentStatus | ''); setPage(1); }}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Tất cả</option>
              {Object.entries(PAYMENT_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          {/* Date from */}
          <div className="min-w-[140px]">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Check-in từ
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Date to */}
          <div className="min-w-[140px]">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Check-in đến
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={e => { setDateTo(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 transition-colors"
            >
              Lọc
            </button>
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 bg-white text-slate-600 text-sm font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <p className="text-slate-700 font-semibold">{error}</p>
            <button onClick={fetchBookings} className="mt-4 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 transition-colors">
              Thử lại
            </button>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Mã booking</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Khách hàng</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Phòng</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Check-in</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Check-out</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Tổng tiền</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Thanh toán</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8}>
                        <TableSkeleton />
                      </td>
                    </tr>
                  ) : bookings.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <p className="text-slate-500 font-medium">Không tìm thấy booking nào</p>
                          {hasFilters && (
                            <button onClick={resetFilters} className="mt-3 text-blue-600 text-sm hover:underline">
                              Xóa bộ lọc để xem tất cả
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    bookings.map((booking, index) => (
                      <tr
                        key={booking.id}
                        className={`border-b border-slate-100 hover:bg-slate-50/80 transition-colors cursor-pointer group ${
                          index % 2 === 0 ? '' : 'bg-slate-50/30'
                        }`}
                        onClick={() => router.push(`/admin/bookings/${booking.id}`)}
                      >
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                            #{booking.booking_code}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div>
                            <p className="font-medium text-slate-800">{booking.customer?.name ?? '—'}</p>
                            <p className="text-xs text-slate-400">{booking.customer?.email ?? ''}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-slate-700 font-medium">{booking.room?.name ?? '—'}</span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">{formatDate(booking.check_in)}</td>
                        <td className="px-4 py-3.5 text-slate-600">{formatDate(booking.check_out)}</td>
                        <td className="px-4 py-3.5 text-right font-semibold text-slate-800">
                          {formatCurrency(booking.total_price)}
                        </td>
                        <td className="px-4 py-3.5">
                          <PaymentBadge status={booking.payment_status} />
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={booking.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ── */}
            {!loading && totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Trang <span className="font-semibold">{page}</span> / <span className="font-semibold">{totalPages}</span>
                  &nbsp;·&nbsp; Tổng <span className="font-semibold">{total}</span> booking
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {[...Array(totalPages)].map((_, i) => {
                    const p = i + 1;
                    if (totalPages <= 7 || p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                            p === page
                              ? 'bg-slate-900 text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    }
                    if (p === 2 || p === totalPages - 1) {
                      return <span key={p} className="px-1 text-slate-400">…</span>;
                    }
                    return null;
                  })}

                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
