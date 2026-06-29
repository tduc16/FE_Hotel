const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const getAuthHeaders = (): HeadersInit => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_access_token') : null;
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

export const adminVoucherService = {
  getVouchers: async (query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    discountType?: string;
    applicableTo?: string;
  } = {}): Promise<any> => {
    const params = new URLSearchParams();
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));
    if (query.search) params.set('search', query.search);
    if (query.status) params.set('status', query.status);
    if (query.discountType) params.set('discountType', query.discountType);
    if (query.applicableTo) params.set('applicableTo', query.applicableTo);

    const res = await fetch(`${API_BASE}/admin/vouchers?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getVoucherById: async (id: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/vouchers/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  createVoucher: async (data: any): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/vouchers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  updateVoucher: async (id: string, data: any): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/vouchers/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  updateVoucherStatus: async (id: string, status: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/vouchers/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  deleteVoucher: async (id: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/vouchers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getVoucherUsages: async (id: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/vouchers/${id}/usages`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};
