'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  adminCustomerService,
  CustomerDetail,
  CustomerStatus,
  MembershipLevel,
  CustomerBookingItem,
} from '@/services/admin-customer.service';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(n?: number | null): string {
  if (n == null || isNaN(n)) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateTime(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Config ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<CustomerStatus, { label: string; cls: string; icon: string }> = {
  ACTIVE:   { label: 'Hoạt động',       cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: 'check_circle' },
  INACTIVE: { label: 'Không hoạt động', cls: 'bg-gray-100 text-gray-600 border-gray-200',           icon: 'pause_circle' },
  BLOCKED:  { label: 'Bị khóa',         cls: 'bg-red-100 text-red-700 border-red-200',             icon: 'block' },
};

const MEMBERSHIP_CONFIG: Record<MembershipLevel, { label: string; cls: string; badge: string; icon: string }> = {
  STANDARD: { label: 'Standard', cls: 'text-slate-600',  badge: 'bg-slate-100 text-slate-600',   icon: 'person' },
  SILVER:   { label: 'Silver',   cls: 'text-zinc-600',   badge: 'bg-zinc-200 text-zinc-700',     icon: 'workspace_premium' },
  GOLD:     { label: 'Gold',     cls: 'text-amber-600',  badge: 'bg-amber-100 text-amber-700',   icon: 'star' },
  PLATINUM: { label: 'Platinum', cls: 'text-violet-600', badge: 'bg-violet-100 text-violet-700', icon: 'diamond' },
};

const BOOKING_STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  PENDING:     { label: 'Chờ xác nhận', cls: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED:   { label: 'Đã xác nhận',  cls: 'bg-blue-100 text-blue-700' },
  CHECKED_IN:  { label: 'Đang ở',       cls: 'bg-teal-100 text-teal-700' },
  CHECKED_OUT: { label: 'Đã trả phòng', cls: 'bg-slate-100 text-slate-600' },
  CANCELLED:   { label: 'Đã hủy',       cls: 'bg-red-100 text-red-600' },
  EXPIRED:     { label: 'Hết hạn',      cls: 'bg-gray-100 text-gray-500' },
};

// ─── Inline Modals ────────────────────────────────────────────────────────────

function StatusModal({
  currentStatus,
  customerId,
  onClose,
  onSuccess,
}: {
  currentStatus: CustomerStatus;
  customerId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const newStatus: CustomerStatus = currentStatus === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
  const isBlocking = newStatus === 'BLOCKED';

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await adminCustomerService.updateStatus(customerId, newStatus);
      onSuccess();
      onClose();
    } catch (e: any) {
      alert(e.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md shadow-2xl border border-outline-variant/10 p-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isBlocking ? 'bg-red-100' : 'bg-emerald-100'}`}>
          <span className={`material-symbols-outlined text-3xl ${isBlocking ? 'text-red-600' : 'text-emerald-600'}`}>
            {isBlocking ? 'block' : 'lock_open'}
          </span>
        </div>
        <h3 className="text-lg font-bold text-on-surface text-center mb-2">
          {isBlocking ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
        </h3>
        <p className="text-on-surface-variant text-sm text-center mb-6">
          {isBlocking
            ? 'Khách hàng sẽ không thể đăng nhập hoặc đặt phòng sau khi bị khóa.'
            : 'Khách hàng sẽ có thể đăng nhập và sử dụng dịch vụ bình thường.'}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold rounded-xl text-sm transition-all"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex-1 py-2.5 font-semibold rounded-xl text-sm transition-all disabled:opacity-60 ${
              isBlocking
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {loading ? 'Đang xử lý...' : (isBlocking ? 'Khóa tài khoản' : 'Mở khóa')}
          </button>
        </div>
      </div>
    </div>
  );
}

function MembershipModal({
  currentLevel,
  customerId,
  onClose,
  onSuccess,
}: {
  currentLevel: MembershipLevel;
  customerId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selected, setSelected] = useState<MembershipLevel>(currentLevel);
  const [loading, setLoading] = useState(false);
  const levels: MembershipLevel[] = ['STANDARD', 'SILVER', 'GOLD', 'PLATINUM'];

  const handleSubmit = async () => {
    if (selected === currentLevel) { onClose(); return; }
    setLoading(true);
    try {
      await adminCustomerService.updateMembership(customerId, selected);
      onSuccess();
      onClose();
    } catch (e: any) {
      alert(e.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md shadow-2xl border border-outline-variant/10 p-6">
        <h3 className="text-lg font-bold text-on-surface mb-1">Cập nhật hạng thành viên</h3>
        <p className="text-on-surface-variant text-sm mb-5">Chọn hạng mới cho khách hàng</p>
        <div className="space-y-2 mb-6">
          {levels.map(level => {
            const cfg = MEMBERSHIP_CONFIG[level];
            return (
              <button
                key={level}
                onClick={() => setSelected(level)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                  selected === level
                    ? 'border-primary bg-primary/5'
                    : 'border-outline-variant/20 hover:border-outline-variant/50'
                }`}
              >
                <span className={`material-symbols-outlined text-xl ${cfg.cls}`}>{cfg.icon}</span>
                <span className="font-semibold text-on-surface">{cfg.label}</span>
                {level === currentLevel && (
                  <span className="ml-auto text-xs text-on-surface-variant">(Hiện tại)</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold rounded-xl text-sm transition-all">
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 bg-primary text-on-primary hover:bg-primary/90 font-semibold rounded-xl text-sm transition-all disabled:opacity-60"
          >
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PointsModal({
  currentPoints,
  customerId,
  onClose,
  onSuccess,
}: {
  currentPoints: number;
  customerId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [mode, setMode] = useState<'add' | 'subtract'>('add');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pts = parseInt(amount, 10);
    if (!pts || pts <= 0) { alert('Vui lòng nhập số điểm hợp lệ (> 0)'); return; }
    if (!reason.trim()) { alert('Vui lòng nhập lý do'); return; }

    const adjustedPoints = mode === 'add' ? pts : -pts;
    setLoading(true);
    try {
      await adminCustomerService.adjustPoints(customerId, adjustedPoints, reason);
      onSuccess();
      onClose();
    } catch (e: any) {
      alert(e.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const preview = amount
    ? mode === 'add'
      ? currentPoints + parseInt(amount || '0', 10)
      : currentPoints - parseInt(amount || '0', 10)
    : currentPoints;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md shadow-2xl border border-outline-variant/10 p-6">
        <h3 className="text-lg font-bold text-on-surface mb-1">Điều chỉnh điểm tích lũy</h3>
        <p className="text-on-surface-variant text-sm mb-5">
          Điểm hiện tại: <span className="font-bold text-on-surface">{currentPoints.toLocaleString('vi-VN')}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mode toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('add')}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-1.5 ${
                mode === 'add' ? 'bg-emerald-600 text-white' : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Cộng điểm
            </button>
            <button
              type="button"
              onClick={() => setMode('subtract')}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-1.5 ${
                mode === 'subtract' ? 'bg-red-600 text-white' : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">remove_circle</span>
              Trừ điểm
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1.5">
              Số điểm
            </label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Nhập số điểm..."
              className="w-full bg-surface-container border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1.5">
              Lý do
            </label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Ví dụ: Khuyến mãi sinh nhật, điều chỉnh thủ công..."
              className="w-full bg-surface-container border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          {amount && (
            <div className={`p-3 rounded-xl text-sm font-medium ${preview < 0 ? 'bg-red-50 text-red-700' : 'bg-surface-container text-on-surface'}`}>
              Sau điều chỉnh:{' '}
              <span className="font-bold">
                {preview >= 0 ? preview.toLocaleString('vi-VN') : 'Không đủ điểm'} điểm
              </span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold rounded-xl text-sm transition-all">
              Hủy
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-primary text-on-primary hover:bg-primary/90 font-semibold rounded-xl text-sm transition-all disabled:opacity-60">
              {loading ? 'Đang lưu...' : 'Xác nhận'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminCustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showStatusModal, setShowStatusModal]     = useState(false);
  const [showMembershipModal, setShowMembership]  = useState(false);
  const [showPointsModal, setShowPoints]          = useState(false);

  const [bookings, setBookings]       = useState<CustomerBookingItem[]>([]);
  const [bPage, setBPage]             = useState(1);
  const [bTotalPages, setBTotalPages] = useState(0);
  const [bTotal, setBTotal]           = useState(0);
  const [bLoading, setBLoading]       = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminCustomerService.getCustomerDetail(id);
      setDetail(res.data);
    } catch (e: any) {
      if (e.message === 'UNAUTHORIZED') {
        localStorage.removeItem('admin_access_token');
        router.push('/admin/login');
      } else {
        setError(e.message || 'Có lỗi xảy ra');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async (page = 1) => {
    setBLoading(true);
    try {
      const res = await adminCustomerService.getCustomerBookings(id, page, 10);
      setBookings(res.data);
      setBTotalPages(res.meta.totalPages);
      setBTotal(res.meta.total);
    } catch (e) {
      // silent
    } finally {
      setBLoading(false);
    }
  };

  useEffect(() => { fetchDetail(); fetchBookings(1); }, [id]);
  useEffect(() => { fetchBookings(bPage); }, [bPage]);

  const handleRefresh = () => { fetchDetail(); fetchBookings(bPage); };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-on-surface-variant text-sm">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-3">error</span>
        <p className="text-on-surface font-semibold mb-4">{error || 'Không tìm thấy khách hàng'}</p>
        <Link href="/admin/customers" className="px-4 py-2 bg-primary text-on-primary font-semibold rounded-xl text-sm">
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  const { customer, stats } = detail;
  const statusCfg    = STATUS_CONFIG[customer.status];
  const memberCfg    = MEMBERSHIP_CONFIG[customer.membershipLevel];

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-on-surface-variant">
        <Link href="/admin/customers" className="hover:text-primary transition-colors">Khách hàng</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-on-surface font-medium">{customer.fullName}</span>
      </div>

      {/* Header Card */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* Avatar */}
          {customer.avatar ? (
            <img src={customer.avatar} alt={customer.fullName} className="w-20 h-20 rounded-2xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold text-3xl">{customer.fullName?.charAt(0)?.toUpperCase()}</span>
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-on-surface" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
                {customer.fullName}
              </h1>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusCfg.cls}`}>
                <span className="material-symbols-outlined text-[13px]">{statusCfg.icon}</span>
                {statusCfg.label}
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${memberCfg.badge}`}>
                <span className="material-symbols-outlined text-[14px]">{memberCfg.icon}</span>
                {memberCfg.label}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-on-surface-variant mt-2">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">mail</span>
                {customer.email}
              </span>
              {customer.phone && (
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">phone</span>
                  {customer.phone}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                Tham gia {formatDate(customer.createdAt)}
              </span>
              {customer.lastLoginAt && (
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">login</span>
                  Đăng nhập lần cuối {formatDateTime(customer.lastLoginAt)}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 flex-shrink-0">
            <button
              onClick={() => setShowStatusModal(true)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                customer.status === 'BLOCKED'
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {customer.status === 'BLOCKED' ? 'lock_open' : 'block'}
              </span>
              {customer.status === 'BLOCKED' ? 'Mở khóa' : 'Khóa tài khoản'}
            </button>
            <button
              onClick={() => setShowMembership(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-violet-100 text-violet-700 hover:bg-violet-200 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
              Hạng thành viên
            </button>
            <button
              onClick={() => setShowPoints(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-amber-100 text-amber-700 hover:bg-amber-200 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">stars</span>
              Điểm tích lũy
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tổng booking',     value: stats.bookingCount.toLocaleString('vi-VN'),      icon: 'book_online',     color: 'bg-blue-100 text-blue-600' },
          { label: 'Tổng đêm lưu trú', value: `${stats.totalNights.toLocaleString('vi-VN')} đêm`, icon: 'nights_stay', color: 'bg-indigo-100 text-indigo-600' },
          { label: 'Tổng chi tiêu',    value: formatCurrency(stats.totalSpent),                icon: 'payments',        color: 'bg-emerald-100 text-emerald-600' },
          { label: 'Điểm tích lũy',    value: `${stats.loyaltyPoints.toLocaleString('vi-VN')} điểm`, icon: 'stars',   color: 'bg-amber-100 text-amber-600' },
        ].map((s, i) => (
          <div key={i} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
              <span className="material-symbols-outlined text-2xl">{s.icon}</span>
            </div>
            <div>
              <p className="text-xl font-bold text-on-surface leading-tight">{s.value}</p>
              <p className="text-xs text-on-surface-variant font-medium mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Booking History */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-on-surface">Lịch sử Booking</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">Tổng {bTotal} booking</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-container-highest/20 border-b border-outline-variant/10">
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Mã Booking</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Phòng</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Check-in</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Check-out</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Đêm</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Tổng tiền</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {bLoading ? (
                <tr><td colSpan={7}>
                  <div className="animate-pulse py-4 px-6 space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex gap-4">
                        {[...Array(7)].map((_, j) => <div key={j} className="h-4 bg-slate-200 rounded flex-1" />)}
                      </div>
                    ))}
                  </div>
                </td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="flex flex-col items-center justify-center py-14">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-2">book_online</span>
                    <p className="text-on-surface-variant text-sm">Chưa có booking nào</p>
                  </div>
                </td></tr>
              ) : (
                bookings.map((b, idx) => {
                  const bsCfg = BOOKING_STATUS_CONFIG[b.bookingStatus] ?? { label: b.bookingStatus, cls: 'bg-gray-100 text-gray-600' };
                  return (
                    <tr
                      key={b.id}
                      className={`border-b border-outline-variant/10 hover:bg-surface-container-low/40 transition-colors cursor-pointer ${idx % 2 !== 0 ? 'bg-surface-container-lowest/50' : ''}`}
                      onClick={() => router.push(`/admin/bookings/${b.id}`)}
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-semibold text-primary">#{b.bookingCode}</span>
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant">
                        {b.roomCategoryName || '—'}
                        {b.roomNumber && <span className="text-xs text-on-surface-variant/60 ml-1">({b.roomNumber})</span>}
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant">{formatDate(b.checkInDate)}</td>
                      <td className="px-4 py-3 text-on-surface-variant">{formatDate(b.checkOutDate)}</td>
                      <td className="px-4 py-3 text-right font-medium text-on-surface">{b.nightCount}</td>
                      <td className="px-4 py-3 text-right font-semibold text-on-surface">{formatCurrency(b.totalAmount)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${bsCfg.cls}`}>
                          {bsCfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bookings */}
        {!bLoading && bTotalPages > 1 && (
          <div className="px-6 py-4 border-t border-outline-variant/10 flex items-center justify-between">
            <p className="text-sm text-on-surface-variant">
              Trang <span className="font-semibold">{bPage}</span> / <span className="font-semibold">{bTotalPages}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setBPage(p => Math.max(1, p - 1))}
                disabled={bPage === 1}
                className="px-4 py-1.5 bg-surface-container hover:bg-surface-container-high rounded-lg text-xs font-semibold disabled:opacity-50 transition-all"
              >
                Trước
              </button>
              <button
                onClick={() => setBPage(p => Math.min(bTotalPages, p + 1))}
                disabled={bPage === bTotalPages}
                className="px-4 py-1.5 bg-surface-container hover:bg-surface-container-high rounded-lg text-xs font-semibold disabled:opacity-50 transition-all"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showStatusModal && (
        <StatusModal
          currentStatus={customer.status}
          customerId={customer.id}
          onClose={() => setShowStatusModal(false)}
          onSuccess={handleRefresh}
        />
      )}
      {showMembershipModal && (
        <MembershipModal
          currentLevel={customer.membershipLevel}
          customerId={customer.id}
          onClose={() => setShowMembership(false)}
          onSuccess={handleRefresh}
        />
      )}
      {showPointsModal && (
        <PointsModal
          currentPoints={customer.loyaltyPoints}
          customerId={customer.id}
          onClose={() => setShowPoints(false)}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
}
