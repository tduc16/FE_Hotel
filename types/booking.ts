export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface BookingCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface BookingRoom {
  id: string;
  name: string;
  thumbnail_url?: string | null;
  base_price: number;
}

export interface Booking {
  id: string;
  booking_code: string;
  check_in: string;   // ISO date string
  check_out: string;  // ISO date string
  nights: number;
  total_price: number;
  guest_count: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  special_requests?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  customer: BookingCustomer;
  room: BookingRoom;
}

export interface BookingQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: BookingStatus | '';
  payment_status?: PaymentStatus | '';
  check_in_from?: string;
  check_in_to?: string;
}

export interface BookingPaginatedResponse {
  data: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
