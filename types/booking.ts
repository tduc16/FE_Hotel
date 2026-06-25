export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED' | 'FAILED';

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
  roomNumber?: string | null;
  room_number?: string | null;
}

export interface BookingHistory {
  id: string;
  bookingId?: string | null;
  adminId?: string | null;
  admin?: {
    id: string;
    username: string;
    email: string;
    role: string;
    createdAt?: string | null;
  } | null;
  action: string;
  previousStatus?: BookingStatus | null;
  newStatus?: BookingStatus | null;
  previous_status?: BookingStatus | null;
  new_status?: BookingStatus | null;
  note?: string | null;
  createdAt: string;
  created_at?: string;
  timestamp?: string;
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
  customer?: BookingCustomer;
  room?: BookingRoom;

  // CamelCase fallbacks based on recent backend updates
  bookingCode?: string;
  checkInDate?: string;
  checkOutDate?: string;
  check_in_date?: string;
  check_out_date?: string;
  totalPrice?: number;
  guestCount?: number;
  paymentStatus?: PaymentStatus;
  customerName?: string;
  guestName?: string;
  bookingStatus?: BookingStatus;
  booking_status?: BookingStatus;

  // Additional root fields mapping
  email?: string | null;
  phone?: string | null;
  roomPrice?: number | null;
  room_price?: number | null;
  nightCount?: number | null;
  night_count?: number | null;
  totalAmount?: number | null;
  total_amount?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  histories?: BookingHistory[];
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
