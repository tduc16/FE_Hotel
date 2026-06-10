'use client';

import { useEffect, useState } from 'react';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { customerService } from '@/services/customer.service';
import type { CustomerDashboard } from '@/types/customer';
import type { Booking } from '@/types/booking';
import MembershipProgress from '@/components/account/MembershipProgress';
import BookingTable from '@/components/account/BookingTable';
import toast from 'react-hot-toast';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
  Award,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

export default function AccountOverviewPage() {
  const { customer, refreshProfile } = useCustomerAuth();
  const [dashboard, setDashboard] = useState<CustomerDashboard | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoadingId, setCancelLoadingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [dashData, bookingsData] = await Promise.all([
        customerService.getDashboard(),
        customerService.getBookings({ limit: 5 }),
      ]);
      setDashboard(dashData);
      setRecentBookings(bookingsData.data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể tải dữ liệu tổng quan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Bạn có chắc chắn muốn hủy đặt phòng này?')) return;
    setCancelLoadingId(bookingId);
    try {
      await customerService.cancelBooking(bookingId);
      toast.success('Hủy đặt phòng thành công');
      fetchData(); // Reload data
      refreshProfile(); // Reload points
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể hủy đặt phòng');
    } finally {
      setCancelLoadingId(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Đang tải thông tin tổng quan...</p>
      </div>
    );
  }

  // Stats Card Config
  const stats = [
    {
      label: 'Tổng đặt phòng',
      value: dashboard?.total_bookings ?? 0,
      icon: CalendarDays,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Đã hoàn thành',
      value: dashboard?.completed_bookings ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'Đang xử lý',
      value: dashboard?.pending_bookings ?? 0,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Đã hủy',
      value: dashboard?.cancelled_bookings ?? 0,
      icon: XCircle,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
    },
    {
      label: 'Tổng chi tiêu',
      value: formatPrice(dashboard?.total_spent ?? 0),
      icon: CreditCard,
      color: 'text-slate-700',
      bgColor: 'bg-slate-50',
      colSpan: 'sm:col-span-2 md:col-span-1',
    },
    {
      label: 'Điểm tích lũy',
      value: `${dashboard?.loyalty_points ?? 0} đ`,
      icon: Award,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Xin chào, {customer?.fullName}!
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Theo dõi trạng thái các phòng đã đặt, tích lũy điểm và khám phá ưu đãi riêng của bạn.
        </p>
      </div>

      {/* Membership Level Card */}
      <MembershipProgress
        points={customer?.loyalty_points ?? 0}
        currentLevel={customer?.membership_level ?? 'STANDARD'}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`bg-white rounded-2xl border border-slate-100 p-5 flex items-center justify-between shadow-sm ${
                item.colSpan || ''
              }`}
            >
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  {item.label}
                </span>
                <p className="text-xl sm:text-2xl font-bold text-slate-800">{item.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bgColor} ${item.color}`}>
                <Icon size={22} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Bookings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Đặt phòng gần đây</h2>
          <Link
            href="/account/bookings"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            Tất cả đặt phòng
            <ArrowRight size={14} />
          </Link>
        </div>
        <BookingTable
          bookings={recentBookings}
          onCancel={handleCancelBooking}
          loadingId={cancelLoadingId}
        />
      </div>
    </div>
  );
}
