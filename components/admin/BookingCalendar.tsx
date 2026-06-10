'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { bookingService } from '@/services/booking.service';
import { Booking, BookingStatus } from '@/types/booking';
import BookingDetailModal from './BookingDetailModal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Room {
  id: string;
  name: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DAY_WIDTH = 44; // px per day column

const STATUS_STYLE: Record<BookingStatus, { bg: string; border: string; text: string; label: string }> = {
  PENDING:     { bg: 'bg-amber-400',   border: 'border-amber-500',   text: 'text-white', label: 'Chờ xác nhận' },
  CONFIRMED:   { bg: 'bg-blue-500',    border: 'border-blue-600',    text: 'text-white', label: 'Đã xác nhận' },
  CHECKED_IN:  { bg: 'bg-emerald-500', border: 'border-emerald-600', text: 'text-white', label: 'Đang ở' },
  CHECKED_OUT: { bg: 'bg-slate-400',   border: 'border-slate-500',   text: 'text-white', label: 'Đã trả phòng' },
  COMPLETED:   { bg: 'bg-emerald-600', border: 'border-emerald-700', text: 'text-white', label: 'Đã hoàn thành' },
  CANCELLED:   { bg: 'bg-red-400',     border: 'border-red-500',     text: 'text-white', label: 'Đã hủy' },
  EXPIRED:     { bg: 'bg-slate-400',   border: 'border-slate-500',   text: 'text-white', label: 'Đã hết hạn' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Trả về Date local không có giờ phút */
function toDate(iso: string): Date {
  const d = new Date(iso);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Số ngày giữa 2 date (exclusive end) */
function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/** Danh sách ngày trong tháng */
function daysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const count = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= count; d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

function fmtDay(d: Date) {
  return d.getDate();
}

function fmtWeekday(d: Date) {
  return ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()];
}

function isWeekend(d: Date) {
  return d.getDay() === 0 || d.getDay() === 6;
}

// ─── Legend Item ─────────────────────────────────────────────────────────────

function LegendItem({ status }: { status: BookingStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-3 h-3 rounded-sm ${s.bg}`} />
      <span className="text-xs text-slate-600">{s.label}</span>
    </div>
  );
}

// ─── BookingBlock ─────────────────────────────────────────────────────────────

interface BlockProps {
  booking: Booking;
  left: number;
  width: number;
  onClick: (b: Booking) => void;
}

function BookingBlock({ booking, left, width, onClick }: BlockProps) {
  const actualStatus = booking.status ?? booking.bookingStatus ?? booking.booking_status ?? 'PENDING';
  const s = STATUS_STYLE[actualStatus] ?? STATUS_STYLE.PENDING;
  const minWidth = 20;

  return (
    <div
      className={`absolute top-1 bottom-1 rounded-md border cursor-pointer select-none
        ${s.bg} ${s.border} ${s.text}
        hover:brightness-110 hover:shadow-lg hover:z-10 transition-all duration-150`}
      style={{ left: left + 2, width: Math.max(minWidth, width - 4) }}
      onClick={(e) => { e.stopPropagation(); onClick(booking); }}
      title={`${booking.room?.name || '—'} · ${booking.customerName || booking.guestName || booking.customer?.name || '—'} · ${booking.bookingCode || booking.booking_code || '—'}`}
    >
      {width > 52 && (
        <div className="px-2 h-full flex items-center overflow-hidden">
          <span className="text-[11px] font-semibold truncate leading-tight">
            {booking.customerName || booking.guestName || booking.customer?.name || booking.bookingCode || booking.booking_code || '—'}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BookingCalendar() {
  const router = useRouter();

  const today = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Days of current month
  const days = useMemo(() => daysInMonth(year, month), [year, month]);

  // Month date range for API
  const dateFrom = useMemo(() => {
    const d = new Date(year, month, 1);
    return d.toISOString().split('T')[0];
  }, [year, month]);

  const dateTo = useMemo(() => {
    const d = new Date(year, month + 1, 0);
    return d.toISOString().split('T')[0];
  }, [year, month]);

  // Fetch
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingService.getCalendarBookings(dateFrom, dateTo);
      setBookings(data);
    } catch (e: unknown) {
      if (e instanceof Error && e.message === 'UNAUTHORIZED') {
        setError('Phiên đăng nhập đã hết hạn. Đang chuyển hướng...');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('admin_info');
        }
        setTimeout(() => {
          router.push('/admin/login');
        }, 1500);
      } else {
        setError(e instanceof Error ? e.message : 'Không thể tải dữ liệu');
      }
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, refreshKey, router]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchData(); }, [fetchData]);

  // Scroll to today on mount / month change
  useEffect(() => {
    if (!scrollRef.current || month !== today.getMonth() || year !== today.getFullYear()) return;
    const offset = today.getDate() - 1;
    scrollRef.current.scrollLeft = Math.max(0, offset * DAY_WIDTH - 100);
  }, [month, year, today, loading]);

  // Group bookings by room
  const rooms = useMemo<Room[]>(() => {
    const map = new Map<string, string>();
    bookings.forEach((b) => {
      if (b.room?.id) map.set(b.room.id, b.room.name);
    });
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  }, [bookings]);

  // Map room → bookings
  const bookingsByRoom = useMemo<Map<string, Booking[]>>(() => {
    const map = new Map<string, Booking[]>();
    rooms.forEach((r) => map.set(r.id, []));
    bookings.forEach((b) => {
      if (b.room?.id && map.has(b.room.id)) {
        map.get(b.room.id)!.push(b);
      }
    });
    return map;
  }, [rooms, bookings]);

  // Month start for offset calculation
  const monthStart = useMemo(() => new Date(year, month, 1), [year, month]);

  /** Tính left + width của booking block trong month */
  function blockGeometry(booking: Booking) {
    const ciDate = toDate(booking.checkInDate || booking.check_in_date || booking.check_in || '');
    const coDate = toDate(booking.checkOutDate || booking.check_out_date || booking.check_out || '');

    // Clamp to month bounds
    const effectiveStart = ciDate < monthStart ? monthStart : ciDate;
    const effectiveEnd = coDate > days[days.length - 1] ? days[days.length - 1] : coDate;

    const left = daysBetween(monthStart, effectiveStart) * DAY_WIDTH;
    const width = daysBetween(effectiveStart, effectiveEnd) * DAY_WIDTH;
    return { left, width };
  }

  /** Kiểm tra phòng có booking active trong tháng không */
  function isRoomOccupied(roomId: string): boolean {
    return (bookingsByRoom.get(roomId) ?? []).some(
      (b) => {
        const bStatus = b.status ?? b.bookingStatus ?? b.booking_status;
        return (
          bStatus !== 'CANCELLED' &&
          bStatus !== 'CHECKED_OUT' &&
          toDate(b.checkOutDate || b.check_out_date || b.check_out || '') > today &&
          toDate(b.checkInDate || b.check_in_date || b.check_in || '') <= today
        );
      }
    );
  }

  /** Kiểm tra phòng full (toàn tháng bị occupied) */
  function isRoomFull(roomId: string): boolean {
    const bs = (bookingsByRoom.get(roomId) ?? []).filter(
      (b) => (b.status ?? b.bookingStatus ?? b.booking_status) !== 'CANCELLED'
    );
    if (bs.length === 0) return false;
    let covered = 0;
    bs.forEach((b) => {
      const start = Math.max(0, daysBetween(monthStart, toDate(b.checkInDate || b.check_in_date || b.check_in || '')));
      const end = Math.min(days.length, daysBetween(monthStart, toDate(b.checkOutDate || b.check_out_date || b.check_out || '')));
      covered += Math.max(0, end - start);
    });
    return covered >= days.length * 0.85;
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  }

  function goToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  }

  const MONTH_NAMES = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
  ];

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
  const totalWidth = days.length * DAY_WIDTH;
  const ROOM_COL_W = 160;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="flex flex-col h-full min-h-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* ── Toolbar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-200 bg-white z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
              aria-label="Tháng trước"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="text-center">
              <h2 className="text-lg font-bold text-slate-900">
                {MONTH_NAMES[month]} {year}
              </h2>
              <p className="text-xs text-slate-400">{days.length} ngày · {rooms.length} phòng</p>
            </div>

            <button
              onClick={nextMonth}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
              aria-label="Tháng sau"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {!isCurrentMonth && (
              <button
                onClick={goToday}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors ml-1"
              >
                Hôm nay
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Legend */}
            <div className="flex items-center gap-3 flex-wrap">
              {(Object.keys(STATUS_STYLE) as BookingStatus[]).map((s) => (
                <LegendItem key={s} status={s} />
              ))}
            </div>

            {/* Refresh */}
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              disabled={loading}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-50"
              aria-label="Làm mới"
              title="Làm mới dữ liệu"
            >
              <svg
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        {error ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <p className="text-slate-700 font-semibold mb-3">{error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            {/* ── Room column (fixed left) ── */}
            <div
              className="flex-shrink-0 bg-slate-50 border-r border-slate-200 z-10"
              style={{ width: ROOM_COL_W }}
            >
              {/* Header spacer */}
              <div className="border-b border-slate-200 bg-slate-100 px-3 py-2 h-[52px] flex items-center">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phòng</span>
              </div>

              {/* Room rows */}
              {loading ? (
                <div className="animate-pulse py-2 px-3 space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-12 bg-slate-200 rounded-lg" />
                  ))}
                </div>
              ) : rooms.length === 0 ? (
                <div className="px-3 py-4 text-xs text-slate-400">Không có dữ liệu</div>
              ) : (
                rooms.map((room) => {
                  const occupied = isRoomOccupied(room.id);
                  const full = isRoomFull(room.id);
                  return (
                    <div
                      key={room.id}
                      className={`border-b border-slate-200 h-14 flex items-center px-3 gap-2 transition-colors
                        ${full ? 'bg-red-50' : occupied ? 'bg-emerald-50' : 'bg-white'}`}
                    >
                      {/* Status dot */}
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          full ? 'bg-red-400 animate-pulse' : occupied ? 'bg-emerald-400' : 'bg-slate-300'
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{room.name}</p>
                        {full && (
                          <p className="text-[10px] font-semibold text-red-500 uppercase tracking-wide">Full</p>
                        )}
                        {!full && occupied && (
                          <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">Có khách</p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ── Scrollable grid ── */}
            <div ref={scrollRef} className="flex-1 overflow-x-auto overflow-y-auto">
              <div style={{ width: totalWidth, minWidth: totalWidth }}>
                {/* Day header */}
                <div
                  className="flex border-b border-slate-200 bg-slate-100 sticky top-0 z-10"
                  style={{ height: 52 }}
                >
                  {days.map((d) => {
                    const isTodayCol =
                      d.getDate() === today.getDate() &&
                      d.getMonth() === today.getMonth() &&
                      d.getFullYear() === today.getFullYear();
                    const weekend = isWeekend(d);

                    return (
                      <div
                        key={d.toISOString()}
                        className={`flex-shrink-0 border-r border-slate-200 flex flex-col items-center justify-center
                          ${isTodayCol ? 'bg-blue-600 text-white' : weekend ? 'bg-slate-200/60' : ''}
                        `}
                        style={{ width: DAY_WIDTH }}
                      >
                        <span className={`text-[10px] font-semibold uppercase ${isTodayCol ? 'text-blue-100' : 'text-slate-400'}`}>
                          {fmtWeekday(d)}
                        </span>
                        <span className={`text-sm font-bold ${isTodayCol ? 'text-white' : weekend ? 'text-slate-600' : 'text-slate-700'}`}>
                          {fmtDay(d)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Room rows with bookings */}
                {loading ? (
                  <div className="animate-pulse">
                    {[...Array(6)].map((_, ri) => (
                      <div key={ri} className="border-b border-slate-100 h-14 flex items-center px-4 gap-3">
                        <div className="h-6 w-40 bg-slate-200 rounded" />
                        <div className="h-6 w-24 bg-slate-200 rounded" />
                      </div>
                    ))}
                  </div>
                ) : rooms.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-slate-400 font-medium">Không có booking trong tháng này</p>
                  </div>
                ) : (
                  rooms.map((room) => {
                    const roomBookings = bookingsByRoom.get(room.id) ?? [];
                    const full = isRoomFull(room.id);

                    return (
                      <div
                        key={room.id}
                        className={`relative border-b border-slate-100 h-14
                          ${full ? 'bg-red-50/40' : ''}`}
                        style={{ width: totalWidth }}
                      >
                        {/* Day grid lines */}
                        {days.map((d, i) => {
                          const isTodayCol =
                            d.getDate() === today.getDate() &&
                            d.getMonth() === today.getMonth() &&
                            d.getFullYear() === today.getFullYear();
                          const weekend = isWeekend(d);

                          return (
                            <div
                              key={i}
                              className={`absolute top-0 bottom-0 border-r border-slate-100
                                ${isTodayCol ? 'bg-blue-50/60' : weekend ? 'bg-slate-50/80' : ''}`}
                              style={{ left: i * DAY_WIDTH, width: DAY_WIDTH }}
                            />
                          );
                        })}

                        {/* Booking blocks */}
                        {roomBookings.map((booking) => {
                          const { left, width } = blockGeometry(booking);
                          if (width <= 0) return null;
                          return (
                            <BookingBlock
                              key={booking.id}
                              booking={booking}
                              left={left}
                              width={width}
                              onClick={setSelected}
                            />
                          );
                        })}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Stats footer ── */}
        {!loading && !error && rooms.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 flex flex-wrap gap-4 text-xs">
            {(Object.keys(STATUS_STYLE) as BookingStatus[]).map((s) => {
              const count = bookings.filter((b) => (b.status ?? b.bookingStatus ?? b.booking_status) === s).length;
              if (count === 0) return null;
              const style = STATUS_STYLE[s];
              return (
                <div key={s} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-sm ${style.bg}`} />
                  <span className="text-slate-500">{style.label}:</span>
                  <span className="font-bold text-slate-700">{count}</span>
                </div>
              );
            })}
            <div className="ml-auto text-slate-400">
              Tổng: <span className="font-bold text-slate-700">{bookings.length}</span> booking
            </div>
          </div>
        )}
      </div>

      {/* ── Booking Detail Modal ── */}
      <BookingDetailModal
        booking={selected}
        onClose={() => setSelected(null)}
        onViewDetail={(id) => router.push(`/admin/bookings/${id}`)}
      />
    </>
  );
}
