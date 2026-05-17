import { RoomCategory } from '@/types/room';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const roomService = {
  async getCategories(): Promise<RoomCategory[]> {
    const url = `${baseUrl}/rooms/categories`;

    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      console.error(`[roomService] HTTP ${res.status} khi gọi ${url}`);
      throw new Error(`Failed to fetch categories: HTTP ${res.status}`);
    }

    const data = await res.json();
    console.log(`[roomService] RAW API RESPONSE FULL:`, JSON.stringify(data, null, 2));

    // Hỗ trợ cả 2 dạng response: { data: [...] } và [...] trực tiếp
    const rawCategories = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : [];

    console.log(`[roomService] Số lượng rooms nhận từ API: ${rawCategories.length}`);
    
    // Đảm bảo không filter bất kỳ room nào dù không có ảnh
    const categories: RoomCategory[] = rawCategories;
    console.log(`[roomService] Số lượng rooms sau filter (chúng ta giữ nguyên): ${categories.length}`);

    categories.forEach((c, i) =>
      console.log(`  [${i}] Room ID: ${c.id} | Name: ${c.name} | Thumbnail: ${c.thumbnail_url}`)
    );

    return categories;
  },

  async getCategoryById(id: string): Promise<RoomCategory> {
    const url = `${baseUrl}/rooms/categories/${id}`;

    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      console.error(`[roomService] HTTP ${res.status} khi gọi ${url}`);
      throw new Error(`Failed to fetch category: HTTP ${res.status}`);
    }

    const data = await res.json();
    console.log(`[roomService] RAW API RESPONSE GET BY ID:`, JSON.stringify(data, null, 2));

    const category = data?.data || data;
    return category as RoomCategory;
  },
};
