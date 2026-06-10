import { BookingStatus } from '@/types/booking';

export interface CalendarBookingDto {
  id: string;
  bookingCode: string;
  customerName: string;
  roomId: string | null;
  roomNumber: string | null;
  roomCategoryName: string | null;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  bookingStatus: BookingStatus;
}

export interface FullCalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  allDay: boolean;
  extendedProps: {
    bookingCode: string;
    customerName: string;
    room: string;
    checkIn: string;
    checkOut: string;
    status: BookingStatus;
  };
}

export const BookingCalendarEventMapper = {
  /**
   * Chuyển đổi danh sách booking thô từ API sang định dạng sự kiện của FullCalendar.
   * Lọc bỏ các booking có trạng thái CANCELLED hoặc CHECKED_OUT (mặc dù backend đã lọc, 
   * đảm bảo an toàn tối đa ở frontend).
   */
  mapToEvents(bookings: CalendarBookingDto[]): FullCalendarEvent[] {
    if (!Array.isArray(bookings)) return [];

    return bookings
      .filter((booking) => {
        const status = booking.bookingStatus;
        return status !== 'CANCELLED' && status !== 'CHECKED_OUT';
      })
      .map((booking) => {
        const roomInfo = booking.roomNumber || booking.roomCategoryName || 'Chưa gán phòng';
        // Tiêu đề: ## {roomNumber || roomCategoryName}\n{customerName}
        const title = `## ${roomInfo}\n${booking.customerName}`;

        // Xác định màu sắc theo trạng thái đặt phòng
        let backgroundColor = '#eab308'; // PENDING: yellow
        let borderColor = '#ca8a04';
        const textColor = '#ffffff';

        if (booking.bookingStatus === 'CONFIRMED') {
          backgroundColor = '#2563eb'; // CONFIRMED: blue
          borderColor = '#1d4ed8';
        } else if (booking.bookingStatus === 'CHECKED_IN') {
          backgroundColor = '#16a34a'; // CHECKED_IN: green
          borderColor = '#15803d';
        }

        return {
          id: booking.id,
          title,
          start: booking.checkInDate,
          // FullCalendar exclusive end: để hiển thị sự kiện kéo dài trọn vẹn 
          // đến hết ngày checkout (checkOutDate), ta giữ nguyên vì booking check-out lúc trưa.
          // Tuy nhiên, đối với allDay event, FullCalendar coi ngày kết thúc là exclusive, 
          // do đó nếu checkIn: 2026-06-07, checkOut: 2026-06-08, lịch sẽ hiển thị 1 ngày (07).
          // Điều này khớp hoàn hảo với ngày thực tế lưu trú (1 đêm).
          end: booking.checkOutDate,
          backgroundColor,
          borderColor,
          textColor,
          allDay: true,
          extendedProps: {
            bookingCode: booking.bookingCode,
            customerName: booking.customerName,
            room: roomInfo,
            checkIn: booking.checkInDate,
            checkOut: booking.checkOutDate,
            status: booking.bookingStatus,
          },
        };
      });
  },
};
