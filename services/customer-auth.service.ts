import type {
  CustomerAuthResponse,
  CustomerLoginPayload,
  CustomerRegisterPayload,
  UpdateProfilePayload,
  ChangePasswordPayload,
  Customer,
} from '@/types/customer';

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

export const customerAuthService = {
  register: async (payload: CustomerRegisterPayload): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE}/customer-auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  login: async (payload: CustomerLoginPayload): Promise<CustomerAuthResponse> => {
    const res = await fetch(`${API_BASE}/customer-auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    // Backend trả về trực tiếp: { access_token, customer }
    const data = await handleResponse<CustomerAuthResponse>(res);
    console.log("LOGIN RESPONSE:", data);
    console.log('Customer:', data?.customer);
    if (typeof window !== 'undefined') {
      const token = data?.access_token;
      const customerData = data?.customer;
      if (token) {
        localStorage.setItem('customer_access_token', token);
      }
      // Chỉ lưu nếu customerData hợp lệ — tránh lưu "undefined" vào localStorage
      if (customerData) {
        localStorage.setItem('customer_info', JSON.stringify(customerData));
      }
    }
    return data;
  },

  getMe: async (): Promise<Customer> => {
    const res = await fetch(`${API_BASE}/customer-auth/me`, {
      headers: getAuthHeaders(),
    });
    const result = await handleResponse<{ success: boolean; data: Customer }>(res);
    return result.data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<Customer> => {
    const res = await fetch(`${API_BASE}/customer-auth/profile`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const result = await handleResponse<{ success: boolean; data: Customer }>(res);
    if (typeof window !== 'undefined' && result.data) {
      localStorage.setItem('customer_info', JSON.stringify(result.data));
    }
    return result.data;
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE}/customer-auth/change-password`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('customer_access_token');
      localStorage.removeItem('customer_info');
    }
  },

  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('customer_access_token');
    }
    return null;
  },

  getStoredCustomer: (): Customer | null => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('customer_info');
    // Loại bỏ các giá trị rác được ghi trước đây
    if (!raw || raw === 'undefined' || raw === 'null') {
      if (raw) localStorage.removeItem('customer_info');
      return null;
    }
    try {
      return JSON.parse(raw);
    } catch (error) {
      console.error('Invalid customer_info in localStorage:', raw, error);
      localStorage.removeItem('customer_info');
      return null;
    }
  },
};
