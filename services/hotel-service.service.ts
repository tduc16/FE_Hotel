import { HotelService } from '@/types/services';
import { authService } from './auth.service';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const getAuthHeaders = (): HeadersInit => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const hotelServiceApi = {
  // ==========================================
  // PUBLIC APIs
  // ==========================================

  async getServices(): Promise<HotelService[]> {
    const url = `${baseUrl}/services`;
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      throw new Error(`Failed to fetch services: HTTP ${res.status}`);
    }

    const data = await res.json();
    return data?.data || [];
  },

  async getServiceBySlug(slug: string): Promise<HotelService> {
    const url = `${baseUrl}/services/${slug}`;
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      throw new Error(`Failed to fetch service detail: HTTP ${res.status}`);
    }

    const data = await res.json();
    return data?.data;
  },

  // ==========================================
  // ADMIN APIs
  // ==========================================

  async getAdminServices(params: {
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  } = {}): Promise<{ data: HotelService[]; total: number; page: number; limit: number }> {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.isActive !== undefined) query.append('isActive', String(params.isActive));
    if (params.page !== undefined) query.append('page', String(params.page));
    if (params.limit !== undefined) query.append('limit', String(params.limit));

    const url = `${baseUrl}/admin/services?${query.toString()}`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });

    if (res.status === 401) {
      throw new Error('UNAUTHORIZED');
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch admin services: HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      data: data.data || [],
      total: data.total || 0,
      page: data.page || 1,
      limit: data.limit || 10,
    };
  },

  async getAdminServiceById(id: string): Promise<HotelService> {
    const url = `${baseUrl}/admin/services/${id}`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });

    if (res.status === 401) {
      throw new Error('UNAUTHORIZED');
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch admin service: HTTP ${res.status}`);
    }

    const data = await res.json();
    return data?.data;
  },

  async createService(data: Partial<HotelService>): Promise<HotelService> {
    const url = `${baseUrl}/admin/services`;
    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (res.status === 401) {
      throw new Error('UNAUTHORIZED');
    }

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to create service');
    }

    return json.data;
  },

  async updateService(id: string, data: Partial<HotelService>): Promise<HotelService> {
    const url = `${baseUrl}/admin/services/${id}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (res.status === 401) {
      throw new Error('UNAUTHORIZED');
    }

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to update service');
    }

    return json.data;
  },

  async deleteService(id: string): Promise<HotelService> {
    const url = `${baseUrl}/admin/services/${id}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (res.status === 401) {
      throw new Error('UNAUTHORIZED');
    }

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to delete service');
    }

    return json.data;
  },
};
export default hotelServiceApi;
