import {
  BookingSearchRequest,
  BookingSearchResponse,
  ManageBookingResponse,
  CancelBookingRequest,
  CancelBookingResponse,
} from '@/types/public-booking';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Public Booking Service - không cần xác thực (JWT)
 * Sử dụng cho guest tự tra cứu và quản lý đặt phòng của mình.
 */
export const publicBookingService = {
  /**
   * Tìm kiếm đặt phòng theo mã + số điện thoại
   * GET /public/bookings/search?booking_code=...&phone=...
   */
  async searchBooking(payload: BookingSearchRequest): Promise<BookingSearchResponse> {
    const url = `${baseUrl}/bookings/lookup`;
    console.log('[publicBookingService] searchBooking URL:', url);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      if (res.status === 404) {
        return { success: false, data: null, message: 'Không tìm thấy đơn đặt phòng phù hợp. Vui lòng kiểm tra lại mã đặt phòng và số điện thoại.' };
      }
      const errMsg = data?.message || `Lỗi tìm kiếm: HTTP ${res.status}`;
      return { success: false, data: null, message: errMsg };
    }

    if (data && data.success === false) {
      return { success: false, data: null, message: data.message || 'Không tìm thấy đơn đặt phòng phù hợp. Vui lòng kiểm tra lại mã đặt phòng và số điện thoại.' };
    }

    const booking = data?.data ?? data;
    return { success: true, data: booking };
  },

  async guestCancelBooking(payload: BookingSearchRequest): Promise<CancelBookingResponse> {
    const url = `${baseUrl}/bookings/guest-cancel`;
    console.log('[publicBookingService] guestCancelBooking URL:', url);

    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errMsg = data?.message || `Không thể huỷ đặt phòng: HTTP ${res.status}`;
      return { success: false, message: errMsg };
    }

    if (data && data.success === false) {
      return { success: false, message: data.message || 'Không thể huỷ đặt phòng.' };
    }

    return { success: true, message: data?.message ?? 'Đặt phòng đã được huỷ thành công.', data: data?.data };
  },

  /**
   * Lấy thông tin đặt phòng theo manage token
   * GET /public/bookings/manage/:token
   */
  async getBookingByToken(token: string): Promise<ManageBookingResponse> {
    const url = `${baseUrl}/public/bookings/manage/${encodeURIComponent(token)}`;
    console.log('[publicBookingService] getBookingByToken URL:', url);

    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      if (res.status === 404) {
        return { success: false, data: null, message: 'Không tìm thấy đặt phòng hoặc liên kết đã hết hạn.' };
      }
      const errMsg = data?.message || `Lỗi tải đặt phòng: HTTP ${res.status}`;
      return { success: false, data: null, message: errMsg };
    }

    const booking = data?.data ?? data?.booking ?? data;
    return { success: true, data: booking };
  },

  /**
   * Huỷ đặt phòng theo manage token
   * POST /public/bookings/cancel
   */
  async cancelBooking(payload: CancelBookingRequest): Promise<CancelBookingResponse> {
    const url = `${baseUrl}/public/bookings/cancel`;
    console.log('[publicBookingService] cancelBooking URL:', url);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: payload.token }),
      cache: 'no-store',
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errMsg = data?.message || `Không thể huỷ đặt phòng: HTTP ${res.status}`;
      return { success: false, message: errMsg };
    }

    return { success: true, message: data?.message ?? 'Đặt phòng đã được huỷ thành công.' };
  },
};
