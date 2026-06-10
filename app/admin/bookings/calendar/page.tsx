'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { BookingCalendarEventMapper, FullCalendarEvent } from '@/services/BookingCalendarEventMapper';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function BookingCalendarPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<FullCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Khoảng ngày hiện tại đang xem trên lịch
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string } | null>(null);

  // Tooltip state
  const [hoveredEvent, setHoveredEvent] = useState<any>(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

  // Đảm bảo chỉ render FullCalendar ở client-side để tránh lỗi SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  // Hàm gọi API fetch dữ liệu calendar
  const fetchCalendarData = useCallback(async (startDate: string, endDate: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const url = `${baseUrl}/admin/bookings/calendar?startDate=${startDate}&endDate=${endDate}`;
      const res = await fetch(url, {
        headers,
        cache: 'no-store',
      });

      if (res.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('admin_info');
        }
        router.push('/admin/login');
        return;
      }

      if (!res.ok) {
        throw new Error(`Tải dữ liệu thất bại: HTTP ${res.status}`);
      }

      const data = await res.json();
      // Map dữ liệu sang cấu trúc sự kiện của FullCalendar
      const mappedEvents = BookingCalendarEventMapper.mapToEvents(data);
      setEvents(mappedEvents);
    } catch (err: any) {
      console.error('[BookingCalendarPage] Fetch error:', err);
      setError(err?.message || 'Có lỗi xảy ra khi tải dữ liệu lịch phòng');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Gọi fetch mỗi khi date range thay đổi
  useEffect(() => {
    if (dateRange) {
      fetchCalendarData(dateRange.startDate, dateRange.endDate);
    }
  }, [dateRange, fetchCalendarData]);

  // Xử lý khi view hoặc khoảng ngày hiển thị thay đổi trên FullCalendar
  const handleDatesSet = (dateInfo: any) => {
    const startStr = dateInfo.startStr.split('T')[0];
    const endStr = dateInfo.endStr.split('T')[0];
    setDateRange({ startDate: startStr, endDate: endStr });
  };

  // Click vào sự kiện chuyển sang trang chi tiết (không reload trang)
  const handleEventClick = (info: any) => {
    setHoveredEvent(null); // Đóng tooltip
    router.push(`/admin/bookings/${info.event.id}`);
  };

  // Hover chuột vào sự kiện để hiện Tooltip
  const handleEventMouseEnter = (info: any) => {
    const rect = info.el.getBoundingClientRect();
    const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    const scrollX = typeof window !== 'undefined' ? window.scrollX : 0;

    setHoveredEvent(info.event.extendedProps);
    setTooltipPos({
      top: rect.top + scrollY - 8, // Hiển thị phía trên sự kiện 8px
      left: rect.left + scrollX + rect.width / 2, // Hiển thị ở chính giữa chiều rộng sự kiện
    });
  };

  // Rời chuột khỏi sự kiện
  const handleEventMouseLeave = () => {
    setHoveredEvent(null);
  };

  // Render nội dung tùy chỉnh cho sự kiện trên lịch (Hiển thị nhiều dòng)
  const renderEventContent = (eventInfo: any) => {
    const title = eventInfo.event.title;
    // Tách chuỗi theo dấu xuống dòng \n
    const parts = title.split('\n');
    const room = parts[0] ? parts[0].replace('## ', '') : '';
    const customer = parts[1] || '';

    return (
      <div className="flex flex-col w-full overflow-hidden text-xs py-0.5 px-1 leading-tight">
        <span className="font-bold truncate text-[11px] flex items-center gap-1">
          <span className="material-symbols-outlined text-[12px] opacity-90">bed</span>
          {room}
        </span>
        <span className="truncate opacity-90 text-[10px] mt-0.5">{customer}</span>
      </div>
    );
  };

  // Hàm chuyển đổi status sang tiếng Việt và màu sắc phù hợp cho tooltip
  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Chờ xác nhận', badgeClass: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'CONFIRMED':
        return { label: 'Đã xác nhận', badgeClass: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'CHECKED_IN':
        return { label: 'Đang lưu trú', badgeClass: 'bg-green-100 text-green-800 border-green-200' };
      default:
        return { label: status, badgeClass: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-5 relative" style={{ minHeight: 'calc(100vh - 140px)' }}>
      {/* CSS tùy chỉnh cho FullCalendar */}
      <style jsx global>{`
        .fc {
          font-family: 'Hanken Grotesk', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background-color: #ffffff;
          padding: 1.25rem;
          border-radius: 1rem;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
        }
        .fc .fc-button-primary {
          background-color: #0f172a !important; /* Slate 900 */
          border-color: #0f172a !important;
          border-radius: 0.5rem !important;
          font-weight: 600;
          font-size: 0.825rem;
          padding: 0.4rem 0.8rem;
          transition: all 0.2s;
          text-transform: capitalize;
        }
        .fc .fc-button-primary:hover {
          background-color: #1e293b !important;
          border-color: #1e293b !important;
        }
        .fc .fc-button-primary:disabled {
          background-color: #e2e8f0 !important;
          border-color: #e2e8f0 !important;
          color: #94a3b8 !important;
        }
        .fc .fc-button-active {
          background-color: #2563eb !important; /* Blue 600 */
          border-color: #2563eb !important;
          color: #ffffff !important;
        }
        .fc .fc-toolbar-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
        }
        .fc-theme-standard td, .fc-theme-standard th {
          border-color: #f1f5f9;
        }
        .fc .fc-col-header-cell-cushion {
          font-size: 0.775rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 10px 0;
        }
        .fc .fc-daygrid-day-number {
          font-size: 0.825rem;
          font-weight: 700;
          color: #475569;
          padding: 6px 8px;
        }
        .fc .fc-daygrid-event {
          border-radius: 0.375rem;
          padding: 3px 6px;
          margin-top: 2px;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .fc .fc-daygrid-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
          filter: brightness(1.05);
        }
        .fc .fc-day-today {
          background-color: #f8fafc !important;
        }
        .fc .fc-day-today .fc-daygrid-day-number {
          color: #2563eb;
          background-color: #dbeafe;
          border-radius: 9999px;
          display: inline-block;
          min-width: 24px;
          height: 24px;
          text-align: center;
          line-height: 24px;
          padding: 0;
          margin: 4px;
        }
        .fc-event-title-container {
          overflow: hidden;
        }
        /* Style cho view timeGrid */
        .fc-timegrid-event {
          border-radius: 0.375rem;
          padding: 2px 4px;
        }
      `}</style>

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
            Xem tổng quan tình trạng phòng theo tháng hoặc tuần
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1 shadow-sm">
          <Link
            href="/admin/bookings"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-white hover:text-slate-900 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
            Danh sách
          </Link>
          <span
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-white text-slate-900 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            Lịch
          </span>
        </div>
      </div>

      {/* Trạng thái lỗi */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600">error</span>
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button
            onClick={() => dateRange && fetchCalendarData(dateRange.startDate, dateRange.endDate)}
            className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-all"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Empty state: Không có booking trong khoảng thời gian này */}
      {!loading && !error && events.length === 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-center gap-3 animate-fade-in shadow-sm">
          <span className="material-symbols-outlined text-amber-600">info</span>
          <span className="text-sm font-semibold">Không có booking trong khoảng thời gian này</span>
        </div>
      )}

      {/* Lịch phòng */}
      <div className="flex-1 min-h-0 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 flex items-center justify-center rounded-2xl">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-xs font-semibold text-slate-500">Đang tải dữ liệu...</span>
            </div>
          </div>
        )}

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek',
          }}
          buttonText={{
            today: 'Hôm nay',
            month: 'Tháng',
            week: 'Tuần',
          }}
          locale="vi"
          firstDay={1} // Bắt đầu tuần từ thứ Hai
          events={events}
          eventClick={handleEventClick}
          eventMouseEnter={handleEventMouseEnter}
          eventMouseLeave={handleEventMouseLeave}
          datesSet={handleDatesSet}
          eventContent={renderEventContent}
          height="auto"
          dayMaxEvents={4} // Giới hạn số lượng sự kiện hiển thị trên ô ngày
        />
      </div>

      {/* Custom Tooltip */}
      {hoveredEvent && (
        <div
          className="absolute z-[9999] bg-white/95 backdrop-blur-md text-slate-800 p-4 rounded-xl shadow-2xl border border-slate-100 pointer-events-none transform -translate-x-1/2 -translate-y-full w-72 transition-all duration-150 animate-fade-in"
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left,
          }}
        >
          {/* Mũi tên tooltip chỉ xuống */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white"></div>
          
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Mã Đặt Phòng</span>
            <span className="text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
              {hoveredEvent.bookingCode}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] text-slate-400 mt-0.5">person</span>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Khách Hàng</p>
                <p className="font-semibold text-slate-800">{hoveredEvent.customerName}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] text-slate-400 mt-0.5">bed</span>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Phòng</p>
                <p className="font-semibold text-slate-800">{hoveredEvent.room}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="flex items-start gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-emerald-500 mt-0.5">login</span>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Check In</p>
                  <p className="font-bold text-slate-700">{hoveredEvent.checkIn}</p>
                </div>
              </div>

              <div className="flex items-start gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-rose-500 mt-0.5">logout</span>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Check Out</p>
                  <p className="font-bold text-slate-700">{hoveredEvent.checkOut}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Trạng Thái</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${getStatusDetails(hoveredEvent.status).badgeClass}`}>
                {getStatusDetails(hoveredEvent.status).label}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
