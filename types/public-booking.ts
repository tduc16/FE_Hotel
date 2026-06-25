import { BookingStatus, PaymentStatus } from './booking';

// ============================================================
// Public Booking Types (Guest-facing - no auth required)
// ============================================================

export interface PublicBookingRoom {
  id: string;
  name: string;          // room category name
  roomNumber?: string | null;
  room_number?: string | null;
}

export interface PublicBookingCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
}

export interface PublicBooking {
  id: string;
  booking_code: string;
  check_in: string;
  check_out: string;
  nights: number;
  total_price: number;
  guest_count: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  special_requests?: string | null;
  created_at: string;
  updated_at: string;
  customer?: PublicBookingCustomer | null;
  room?: PublicBookingRoom | null;

  // Flattened fields the backend may return
  customer_name?: string | null;
  phone?: string | null;
  email?: string | null;
  room_category?: string | null;
  room_number?: string | null;
  total_amount?: number | null;
  check_in_date?: string | null;
  check_out_date?: string | null;

  // Token for managing booking
  manage_token?: string | null;
}

// ============================================================
// API Request / Response shapes
// ============================================================

export interface BookingSearchRequest {
  bookingCode: string;
  phone: string;
}

export interface BookingSearchResponse {
  success: boolean;
  data?: PublicBooking | null;
  token?: string | null;
  message?: string;
}

export interface ManageBookingResponse {
  success: boolean;
  data?: PublicBooking | null;
  message?: string;
}

export interface CancelBookingRequest {
  token: string;
}

export interface CancelBookingResponse {
  success: boolean;
  message?: string;
  data?: any;
}

// ============================================================
// Validation
// ============================================================

export interface BookingLookupFormErrors {
  bookingCode?: string;
  phone?: string;
  general?: string;
}
