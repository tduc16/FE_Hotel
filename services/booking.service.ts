import {
  Booking,
  BookingPaginatedResponse,
  BookingQuery,
  BookingStatus,
} from '@/types/booking';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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

    console.log('[bookingService] Full Request URL:', url);
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
      throw new Error(`Failed to fetch bookings: HTTP ${res.status}`);
    }

    const data = await res.json();
    console.log('[bookingService] getBookings response:', data);

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

    console.log('[bookingService] GET Full Request URL:', url);
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
    const url = `${baseUrl}/admin/bookings/${id}/status`;
    console.log('[bookingService] PATCH', url, { status });

    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    console.log('[bookingService] PATCH Full Request URL:', url);
    console.log('[bookingService] Current Token:', token ? `${token.substring(0, 20)}...` : 'NULL/UNDEFINED');
    console.log('[bookingService] Request Headers:', headers);

    const res = await fetch(url, {
      method: 'PATCH',
      cache: 'no-store',
      headers,
      body: JSON.stringify({ status }),
    });

    if (res.status === 401) {
      console.error('[bookingService] HTTP 401 Unauthorized - Token may be expired or invalid');
      throw new Error('UNAUTHORIZED');
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message ?? `Failed to update status: HTTP ${res.status}`);
    }

    const data = await res.json();
    return (data?.data ?? data) as Booking;
  },
};

// Helper – reads JWT từ localStorage (client-side only)
// Key phải khớp với auth.service.ts: 'access_token'
function getToken(): string {
  if (typeof window === 'undefined') return '';
  const token = localStorage.getItem('access_token') ?? '';
  if (!token) {
    console.warn('[bookingService] ⚠️ Không tìm thấy access_token trong localStorage');
  }
  return token;
}
