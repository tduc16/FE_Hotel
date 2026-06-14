export interface HotelService {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  imageUrl: string | null;
  icon: string | null;
  openTime: string | null;
  closeTime: string | null;
  location: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
