import { RoomCategory } from '@/types/room';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const roomService = {
  async getCategories(): Promise<RoomCategory[]> {
    const res = await fetch(`${baseUrl}/rooms/categories`, {
      cache: 'no-store'
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    const data = await res.json();
    return data.data || [];
  }
};
