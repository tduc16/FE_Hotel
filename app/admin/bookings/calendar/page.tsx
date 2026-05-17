'use client';

import Link from 'next/link';
import BookingCalendar from '@/components/admin/BookingCalendar';

export default function BookingCalendarPage() {
  return (
    <div className="flex flex-col h-full gap-5" style={{ minHeight: 'calc(100vh - 140px)' }}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1
            className="text-2xl font-bold text-slate-900"
            style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
          >
            Lịch Đặt Phòng
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Xem tổng quan tình trạng phòng theo từng ngày trong tháng
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
          <Link
            href="/admin/bookings"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-white hover:text-slate-900 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Danh sách
          </Link>
          <span
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-white text-slate-900 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Lịch
          </span>
        </div>
      </div>

      {/* ── Calendar ── */}
      <div className="flex-1 min-h-0">
        <BookingCalendar />
      </div>
    </div>
  );
}
