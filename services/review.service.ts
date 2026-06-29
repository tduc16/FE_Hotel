const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const getCleanUrl = (path: string): string => {
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanBase.endsWith('/api') && cleanPath.startsWith('/api/')) {
    return `${cleanBase.replace(/\/api$/, '')}${cleanPath}`;
  }
  return `${cleanBase}${cleanPath}`;
};

const API_BASE = baseUrl; // Giữ nguyên biến để không ảnh hưởng đến các tham chiếu cũ dưới


const getCustomerHeaders = (): HeadersInit => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('customer_access_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const getAdminHeaders = (): HeadersInit => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_access_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('UNAUTHORIZED');
    }
    let msg = 'Có lỗi xảy ra';
    try {
      const err = await res.json();
      msg = err.message || err.error || msg;
    } catch { /* ignore */ }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
};

export const reviewService = {
  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC ENDPOINTS (No Token)
  // ─────────────────────────────────────────────────────────────────────────
  getApprovedReviews: async (query: {
    page?: number;
    limit?: number;
    rating?: number;
    roomCategoryId?: string;
    sort?: string;
    featured?: boolean;
  } = {}): Promise<any> => {
    const params = new URLSearchParams();
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));
    if (query.rating) params.set('rating', String(query.rating));
    if (query.roomCategoryId) params.set('roomCategoryId', query.roomCategoryId);
    if (query.sort) params.set('sort', query.sort);
    if (query.featured !== undefined) params.set('featured', String(query.featured));

    const res = await fetch(`${API_BASE}/reviews?${params.toString()}`);
    return handleResponse(res);
  },

  getReviewsSummary: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/reviews/summary`);
    return handleResponse(res);
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CUSTOMER ENDPOINTS (customer_access_token)
  // ─────────────────────────────────────────────────────────────────────────
  getEligibleBookings: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/customer/reviews/eligible-bookings`, {
      headers: getCustomerHeaders(),
    });
    return handleResponse(res);
  },

  createReview: async (data: {
    bookingId: string;
    rating: number;
    cleanlinessRating?: number;
    serviceRating?: number;
    comfortRating?: number;
    locationRating?: number;
    valueRating?: number;
    title?: string;
    comment: string;
    images?: string[];
  }): Promise<any> => {
    const res = await fetch(`${API_BASE}/customer/reviews`, {
      method: 'POST',
      headers: getCustomerHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  getMyReviews: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/customer/reviews/my-reviews`, {
      headers: getCustomerHeaders(),
    });
    return handleResponse(res);
  },

  updateReview: async (id: string, data: {
    rating?: number;
    cleanlinessRating?: number;
    serviceRating?: number;
    comfortRating?: number;
    locationRating?: number;
    valueRating?: number;
    title?: string;
    comment?: string;
    images?: string[];
  }): Promise<any> => {
    const res = await fetch(`${API_BASE}/customer/reviews/${id}`, {
      method: 'PATCH',
      headers: getCustomerHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  deleteReview: async (id: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/customer/reviews/${id}`, {
      method: 'DELETE',
      headers: getCustomerHeaders(),
    });
    return handleResponse(res);
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ADMIN ENDPOINTS (admin_access_token)
  // ─────────────────────────────────────────────────────────────────────────
  getAdminReviewsSummary: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/reviews/summary`, {
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  getAdminReviews: async (query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    rating?: number;
    roomCategoryId?: string;
    fromDate?: string;
    toDate?: string;
  } = {}): Promise<any> => {
    const params = new URLSearchParams();
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));
    if (query.search) params.set('search', query.search);
    if (query.status) params.set('status', query.status);
    if (query.rating) params.set('rating', String(query.rating));
    if (query.roomCategoryId) params.set('roomCategoryId', query.roomCategoryId);
    if (query.fromDate) params.set('fromDate', query.fromDate);
    if (query.toDate) params.set('toDate', query.toDate);

    const res = await fetch(`${API_BASE}/admin/reviews?${params.toString()}`, {
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  getAdminReviewDetail: async (id: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/reviews/${id}`, {
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  approveReview: async (id: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/reviews/${id}/approve`, {
      method: 'PATCH',
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  rejectReview: async (id: string, reason: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/reviews/${id}/reject`, {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify({ reason }),
    });
    return handleResponse(res);
  },

  hideReview: async (id: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/reviews/${id}/hide`, {
      method: 'PATCH',
      headers: getAdminHeaders(),
    });
    return handleResponse(res);
  },

  replyReview: async (id: string, reply: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/reviews/${id}/reply`, {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify({ reply }),
    });
    return handleResponse(res);
  },

  toggleFeatured: async (id: string, isFeatured: boolean): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/reviews/${id}/featured`, {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify({ isFeatured }),
    });
    return handleResponse(res);
  },
};
