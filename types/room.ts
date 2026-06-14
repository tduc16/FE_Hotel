import { HotelService } from './services';

export interface RoomCategory {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  capacity: number;
  amenities: string[];
  thumbnail_url: string | null;
  gallery?: string[];
  available_rooms: number;
  is_available: boolean;
  is_active: boolean;
  services?: HotelService[];
}
