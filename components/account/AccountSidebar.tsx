'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  User,
  Star,
  Ticket,
  Settings,
  LogOut,
  Hotel,
  ChevronRight,
  X,
} from 'lucide-react';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { label: 'Tổng quan', href: '/account', icon: LayoutDashboard },
  { label: 'Đặt phòng của tôi', href: '/account/bookings', icon: CalendarDays },
  { label: 'Hồ sơ', href: '/account/profile', icon: User },
  { label: 'Điểm thưởng', href: '/account/rewards', icon: Star },
  { label: 'Voucher', href: '/account/vouchers', icon: Ticket },
  { label: 'Cài đặt', href: '/account/settings', icon: Settings },
];

const MEMBERSHIP_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  STANDARD: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Standard' },
  SILVER: { bg: 'bg-slate-200', text: 'text-slate-700', label: 'Silver' },
  GOLD: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Gold' },
  PLATINUM: { bg: 'bg-violet-100', text: 'text-violet-700', label: 'Platinum' },
};

interface AccountSidebarProps {
  onClose?: () => void;
}

export default function AccountSidebar({ onClose }: AccountSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { customer, logout } = useCustomerAuth();

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất');
    router.push('/');
  };

  const membership = MEMBERSHIP_COLORS[customer?.membership_level ?? 'STANDARD'];
  const initials = customer?.fullName
    ?.split(' ')
    .slice(-2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() ?? 'U';

  return (
    <aside className="flex flex-col h-full bg-white border-r border-slate-100 w-72">
      {/* Logo + close (mobile) */}
      <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Hotel size={16} className="text-white" />
          </div>
          <span className="font-bold text-primary text-base">Hotel Hoang Minh</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        )}
      </div>

      {/* User card */}
      <div className="px-4 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl">
          {customer?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={customer.avatar_url}
              alt={customer?.fullName ?? ''}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white font-bold text-base flex-shrink-0">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-on-surface text-sm truncate">{customer?.fullName ?? 'Khách hàng'}</p>
            <p className="text-xs text-on-surface-variant truncate">{customer?.email ?? ''}</p>
            <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${membership.bg} ${membership.text}`}>
              {membership.label}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = href === '/account' ? pathname === '/account' : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-primary text-white shadow-sm shadow-primary/20'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary'} />
                  {label}
                  {!isActive && (
                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-40 transition-opacity" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6 pt-2 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
