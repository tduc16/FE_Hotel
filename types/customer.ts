// ===== Customer Auth =====

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  membership_level: MembershipLevel;
  loyalty_points: number;
  created_at: string;
  updated_at?: string;
}

export interface CustomerLoginPayload {
  email: string;
  password: string;
}

export interface CustomerRegisterPayload {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}

export interface CustomerAuthResponse {
  access_token: string;
  customer: Customer;
}

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  email?: string;
  avatar_url?: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export interface ResetPasswordPayload {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// ===== Membership =====

export type MembershipLevel = 'STANDARD' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface MembershipBenefit {
  label: string;
  icon: string;
}

export interface MembershipInfo {
  level: MembershipLevel;
  label: string;
  color: string;
  bgColor: string;
  minPoints: number;
  maxPoints: number | null;
  benefits: MembershipBenefit[];
}

export const MEMBERSHIP_CONFIG: Record<MembershipLevel, MembershipInfo> = {
  STANDARD: {
    level: 'STANDARD',
    label: 'Standard',
    color: '#64748b',
    bgColor: '#f1f5f9',
    minPoints: 0,
    maxPoints: 999,
    benefits: [
      { label: 'Tích điểm 1đ/100.000đ', icon: 'star' },
      { label: 'Ưu tiên hỗ trợ', icon: 'headphones' },
    ],
  },
  SILVER: {
    level: 'SILVER',
    label: 'Silver',
    color: '#475569',
    bgColor: '#e2e8f0',
    minPoints: 1000,
    maxPoints: 4999,
    benefits: [
      { label: 'Tích điểm 1.5đ/100.000đ', icon: 'star' },
      { label: 'Late check-out (12h → 14h)', icon: 'clock' },
      { label: 'Giảm 5% dịch vụ spa', icon: 'sparkles' },
    ],
  },
  GOLD: {
    level: 'GOLD',
    label: 'Gold',
    color: '#b45309',
    bgColor: '#fef3c7',
    minPoints: 5000,
    maxPoints: 14999,
    benefits: [
      { label: 'Tích điểm 2đ/100.000đ', icon: 'star' },
      { label: 'Early check-in (14h → 12h)', icon: 'clock' },
      { label: 'Giảm 10% dịch vụ', icon: 'percent' },
      { label: 'Nâng hạng phòng (tùy availability)', icon: 'arrow-up' },
    ],
  },
  PLATINUM: {
    level: 'PLATINUM',
    label: 'Platinum',
    color: '#6d28d9',
    bgColor: '#ede9fe',
    minPoints: 15000,
    maxPoints: null,
    benefits: [
      { label: 'Tích điểm 3đ/100.000đ', icon: 'star' },
      { label: 'Check-in/out linh hoạt', icon: 'clock' },
      { label: 'Giảm 15% tất cả dịch vụ', icon: 'percent' },
      { label: 'Phòng suite ưu tiên', icon: 'crown' },
      { label: 'Concierge riêng 24/7', icon: 'bell' },
    ],
  },
};

// ===== Dashboard =====

export interface CustomerDashboard {
  total_bookings: number;
  completed_bookings: number;
  pending_bookings: number;
  cancelled_bookings: number;
  total_spent: number;
  loyalty_points: number;
  membership_level: MembershipLevel;
}

// ===== Voucher =====

export type VoucherStatus = 'active' | 'used' | 'expired';

export interface CustomerVoucher {
  id: string;
  code: string;
  discount_percent: number;
  expiry_date: string;
  status: VoucherStatus;
  min_order_amount?: number | null;
  description?: string | null;
}

// ===== Helpers =====

export function getNextMembership(current: MembershipLevel): MembershipLevel | null {
  const order: MembershipLevel[] = ['STANDARD', 'SILVER', 'GOLD', 'PLATINUM'];
  const idx = order.indexOf(current);
  return idx < order.length - 1 ? order[idx + 1] : null;
}

export function getMembershipProgress(points: number, current: MembershipLevel): number {
  const config = MEMBERSHIP_CONFIG[current];
  if (!config.maxPoints) return 100;
  const range = config.maxPoints - config.minPoints;
  const progress = points - config.minPoints;
  return Math.min(Math.round((progress / range) * 100), 100);
}
