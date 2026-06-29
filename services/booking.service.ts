import {
  Booking,
  BookingPaginatedResponse,
  BookingQuery,
  BookingStatus,
} from '@/types/booking';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const bookingService = {
  async getBookings(query: BookingQuery = {}): Promise<BookingPaginatedResponse> {
    const params = new URLSearchParams();
    if (query.page)           params.set('page', String(query.page));
    if (query.limit)          params.set('limit', String(query.limit));
    if (query.search)         params.set('search', query.search);
    if (query.status)         params.set('status', query.status);
    if (query.payment_status) params.set('payment_status', query.payment_status);
    if (query.check_in_from)  params.set('check_in_from', query.check_in_from);
    if (query.check_in_to)    params.set('check_in_to', query.check_in_to);

    const url = `${baseUrl}/admin/bookings?${params.toString()}`;
    const token = getToken();
    const headers = { Authorization: `Bearer ${token}` };

    const res = await fetch(url, {
      cache: 'no-store',
      headers,
    });

    if (res.status === 401) {
      console.error('[bookingService] HTTP 401 Unauthorized - Token may be expired or invalid');
      throw new Error('UNAUTHORIZED');
    }

    if (!res.ok) {
      console.error(`[bookingService] HTTP ${res.status}`);
      throw new Error(`Failed to fetch bookings: HTTP ${res.status}`);
    }

    const data = await res.json();

    // Support both { success, data, meta } từ admin API và plain array
    if (Array.isArray(data)) {
      return { data, total: data.length, page: 1, limit: data.length, totalPages: 1 };
    }
    if (Array.isArray(data?.data)) {
      const meta = data.meta ?? {};
      return {
        data: data.data,
        total: meta.total ?? data.total ?? data.data.length,
        page: meta.page ?? data.page ?? 1,
        limit: meta.limit ?? data.limit ?? data.data.length,
        totalPages: meta.totalPages ?? data.totalPages ?? 1,
      };
    }
    return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
  },

  async getBookingById(id: string): Promise<Booking> {
    const url = `${baseUrl}/admin/bookings/${id}`;
    const token = getToken();
    const headers = { Authorization: `Bearer ${token}` };

    const res = await fetch(url, {
      cache: 'no-store',
      headers,
    });

    if (res.status === 401) {
      console.error('[bookingService] HTTP 401 Unauthorized - Token may be expired or invalid');
      throw new Error('UNAUTHORIZED');
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch booking: HTTP ${res.status}`);
    }

    const data = await res.json();
    return (data?.data ?? data) as Booking;
  },

  /** Lấy bookings trong khoảng ngày cho calendar view (không phân trang) */
  async getCalendarBookings(dateFrom: string, dateTo: string): Promise<Booking[]> {
    const params = new URLSearchParams({
      check_in_from: dateFrom,
      check_in_to: dateTo,
      limit: '500',
      page: '1',
    });
    const url = `${baseUrl}/admin/bookings?${params.toString()}`;
    const token = getToken();
    const headers = { Authorization: `Bearer ${token}` };

    console.log('[bookingService] getCalendarBookings GET Full Request URL:', url);
    console.log('[bookingService] Current Token:', token ? `${token.substring(0, 20)}...` : 'NULL/UNDEFINED');
    console.log('[bookingService] Request Headers:', headers);

    const res = await fetch(url, {
      cache: 'no-store',
      headers,
    });

    if (res.status === 401) {
      console.error('[bookingService] HTTP 401 Unauthorized - Token may be expired or invalid');
      throw new Error('UNAUTHORIZED');
    }

    if (!res.ok) {
      console.error(`[bookingService] HTTP ${res.status}`);
      throw new Error(`Failed to fetch calendar bookings: HTTP ${res.status}`);
    }

    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  },

  async updateBookingStatus(id: string, status: BookingStatus): Promise<Booking> {
    const url = `${baseUrl}/admin/bookings/${id}`;
    
    // 5. Log toàn bộ request URL và request body để xác định backend nhận gì
    console.log('Request URL:', url);
    console.log('Request Body:', JSON.stringify({ status }));

    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(url, {
      method: 'PATCH',
      cache: 'no-store',
      headers,
      body: JSON.stringify({ status }),
    });

    // 2. Khi gọi API log:
    console.log(response.status);
    console.log(await response.clone().json());

    if (response.status === 401) {
      console.error('[bookingService] HTTP 401 Unauthorized - Token may be expired or invalid');
      throw new Error('UNAUTHORIZED');
    }

    if (!response.ok) {
      let err: any = {};
      try {
        err = await response.json();
      } catch (e) {
        // ignore
      }
      let errMsg = err?.message || `Cập nhật trạng thái thất bại: HTTP ${response.status}`;
      // 4. Không hiển thị "Internal server error" chung chung
      if (errMsg.toLowerCase() === 'internal server error') {
        errMsg = `Lỗi hệ thống từ máy chủ (HTTP ${response.status}). Vui lòng kiểm tra lại cấu hình hoặc dữ liệu.`;
      }
      throw new Error(errMsg);
    }

    const data = await response.json();
    return (data?.data ?? data) as Booking;
  },

  async createBooking(data: any): Promise<any> {
    const url = `${baseUrl.replace(/\/admin$/, '')}/bookings`;
    console.log('[bookingService] POST Full Request URL:', url);
    console.log('[bookingService] Request Body payload:', JSON.stringify(data, null, 2));

    const customerToken = typeof window !== 'undefined' ? localStorage.getItem('customer_access_token') : null;
    const headers = {
      'Content-Type': 'application/json',
      ...(customerToken ? { Authorization: `Bearer ${customerToken}` } : {}),
    };

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    console.log('[bookingService] Response status:', res.status);

    let resData;
    try {
      resData = await res.json();
      console.log('[bookingService] Response body:', resData);
    } catch (e) {
      console.error('[bookingService] Failed to parse JSON response (silent error):', e);
      throw new Error(`Lỗi máy chủ: Không thể đọc phản hồi (HTTP ${res.status})`);
    }

    if (res.ok !== true) {
      if (res.status >= 500) {
        throw new Error(`Lỗi máy chủ: HTTP ${res.status}`);
      }

      let errorMessage = resData?.message || `Lỗi đặt phòng: HTTP ${res.status}`;
      if (resData?.errors && Array.isArray(resData.errors)) {
         errorMessage = resData.errors.join(', ');
      } else if (resData?.details?.conflictingBookings) {
         errorMessage = "Phòng đã được đặt trong khoảng thời gian này.";
      }

      return {
        error: true,
        message: errorMessage,
        details: resData
      };
    }

    return resData;
  },

  async validateVoucher(code: string, totalAmount: number, customerId?: string, guestEmail?: string): Promise<any> {
    const url = `${baseUrl.replace(/\/admin$/, '')}/vouchers/validate`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, totalAmount, customerId, guestEmail }),
    });
    if (!res.ok) {
      let msg = 'Không thể kiểm tra mã giảm giá';
      try {
        const err = await res.json();
        msg = err.message || msg;
      } catch { /* ignore */ }
      return { valid: false, message: msg };
    }
    return res.json();
  },

  /**
   * Kiểm tra phòng trống (public API — không cần auth)
   * Sử dụng ở trang booking trước khi submit.
   */
  async checkAvailability(params: {
    categoryId: string;
    checkIn: string;
    checkOut: string;
    guestCount?: number;
  }): Promise<{
    success: boolean;
    data?: {
      available: boolean;
      availableRoomCount: number;
      categoryName: string;
      pricePerNight: number;
      capacity: number;
      nightCount: number;
      subtotal: number;
    };
    message?: string;
  }> {
    const queryParams = new URLSearchParams();
    queryParams.set('categoryId', params.categoryId);
    queryParams.set('checkIn', params.checkIn);
    queryParams.set('checkOut', params.checkOut);
    if (params.guestCount !== undefined) {
      queryParams.set('guestCount', String(params.guestCount));
    }

    const url = `${baseUrl}/public/bookings/availability?${queryParams.toString()}`;
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      let msg = 'Lỗi kiểm tra phòng trống';
      try {
        const err = await res.json();
        msg = err.message || msg;
      } catch { /* ignore */ }
      return { success: false, message: msg };
    }

    const data = await res.json();
    return { success: true, data: data.data || data };
  },

  /**
   * Cập nhật trạng thái thanh toán của booking (admin only)
   */
  async updatePaymentStatus(
    id: string,
    paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED' | 'FAILED',
    note?: string,
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    const url = `${baseUrl}/admin/bookings/${id}/payment`;
    const token = getToken();
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ paymentStatus, note }),
    });

    if (!res.ok) {
      let msg = 'Không thể cập nhật trạng thái thanh toán';
      try {
        const err = await res.json();
        msg = err.message || msg;
      } catch { /* ignore */ }
      return { success: false, message: msg };
    }
    const data = await res.json();
    return { success: true, data: data.data, message: data.message };
  },
};

// Helper – reads JWT từ localStorage (client-side only)
function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('admin_access_token') ?? '';
}
