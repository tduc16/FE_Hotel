'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { reviewService } from '@/services/review.service';
import { roomService } from '@/services/room.service';
import toast from 'react-hot-toast';
import {
  MessageSquare,
  Search,
  Star,
  Calendar,
  X,
  Eye,
  Check,
  Ban,
  EyeOff,
  Award,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface ReviewItem {
  id: string;
  customerName: string;
  bookingCode: string | null;
  roomName: string | null;
  roomType: string | null;
  stayPeriod: string | null;
  rating: number;
  title: string | null;
  comment: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';
  source: 'SEEDED' | 'CUSTOMER';
  isFeatured: boolean;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // Categories list
  const [categories, setCategories] = useState<any[]>([]);

  // KPI Stats
  const [stats, setStats] = useState({
    totalReviews: 0,
    pendingReviews: 0,
    approvedReviews: 0,
    averageRating: 0.0,
  });

  // Modal Detail State
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Reply State on Modal
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Reject State on Modal
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [submittingReject, setSubmittingReject] = useState(false);

  useEffect(() => {
    const token = authService.getToken();
    if (!token) {
      router.push('/admin/login');
      return;
    }
    loadInitData();
  }, [router]);

  useEffect(() => {
    fetchReviews();
  }, [page, statusFilter, ratingFilter, sourceFilter, categoryFilter, fromDate, toDate]);

  const loadInitData = async () => {
    try {
      const cats = await roomService.getCategories();
      setCategories(cats || []);
      fetchSummary();
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await reviewService.getAdminReviewsSummary();
      if (res.success && res.data) {
        setStats({
          totalReviews: res.data.totalReviews,
          pendingReviews: res.data.pendingReviews,
          approvedReviews: res.data.approvedReviews,
          averageRating: res.data.averageRating || 0.0,
        });
      }
    } catch (err: any) {
      if (err.message === 'UNAUTHORIZED') {
        authService.logout();
        router.push('/admin/login');
      } else {
        console.error('Failed to fetch summary stats', err);
      }
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const queryParams: any = {
        page,
        limit,
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        rating: ratingFilter !== 'all' ? parseInt(ratingFilter, 10) : undefined,
        source: sourceFilter !== 'all' ? sourceFilter : undefined,
        roomCategoryId: categoryFilter !== 'all' ? categoryFilter : undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      };

      const res = await reviewService.getAdminReviews(queryParams);
      setReviews(res.items || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      if (err.message === 'UNAUTHORIZED') {
        authService.logout();
        router.push('/admin/login');
      } else {
        toast.error('Không thể tải danh sách đánh giá');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchReviews();
  };

  const handleOpenDetail = async (id: string) => {
    setIsDetailOpen(true);
    setLoadingDetail(true);
    setShowRejectInput(false);
    setRejectReason('');
    try {
      const res = await reviewService.getAdminReviewDetail(id);
      setSelectedReview(res.data || null);
      setReplyText(res.data?.adminReply || '');
    } catch (err: any) {
      toast.error('Không thể tải chi tiết đánh giá');
      setIsDetailOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn phê duyệt đánh giá này?')) return;
    try {
      await reviewService.approveReview(id);
      toast.success('Đã phê duyệt đánh giá thành công');
      fetchReviews();
      fetchSummary();
      if (isDetailOpen && selectedReview?.id === id) {
        handleOpenDetail(id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Không thể phê duyệt đánh giá');
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    setSubmittingReject(true);
    try {
      await reviewService.rejectReview(id, rejectReason.trim());
      toast.success('Đã từ chối đánh giá thành công');
      setShowRejectInput(false);
      setRejectReason('');
      fetchReviews();
      fetchSummary();
      if (isDetailOpen) {
        handleOpenDetail(id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Không thể từ chối đánh giá');
    } finally {
      setSubmittingReject(false);
    }
  };

  const handleHide = async (id: string) => {
    if (!confirm('Bạn có muốn ẩn đánh giá này khỏi trang hiển thị công khai?')) return;
    try {
      await reviewService.hideReview(id);
      toast.success('Đã ẩn đánh giá thành công');
      fetchReviews();
      fetchSummary();
      if (isDetailOpen && selectedReview?.id === id) {
        handleOpenDetail(id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Không thể ẩn đánh giá');
    }
  };

  const handleReplySubmit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!replyText.trim()) {
      toast.error('Vui lòng nhập nội dung phản hồi');
      return;
    }

    setSubmittingReply(true);
    try {
      await reviewService.replyReview(id, replyText.trim());
      toast.success('Đã gửi phản hồi thành công');
      fetchReviews();
      if (isDetailOpen) {
        handleOpenDetail(id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Không thể gửi phản hồi');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const newFeatured = !currentFeatured;
      await reviewService.toggleFeatured(id, newFeatured);
      toast.success(newFeatured ? 'Đã đặt làm đánh giá nổi bật' : 'Đã hủy đánh giá nổi bật');
      fetchReviews();
      if (isDetailOpen && selectedReview?.id === id) {
        handleOpenDetail(id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Không thể cập nhật trạng thái nổi bật');
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: ReviewItem['status']) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
            <AlertCircle size={12} /> Chờ duyệt
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CheckCircle2 size={12} /> Đã duyệt
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100">
            <Ban size={12} /> Bị từ chối
          </span>
        );
      case 'HIDDEN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <EyeOff size={12} /> Đang ẩn
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <MessageSquare className="text-primary" />
          Quản lý Đánh giá từ khách hàng
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Xem xét, duyệt hoặc ẩn các đánh giá phòng của khách hàng và gửi phản hồi chính thức từ khách sạn.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
            <MessageSquare size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Tổng đánh giá</p>
            <h3 className="text-xl font-bold text-slate-700 mt-1">{stats.totalReviews}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Đang chờ duyệt</p>
            <h3 className="text-xl font-bold text-slate-700 mt-1">{stats.pendingReviews}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Đã phê duyệt</p>
            <h3 className="text-xl font-bold text-slate-700 mt-1">{stats.approvedReviews}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-violet-50 text-violet-600 rounded-xl">
            <Star size={24} fill="currentColor" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Điểm trung bình</p>
            <h3 className="text-xl font-bold text-slate-700 mt-1">{stats.averageRating} / 5.0</h3>
          </div>
        </div>
      </div>

      {/* Filters Area */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm theo khách, nội dung, mã booking..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary bg-white"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="REJECTED">Bị từ chối</option>
              <option value="HIDDEN">Đang ẩn</option>
            </select>
          </div>

          <div>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary bg-white"
            >
              <option value="all">Tất cả số sao</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
            </select>
          </div>

          <div>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary bg-white"
            >
              <option value="all">Tất cả nguồn</option>
              <option value="CUSTOMER">Khách hàng thực</option>
              <option value="SEEDED">Seeded</option>
            </select>
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary bg-white"
            >
              <option value="all">Tất cả loại phòng</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 lg:col-span-1">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              placeholder="Từ ngày"
              className="w-full px-2 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary bg-white"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              placeholder="Đến ngày"
              className="w-full px-2 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary bg-white"
            />
          </div>
        </form>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Đang tải danh sách đánh giá...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={28} className="text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">Không tìm thấy đánh giá nào</h3>
            <p className="text-sm text-slate-500 mt-1">
              Thử thay đổi bộ lọc tìm kiếm hoặc tiêu chí lọc.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-5">Khách hàng</th>
                  <th className="py-4 px-5">Booking / Phòng</th>
                  <th className="py-4 px-5 text-center">Số sao</th>
                  <th className="py-4 px-5">Nội dung đánh giá</th>
                  <th className="py-4 px-5">Nổi bật</th>
                  <th className="py-4 px-5">Trạng thái</th>
                  <th className="py-4 px-5">Ngày gửi</th>
                  <th className="py-4 px-5 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm text-slate-600">
                {reviews.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-semibold text-slate-900">{item.customerName}</div>
                      {item.source === 'SEEDED' ? (
                        <span className="inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-50 text-violet-600 border border-violet-100">SEEDED</span>
                      ) : (
                        <span className="inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">CUSTOMER</span>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      {item.bookingCode ? (
                        <div className="font-bold text-primary text-xs uppercase">{item.bookingCode}</div>
                      ) : item.roomType ? (
                        <div className="font-semibold text-stone-600 text-xs">{item.roomType}</div>
                      ) : null}
                      {item.roomName && (
                        <div className="text-xs text-slate-400 mt-0.5">Phòng: {item.roomName}</div>
                      )}
                      {item.stayPeriod && (
                        <div className="text-xs text-slate-400 mt-0.5">{item.stayPeriod}</div>
                      )}
                    </td>
                    <td className="py-4 px-5 text-center">
                      <div className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 font-bold text-xs">
                        {item.rating} <Star size={12} fill="currentColor" />
                      </div>
                    </td>
                    <td className="py-4 px-5 max-w-xs">
                      {item.title && <div className="font-bold text-slate-800 truncate text-xs">{item.title}</div>}
                      <div className="text-xs text-slate-500 truncate mt-0.5">{item.comment}</div>
                    </td>
                    <td className="py-4 px-5">
                      <button
                        onClick={() => handleToggleFeatured(item.id, item.isFeatured)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          item.isFeatured ? 'text-violet-600 bg-violet-50' : 'text-slate-300 hover:text-violet-600'
                        }`}
                        title={item.isFeatured ? 'Hủy đặt nổi bật' : 'Đặt nổi bật'}
                      >
                        <Award size={18} fill={item.isFeatured ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                    <td className="py-4 px-5">{getStatusBadge(item.status)}</td>
                    <td className="py-4 px-5 text-xs text-slate-400">{formatDate(item.createdAt)}</td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenDetail(item.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-primary transition-colors"
                          title="Xem chi tiết & phản hồi"
                        >
                          <Eye size={16} />
                        </button>
                        {item.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(item.id)}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Phê duyệt"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => {
                                handleOpenDetail(item.id);
                                setTimeout(() => {
                                  setShowRejectInput(true);
                                  document.getElementById('reject-form-scroll')?.scrollIntoView({ behavior: 'smooth' });
                                }, 300);
                              }}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Từ chối"
                            >
                              <Ban size={16} />
                            </button>
                          </>
                        )}
                        {item.status === 'APPROVED' && (
                          <button
                            onClick={() => handleHide(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                            title="Ẩn đánh giá"
                          >
                            <EyeOff size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {isDetailOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-3xl">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <MessageSquare className="text-primary" /> Chi tiết đánh giá
                </h3>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingDetail ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <p className="text-sm text-slate-400">Đang tải thông tin chi tiết...</p>
                </div>
              ) : selectedReview ? (
                <>
                  {/* Khách hàng & Booking info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-sm">
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-700">Thông tin khách hàng</h4>
                      <div className="flex items-center gap-3">
                        {selectedReview.customer?.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={selectedReview.customer.avatar}
                            alt={selectedReview.customerName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                            {selectedReview.customer?.fullName?.[0]?.toUpperCase() || 'K'}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-800">{selectedReview.customer?.fullName}</p>
                          <p className="text-xs text-slate-400">Email: {selectedReview.customer?.email}</p>
                          <p className="text-xs text-slate-400">SĐT: {selectedReview.customer?.phone}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-700">Thông tin đặt phòng</h4>
                      <div className="space-y-1 text-xs">
                        <p>
                          <span className="font-bold">Mã Booking:</span>{' '}
                          <span className="font-semibold text-primary uppercase">{selectedReview.booking?.booking_code}</span>
                        </p>
                        <p>
                          <span className="font-bold">Loại phòng:</span> {selectedReview.roomCategory?.name}
                        </p>
                        {selectedReview.room?.room_number && (
                          <p>
                            <span className="font-bold">Số phòng:</span> {selectedReview.room?.room_number}
                          </p>
                        )}
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold pt-1">
                          <Calendar size={12} />
                          <span>
                            {formatDate(selectedReview.booking?.check_in_date)} - {formatDate(selectedReview.booking?.check_out_date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ratings */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-700">Điểm số đánh giá chi tiết</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                      <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-2xl text-center">
                        <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Tổng quan</p>
                        <div className="flex justify-center text-amber-500 font-bold text-base mt-1.5 gap-1">
                          {selectedReview.rating} <Star size={16} fill="currentColor" className="self-center" />
                        </div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sạch sẽ</p>
                        <div className="flex justify-center text-amber-400 font-semibold text-sm mt-1.5 gap-0.5">
                          {selectedReview.cleanlinessRating || '—'}{' '}
                          {selectedReview.cleanlinessRating && <Star size={13} fill="currentColor" className="self-center" />}
                        </div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dịch vụ</p>
                        <div className="flex justify-center text-amber-400 font-semibold text-sm mt-1.5 gap-0.5">
                          {selectedReview.serviceRating || '—'}{' '}
                          {selectedReview.serviceRating && <Star size={13} fill="currentColor" className="self-center" />}
                        </div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Thoải mái</p>
                        <div className="flex justify-center text-amber-400 font-semibold text-sm mt-1.5 gap-0.5">
                          {selectedReview.comfortRating || '—'}{' '}
                          {selectedReview.comfortRating && <Star size={13} fill="currentColor" className="self-center" />}
                        </div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Vị trí</p>
                        <div className="flex justify-center text-amber-400 font-semibold text-sm mt-1.5 gap-0.5">
                          {selectedReview.locationRating || '—'}{' '}
                          {selectedReview.locationRating && <Star size={13} fill="currentColor" className="self-center" />}
                        </div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Đáng giá</p>
                        <div className="flex justify-center text-amber-400 font-semibold text-sm mt-1.5 gap-0.5">
                          {selectedReview.valueRating || '—'}{' '}
                          {selectedReview.valueRating && <Star size={13} fill="currentColor" className="self-center" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comment Content */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-700">Nội dung nhận xét</h4>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                      {selectedReview.title && <h5 className="font-bold text-slate-900 text-sm">{selectedReview.title}</h5>}
                      <p className="text-sm text-slate-600 leading-relaxed italic">&ldquo;{selectedReview.comment}&rdquo;</p>
                      {selectedReview.images && selectedReview.images.length > 0 && (
                        <div className="flex gap-2 pt-2 overflow-x-auto">
                          {selectedReview.images.map((img: string, idx: number) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              key={idx}
                              src={img}
                              alt={`Review attachment ${idx}`}
                              className="w-20 h-20 rounded-xl object-cover border border-slate-200 shadow-xs hover:scale-105 transition-transform"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reject Reason Form or Display */}
                  {selectedReview.status === 'REJECTED' && selectedReview.rejectReason && (
                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-700 text-xs">
                      <p className="font-bold flex items-center gap-1.5">
                        <Ban size={14} /> Lý do từ chối phê duyệt:
                      </p>
                      <p className="mt-1 font-semibold">{selectedReview.rejectReason}</p>
                    </div>
                  )}

                  {/* Action buttons (Approve / Reject Toggle) */}
                  {selectedReview.status === 'PENDING' && (
                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        onClick={() => handleApprove(selectedReview.id)}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <Check size={14} /> Phê duyệt đánh giá
                      </button>
                      <button
                        onClick={() => setShowRejectInput(!showRejectInput)}
                        className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <Ban size={14} /> Từ chối đánh giá
                      </button>

                      {showRejectInput && (
                        <form
                          id="reject-form-scroll"
                          onSubmit={(e) => handleRejectSubmit(e, selectedReview.id)}
                          className="w-full mt-3 flex gap-2"
                        >
                          <input
                            type="text"
                            placeholder="Nhập lý do từ chối phê duyệt..."
                            value={rejectReason}
                            required
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="flex-1 px-4 py-2 border border-rose-200 focus:border-rose-500 rounded-xl text-xs outline-none transition-colors"
                          />
                          <button
                            type="submit"
                            disabled={submittingReject}
                            className="px-4 py-2 bg-rose-750 text-white rounded-xl text-xs font-semibold hover:bg-rose-800 disabled:opacity-50 transition-colors"
                          >
                            Xác nhận từ chối
                          </button>
                        </form>
                      )}
                    </div>
                  )}

                  {selectedReview.status === 'APPROVED' && (
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => handleHide(selectedReview.id)}
                        className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
                      >
                        <EyeOff size={14} /> Ẩn đánh giá
                      </button>
                      <button
                        onClick={() => handleToggleFeatured(selectedReview.id, selectedReview.isFeatured)}
                        className={`px-5 py-2 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                          selectedReview.isFeatured
                            ? 'bg-violet-100 hover:bg-violet-200 text-violet-700'
                            : 'bg-violet-600 hover:bg-violet-700 text-white'
                        }`}
                      >
                        <Award size={14} /> {selectedReview.isFeatured ? 'Hủy đánh giá nổi bật' : 'Đặt làm nổi bật'}
                      </button>
                    </div>
                  )}

                  {/* Admin Reply Form / Display */}
                  <div className="border-t border-slate-100 pt-6 space-y-3">
                    <h4 className="text-sm font-bold text-slate-700">Phản hồi của khách sạn</h4>
                    <form onSubmit={(e) => handleReplySubmit(e, selectedReview.id)} className="space-y-3">
                      <textarea
                        placeholder="Viết câu trả lời, phản hồi chính thức cho khách hàng tại đây..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={3}
                        required
                        className="w-full px-4 py-3 border border-slate-200 focus:border-primary rounded-2xl text-sm outline-none resize-none transition-all"
                      />
                      <div className="flex justify-between items-center">
                        {selectedReview.adminReply && selectedReview.adminReplyAt && (
                          <span className="text-[10px] text-slate-400 font-semibold italic">
                            Phản hồi lần cuối: {formatDate(selectedReview.adminReplyAt)}
                          </span>
                        )}
                        <button
                          type="submit"
                          disabled={submittingReply}
                          className="ml-auto px-5 py-2.5 bg-primary hover:bg-primary-container hover:text-primary text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                        >
                          {submittingReply ? (
                            <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          ) : (
                            'Gửi phản hồi'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
