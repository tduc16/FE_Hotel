const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const getAuthHeaders = (): HeadersInit => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_access_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const dashboardService = {
  getDashboardData: async (filter: string = '30days'): Promise<any> => {
    const headers = getAuthHeaders();
    console.log('Dashboard Token', typeof window !== 'undefined' ? localStorage.getItem('admin_access_token') : null);
    console.log('Dashboard Request Headers', headers);

    const res = await fetch(`${API_BASE}/admin/dashboard?filter=${filter}`, {
      headers,
      cache: 'no-store',
    });

    if (res.status === 401) {
      throw new Error('UNAUTHORIZED');
    }

    if (!res.ok) {
      let message = 'Không thể tải dữ liệu dashboard';
      try {
        const errorData = await res.json();
        message = errorData.message || message;
      } catch {
        // ignore
      }
      throw new Error(message);
    }

    const json = await res.json();
    return json.data;
  },
};
