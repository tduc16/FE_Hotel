import { RoomCategory } from '@/types/room';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const getCleanUrl = (path: string): string => {
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanBase.endsWith('/api') && cleanPath.startsWith('/api/')) {
    return `${cleanBase.replace(/\/api$/, '')}${cleanPath}`;
  }
  return `${cleanBase}${cleanPath}`;
};

export const roomService = {
  async getCategories(): Promise<RoomCategory[]> {
    const url = getCleanUrl('/rooms/categories');

    try {
      const res = await fetch(url, { cache: 'no-store' });

      if (!res.ok) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[roomService Warning] HTTP ${res.status} khi gọi ${url}`);
        }
        return [];
      }

      const data = await res.json();
      
      // Hỗ trợ cả 2 dạng response: { data: [...] } và [...] trực tiếp
      const rawCategories = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      return rawCategories;
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[roomService Warning] Lỗi kết nối khi gọi ${url}: ${err.message || err}`);
      }
      return [];
    }
  },

  async getCategoryById(id: string): Promise<RoomCategory> {
    const url = getCleanUrl(`/rooms/categories/${id}`);

    try {
      const res = await fetch(url, { cache: 'no-store' });

      if (!res.ok) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[roomService Warning] HTTP ${res.status} khi gọi ${url}`);
        }
        throw new Error(`Failed to fetch category: HTTP ${res.status}`);
      }

      const data = await res.json();
      const category = data?.data || data;
      return category as RoomCategory;
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[roomService Warning] Lỗi khi gọi ${url}: ${err.message || err}`);
      }
      throw err;
    }
  },
};

