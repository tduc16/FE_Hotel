import type { CustomerDashboard, CustomerVoucher } from '@/types/customer';
import type { Booking, BookingPaginatedResponse, BookingQuery } from '@/types/booking';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const getAuthHeaders = (): HeadersInit => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('customer_access_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    let msg = 'Có lỗi xảy ra';
    try {
      const err = await res.json();
      msg = err.message || err.error || msg;
    } catch { /* ignore */ }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
};

export const customerService = {
  getDashboard: async (): Promise<CustomerDashboard> => {
    const res = await fetch(`${API_BASE}/customer/dashboard`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getBookings: async (query: BookingQuery = {}): Promise<BookingPaginatedResponse> => {
    const params = new URLSearchParams();
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));
    if (query.status) params.set('status', query.status);
    if (query.search) params.set('search', query.search);

    const res = await fetch(`${API_BASE}/customer/bookings?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getBookingById: async (id: string): Promise<Booking> => {
    const res = await fetch(`${API_BASE}/customer/bookings/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  cancelBooking: async (id: string): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE}/customer/bookings/${id}/cancel`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getVouchers: async (): Promise<CustomerVoucher[]> => {
    const res = await fetch(`${API_BASE}/customer/vouchers`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};
