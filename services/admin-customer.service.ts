const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('admin_access_token') ?? '';
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    cache: 'no-store',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });

  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Types ──────────────────────────────────────────────────────────────────

export type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
export type MembershipLevel = 'STANDARD' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface AdminCustomer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string | null;
  membershipLevel: MembershipLevel;
  loyaltyPoints: number;
  status: CustomerStatus;
  createdAt: string;
  bookingCount: number;
  totalSpent: number;
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  blockedCustomers: number;
  vipCustomers: number;
}

export interface CustomerDetail {
  customer: AdminCustomer & {
    lastLoginAt: string | null;
    updatedAt: string;
  };
  stats: {
    bookingCount: number;
    totalSpent: number;
    totalNights: number;
    loyaltyPoints: number;
  };
  recentBookings: CustomerBookingItem[];
}

export interface CustomerBookingItem {
  id: string;
  bookingCode: string;
  checkInDate: string;
  checkOutDate: string;
  nightCount: number;
  guestCount: number;
  totalAmount: number;
  bookingStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  roomCategoryName: string | null;
  roomNumber: string | null;
  createdAt: string;
}

export interface CustomerListResponse {
  success: boolean;
  data: AdminCustomer[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: CustomerStats;
}

export interface CustomerQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: CustomerStatus | '';
  membershipLevel?: MembershipLevel | '';
}

// ─── API Service ─────────────────────────────────────────────────────────────

export const adminCustomerService = {
  async getCustomers(query: CustomerQuery = {}): Promise<CustomerListResponse> {
    const params = new URLSearchParams();
    if (query.page)            params.set('page', String(query.page));
    if (query.limit)           params.set('limit', String(query.limit));
    if (query.search)          params.set('search', query.search);
    if (query.status)          params.set('status', query.status);
    if (query.membershipLevel) params.set('membershipLevel', query.membershipLevel);
    return request<CustomerListResponse>(`/admin/customers?${params}`);
  },

  async getCustomerDetail(id: string): Promise<{ success: boolean; data: CustomerDetail }> {
    return request(`/admin/customers/${id}`);
  },

  async getCustomerBookings(
    id: string,
    page = 1,
    limit = 10,
  ): Promise<{ success: boolean; data: CustomerBookingItem[]; meta: any }> {
    return request(`/admin/customers/${id}/bookings?page=${page}&limit=${limit}`);
  },

  async updateStatus(id: string, status: CustomerStatus): Promise<any> {
    return request(`/admin/customers/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async updateMembership(id: string, membershipLevel: MembershipLevel): Promise<any> {
    return request(`/admin/customers/${id}/membership`, {
      method: 'PATCH',
      body: JSON.stringify({ membershipLevel }),
    });
  },

  async adjustPoints(id: string, points: number, reason: string): Promise<any> {
    return request(`/admin/customers/${id}/points`, {
      method: 'PATCH',
      body: JSON.stringify({ points, reason }),
    });
  },
};
