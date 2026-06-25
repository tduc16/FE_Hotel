'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  adminCustomerService,
  AdminCustomer,
  CustomerQuery,
  CustomerStats,
  CustomerStatus,
  MembershipLevel,
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

// ─── Config ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<CustomerStatus, { label: string; cls: string }> = {
  ACTIVE:   { label: 'Hoạt động', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  INACTIVE: { label: 'Không hoạt động', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
  BLOCKED:  { label: 'Bị khóa', cls: 'bg-red-100 text-red-700 border-red-200' },
};

const MEMBERSHIP_CONFIG: Record<MembershipLevel, { label: string; cls: string; icon: string }> = {
  STANDARD: { label: 'Standard', cls: 'bg-slate-100 text-slate-600',  icon: 'person' },
  SILVER:   { label: 'Silver',   cls: 'bg-zinc-200 text-zinc-700',    icon: 'workspace_premium' },
  GOLD:     { label: 'Gold',     cls: 'bg-amber-100 text-amber-700',  icon: 'star' },
  PLATINUM: { label: 'Platinum', cls: 'bg-violet-100 text-violet-700',icon: 'diamond' },
};

// ─── Badges ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: CustomerStatus }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600 border-gray-200' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function MembershipBadge({ level }: { level: MembershipLevel }) {
  const cfg = MEMBERSHIP_CONFIG[level] ?? { label: level, cls: 'bg-gray-100 text-gray-600', icon: 'person' };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${cfg.cls}`}>
      <span className="material-symbols-outlined text-[14px]">{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-bold text-on-surface">{value.toLocaleString('vi-VN')}</p>
        <p className="text-xs text-on-surface-variant font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="animate-pulse">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex gap-3 px-6 py-4 border-b border-slate-100">
          {[...Array(9)].map((_, j) => (
            <div key={j} className="h-4 bg-slate-200 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Action Menu ─────────────────────────────────────────────────────────────

function ActionMenu({
  customer,
  onSuccess,
}: {
  customer: AdminCustomer;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBlock = async () => {
    if (!confirm(`Bạn có chắc muốn ${customer.status === 'BLOCKED' ? 'mở khóa' : 'khóa'} tài khoản "${customer.fullName}"?`)) return;
    setLoading(true);
    try {
      await adminCustomerService.updateStatus(
        customer.id,
        customer.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED',
      );
      onSuccess();
    } catch (e: any) {
      alert(e.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <span className="material-symbols-outlined text-[20px] text-slate-500">more_vert</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-lg border border-slate-200 py-1 min-w-[160px]">
            <button
              onClick={(e) => { e.stopPropagation(); handleBlock(); }}
              disabled={loading}
              className={`w-full text-left px-4 py-2 text-sm font-medium flex items-center gap-2 hover:bg-slate-50 transition-colors ${
                customer.status === 'BLOCKED' ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {customer.status === 'BLOCKED' ? 'lock_open' : 'block'}
              </span>
              {customer.status === 'BLOCKED' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AdminCustomersPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [stats, setStats] = useState<CustomerStats>({
    totalCustomers: 0,
    activeCustomers: 0,
    blockedCustomers: 0,
    vipCustomers: 0,
  });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch]               = useState('');
  const [statusFilter, setStatusFilter]   = useState<CustomerStatus | ''>('');
  const [membershipFilter, setMembership] = useState<MembershipLevel | ''>('');
  const limit = 10;

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query: CustomerQuery = {
        page,
        limit,
        search: search || undefined,
        status: statusFilter || undefined,
        membershipLevel: membershipFilter || undefined,
      };
      const res = await adminCustomerService.getCustomers(query);
      setCustomers(res.data);
      setStats(res.stats);
      setTotal(res.meta.total);
      setTotalPages(res.meta.totalPages);
    } catch (e: any) {
      if (e.message === 'UNAUTHORIZED') {
        localStorage.removeItem('admin_access_token');
        router.push('/admin/login');
      } else {
        setError(e.message || 'Có lỗi xảy ra khi tải dữ liệu');
      }
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, membershipFilter, router]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchCustomers(); };
  const resetFilters = () => { setSearch(''); setStatusFilter(''); setMembership(''); setPage(1); };
  const hasFilters = search || statusFilter || membershipFilter;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-on-surface" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
            Quản lý Khách hàng
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Tổng cộng <span className="font-semibold text-on-surface">{total.toLocaleString('vi-VN')}</span> khách hàng
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tổng khách hàng"   value={stats.totalCustomers}   icon="group"         color="bg-blue-100 text-blue-600" />
        <StatCard label="Đang hoạt động"     value={stats.activeCustomers}  icon="check_circle"  color="bg-emerald-100 text-emerald-600" />
        <StatCard label="Bị khóa"            value={stats.blockedCustomers} icon="block"         color="bg-red-100 text-red-600" />
        <StatCard label="Khách VIP (Gold+)"  value={stats.vipCustomers}     icon="diamond"       color="bg-violet-100 text-violet-600" />
      </div>

      {/* Filters */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
          {/* Search */}
          <div className="flex-1 min-w-[220px]">
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">
              Tìm kiếm
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant/50">search</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tên, email, SĐT..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-surface-container border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Status */}
          <div className="min-w-[160px]">
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value as CustomerStatus | ''); setPage(1); }}
              className="w-full px-3 py-2 text-sm bg-surface-container border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Tất cả</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          {/* Membership */}
          <div className="min-w-[160px]">
            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">
              Hạng thành viên
            </label>
            <select
              value={membershipFilter}
              onChange={e => { setMembership(e.target.value as MembershipLevel | ''); setPage(1); }}
              className="w-full px-3 py-2 text-sm bg-surface-container border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Tất cả</option>
              {Object.entries(MEMBERSHIP_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-5 py-2 bg-primary text-on-primary text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Tìm kiếm
            </button>
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-5 py-2 bg-surface-container text-on-surface text-sm font-semibold rounded-xl hover:bg-surface-container-high transition-colors"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
        {error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-red-500">error</span>
            </div>
            <p className="text-on-surface font-semibold">{error}</p>
            <button onClick={fetchCustomers} className="mt-4 px-4 py-2 bg-primary text-on-primary text-sm font-semibold rounded-xl">
              Thử lại
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-container-highest/20 border-b border-outline-variant/20">
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Khách hàng</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Email</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">SĐT</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Hạng</th>
                    <th className="px-4 py-3.5 text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Điểm</th>
                    <th className="px-4 py-3.5 text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Booking</th>
                    <th className="px-4 py-3.5 text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Tổng chi tiêu</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Trạng thái</th>
                    <th className="px-4 py-3.5 text-center text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={9}><TableSkeleton /></td></tr>
                  ) : customers.length === 0 ? (
                    <tr>
                      <td colSpan={9}>
                        <div className="flex flex-col items-center justify-center py-20">
                          <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-3">group</span>
                          <p className="text-on-surface-variant font-medium">Không tìm thấy khách hàng nào</p>
                          {hasFilters && (
                            <button onClick={resetFilters} className="mt-3 text-primary text-sm hover:underline">
                              Xóa bộ lọc để xem tất cả
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    customers.map((c, idx) => (
                      <tr
                        key={c.id}
                        className={`border-b border-outline-variant/10 hover:bg-surface-container-low/40 transition-colors cursor-pointer group ${idx % 2 !== 0 ? 'bg-surface-container-lowest/50' : ''}`}
                        onClick={() => router.push(`/admin/customers/${c.id}`)}
                      >
                        {/* Tên */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            {c.avatar ? (
                              <img src={c.avatar} alt={c.fullName} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-primary font-bold text-sm">
                                  {c.fullName?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-on-surface group-hover:text-primary transition-colors">{c.fullName}</p>
                              <p className="text-xs text-on-surface-variant">{formatDate(c.createdAt)}</p>
                            </div>
                          </div>
                        </td>
                        {/* Email */}
                        <td className="px-4 py-3.5 text-on-surface-variant text-sm">{c.email}</td>
                        {/* SĐT */}
                        <td className="px-4 py-3.5 text-on-surface-variant text-sm">{c.phone || '—'}</td>
                        {/* Hạng */}
                        <td className="px-4 py-3.5">
                          <MembershipBadge level={c.membershipLevel} />
                        </td>
                        {/* Điểm */}
                        <td className="px-4 py-3.5 text-right font-semibold text-on-surface">
                          {c.loyaltyPoints.toLocaleString('vi-VN')}
                        </td>
                        {/* Booking count */}
                        <td className="px-4 py-3.5 text-right">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                            {c.bookingCount}
                          </span>
                        </td>
                        {/* Tổng chi tiêu */}
                        <td className="px-4 py-3.5 text-right font-semibold text-on-surface">
                          {formatCurrency(c.totalSpent)}
                        </td>
                        {/* Trạng thái */}
                        <td className="px-4 py-3.5">
                          <StatusBadge status={c.status} />
                        </td>
                        {/* Action */}
                        <td className="px-4 py-3.5 text-center" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              href={`/admin/customers/${c.id}`}
                              className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                              title="Xem chi tiết"
                            >
                              <span className="material-symbols-outlined text-[18px] text-primary">visibility</span>
                            </Link>
                            <ActionMenu customer={c} onSuccess={fetchCustomers} />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="px-6 py-4 border-t border-outline-variant/10 flex items-center justify-between">
                <p className="text-sm text-on-surface-variant">
                  Trang <span className="font-semibold text-on-surface">{page}</span> / <span className="font-semibold text-on-surface">{totalPages}</span>
                  {' · '}Tổng <span className="font-semibold text-on-surface">{total.toLocaleString('vi-VN')}</span> khách hàng
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                    let p: number;
                    if (totalPages <= 7) {
                      p = i + 1;
                    } else if (page <= 4) {
                      if (i < 5) p = i + 1;
                      else if (i === 5) return <span key={i} className="px-1 text-on-surface-variant">…</span>;
                      else p = totalPages;
                    } else if (page >= totalPages - 3) {
                      if (i === 0) p = 1;
                      else if (i === 1) return <span key={i} className="px-1 text-on-surface-variant">…</span>;
                      else p = totalPages - 6 + i;
                    } else {
                      if (i === 0) p = 1;
                      else if (i === 1) return <span key={i} className="px-1 text-on-surface-variant">…</span>;
                      else if (i === 5) return <span key={i} className="px-1 text-on-surface-variant">…</span>;
                      else if (i === 6) p = totalPages;
                      else p = page + i - 3;
                    }
                    return (
                      <button
                        key={i}
                        onClick={() => setPage(p)}
                        className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
