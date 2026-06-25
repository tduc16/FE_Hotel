'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { customerAuthService } from '@/services/customer-auth.service';
import { reviewService } from '@/services/review.service';
import toast from 'react-hot-toast';
import {
  MessageSquare,
  Star,
  Calendar,
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface EligibleBooking {
  bookingId: string;
  bookingCode: string;
  roomName: string | null;
  roomCategoryName: string | null;
  checkInDate: string;
  checkOutDate: string;
  thumbnailUrl: string | null;
}

interface MyReview {
  id: string;
  rating: number;
  cleanlinessRating: number | null;
  serviceRating: number | null;
  comfortRating: number | null;
  locationRating: number | null;
  valueRating: number | null;
  title: string | null;
  comment: string;
  images: string[] | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';
  adminReply: string | null;
  adminReplyAt: string | null;
  rejectReason: string | null;
  createdAt: string;
  booking: {
    id: string;
    bookingCode: string;
    checkInDate: string;
    checkOutDate: string;
  } | null;
  roomCategoryName: string | null;
  roomName: string | null;
}

export default function CustomerReviewsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'eligible' | 'my-reviews'>('eligible');
  const [eligibleBookings, setEligibleBookings] = useState<EligibleBooking[]>([]);
  const [myReviews, setMyReviews] = useState<MyReview[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<EligibleBooking | null>(null);
  const [editingReview, setEditingReview] = useState<MyReview | null>(null);

  // Form State
  const [rating, setRating] = useState(5);
  const [cleanlinessRating, setCleanlinessRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [comfortRating, setComfortRating] = useState(5);
  const [locationRating, setLocationRating] = useState(5);
  const [valueRating, setValueRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchEligibleBookings = async () => {
    try {
      const res = await reviewService.getEligibleBookings();
      setEligibleBookings(res.data || []);
    } catch (err: any) {
      if (err.message === 'UNAUTHORIZED') {
        customerAuthService.logout();
        router.push('/login');
      } else {
        toast.error(err.message || 'Không thể tải danh sách chờ đánh giá');
      }
    }
  };

  const fetchMyReviews = async () => {
    try {
      const res = await reviewService.getMyReviews();
      setMyReviews(res.data || []);
    } catch (err: any) {
      if (err.message === 'UNAUTHORIZED') {
        customerAuthService.logout();
        router.push('/login');
      } else {
        toast.error(err.message || 'Không thể tải danh sách đánh giá của tôi');
      }
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchEligibleBookings(), fetchMyReviews()]);
    setLoading(false);
  };

  useEffect(() => {
    const token = customerAuthService.getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    loadData();
  }, [router]);

  const openWriteModal = (booking: EligibleBooking) => {
    setSelectedBooking(booking);
    setEditingReview(null);
    setRating(5);
    setCleanlinessRating(5);
    setServiceRating(5);
    setComfortRating(5);
    setLocationRating(5);
    setValueRating(5);
    setTitle('');
    setComment('');
    setImages([]);
    setImageUrlInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (review: MyReview) => {
    setEditingReview(review);
    setSelectedBooking(null);
    setRating(review.rating);
    setCleanlinessRating(review.cleanlinessRating ?? 5);
    setServiceRating(review.serviceRating ?? 5);
    setComfortRating(review.comfortRating ?? 5);
    setLocationRating(review.locationRating ?? 5);
    setValueRating(review.valueRating ?? 5);
    setTitle(review.title ?? '');
    setComment(review.comment);
    setImages(review.images ?? []);
    setImageUrlInput('');
    setIsModalOpen(true);
  };

  const handleAddImage = () => {
    if (!imageUrlInput.trim()) return;
    if (images.length >= 5) {
      toast.error('Chỉ được tải lên tối đa 5 hình ảnh');
      return;
    }
    try {
      new URL(imageUrlInput); // Validate URL format
      setImages([...images, imageUrlInput.trim()]);
      setImageUrlInput('');
    } catch {
      toast.error('Đường dẫn ảnh không hợp lệ');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.length < 10) {
      toast.error('Nội dung đánh giá phải tối thiểu 10 ký tự');
      return;
    }
    if (comment.length > 1000) {
      toast.error('Nội dung đánh giá không được vượt quá 1000 ký tự');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        rating,
        cleanlinessRating,
        serviceRating,
        comfortRating,
        locationRating,
        valueRating,
        title: title.trim() || undefined,
        comment: comment.trim(),
        images: images.length > 0 ? images : undefined,
      };

      if (editingReview) {
        await reviewService.updateReview(editingReview.id, payload);
        toast.success('Cập nhật đánh giá thành công!');
      } else if (selectedBooking) {
        await reviewService.createReview({
          bookingId: selectedBooking.bookingId,
          ...payload,
        });
        toast.success('Gửi đánh giá thành công! Đang chờ phê duyệt.');
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Không thể gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;
    try {
      await reviewService.deleteReview(id);
      toast.success('Xóa đánh giá thành công!');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Không thể xóa đánh giá');
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const renderStarsSelector = (
    label: string,
    currentValue: number,
    onChange: (val: number) => void
  ) => {
    return (
      <div className="flex items-center justify-between py-2 border-b border-slate-50">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => onChange(star)}
              className="text-amber-400 hover:scale-110 transition-transform focus:outline-none"
            >
              <Star
                size={22}
                fill={star <= currentValue ? 'currentColor' : 'none'}
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  const getStatusBadge = (status: MyReview['status']) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
            <AlertCircle size={12} /> Chờ duyệt
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CheckCircle2 size={12} /> Đã duyệt
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
            <X size={12} /> Bị từ chối
          </span>
        );
      case 'HIDDEN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Ẩn
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Đang tải thông tin đánh giá...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Quản lý Đánh giá</h1>
        <p className="text-sm text-slate-500 mt-1">
          Gửi nhận xét về kỳ nghỉ của bạn để giúp chúng tôi hoàn thiện chất lượng dịch vụ tốt hơn.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 gap-8">
        <button
          onClick={() => setActiveTab('eligible')}
          className={`pb-4 text-sm font-semibold relative transition-all ${
            activeTab === 'eligible'
              ? 'text-primary'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Chờ đánh giá ({eligibleBookings.length})
          {activeTab === 'eligible' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('my-reviews')}
          className={`pb-4 text-sm font-semibold relative transition-all ${
            activeTab === 'my-reviews'
              ? 'text-primary'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Đánh giá của tôi ({myReviews.length})
          {activeTab === 'my-reviews' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'eligible' ? (
        eligibleBookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 p-8 shadow-xs">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={28} className="text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">Không có đặt phòng nào chờ đánh giá</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Chỉ những đặt phòng đã hoàn tất thời gian lưu trú (Check-out) mới đủ điều kiện gửi đánh giá nhận xét.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {eligibleBookings.map((booking) => (
              <div
                key={booking.bookingId}
                className="bg-white rounded-2xl border border-slate-100 p-5 flex gap-4 shadow-xs hover:border-slate-200 transition-all"
              >
                <div className="w-24 h-24 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden relative border border-slate-50">
                  {booking.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={booking.thumbnailUrl}
                      alt={booking.roomCategoryName || ''}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ImageIcon size={28} />
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-primary tracking-wider uppercase">
                      Mã: {booking.bookingCode}
                    </span>
                    <h3 className="text-base font-bold text-slate-800 truncate">
                      {booking.roomCategoryName || 'Loại phòng'}
                    </h3>
                    {booking.roomName && (
                      <p className="text-xs text-slate-500 font-semibold">
                        Số phòng: {booking.roomName}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                      <Calendar size={12} />
                      <span>
                        {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => openWriteModal(booking)}
                    className="mt-3 w-full sm:w-auto self-start px-4 py-2 bg-primary hover:bg-primary-container hover:text-primary text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Viết đánh giá
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : myReviews.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 p-8 shadow-xs">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star size={28} className="text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">Bạn chưa gửi đánh giá nào</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Mọi đánh giá bạn đã viết cho khách sạn sẽ được liệt kê đầy đủ tại đây kèm phản hồi từ ban quản lý.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {myReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-xs relative overflow-hidden"
            >
              {/* Top row */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-50 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400">
                      Mã đặt phòng: {review.booking?.bookingCode}
                    </span>
                    {getStatusBadge(review.status)}
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    {review.roomCategoryName || 'Loại phòng'} {review.roomName && `(Phòng ${review.roomName})`}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Thời gian gửi: {formatDate(review.createdAt)}
                  </p>
                </div>

                {review.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(review)}
                      className="p-2 text-slate-500 hover:text-primary hover:bg-slate-50 rounded-xl transition-all"
                      title="Sửa đánh giá"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50/55 rounded-xl transition-all"
                      title="Xóa đánh giá"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Ratings */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                <div className="bg-slate-50/50 p-2.5 rounded-xl text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tổng quan</p>
                  <div className="flex justify-center text-amber-400 mt-1">
                    {review.rating} <Star size={13} fill="currentColor" className="ml-0.5 self-center" />
                  </div>
                </div>
                {review.cleanlinessRating && (
                  <div className="bg-slate-50/50 p-2.5 rounded-xl text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sạch sẽ</p>
                    <div className="flex justify-center text-amber-400 mt-1">
                      {review.cleanlinessRating} <Star size={13} fill="currentColor" className="ml-0.5 self-center" />
                    </div>
                  </div>
                )}
                {review.serviceRating && (
                  <div className="bg-slate-50/50 p-2.5 rounded-xl text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dịch vụ</p>
                    <div className="flex justify-center text-amber-400 mt-1">
                      {review.serviceRating} <Star size={13} fill="currentColor" className="ml-0.5 self-center" />
                    </div>
                  </div>
                )}
                {review.comfortRating && (
                  <div className="bg-slate-50/50 p-2.5 rounded-xl text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Thoải mái</p>
                    <div className="flex justify-center text-amber-400 mt-1">
                      {review.comfortRating} <Star size={13} fill="currentColor" className="ml-0.5 self-center" />
                    </div>
                  </div>
                )}
                {review.locationRating && (
                  <div className="bg-slate-50/50 p-2.5 rounded-xl text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Vị trí</p>
                    <div className="flex justify-center text-amber-400 mt-1">
                      {review.locationRating} <Star size={13} fill="currentColor" className="ml-0.5 self-center" />
                    </div>
                  </div>
                )}
                {review.valueRating && (
                  <div className="bg-slate-50/50 p-2.5 rounded-xl text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Đáng giá</p>
                    <div className="flex justify-center text-amber-400 mt-1">
                      {review.valueRating} <Star size={13} fill="currentColor" className="ml-0.5 self-center" />
                    </div>
                  </div>
                )}
              </div>

              {/* Review Text */}
              <div className="space-y-1">
                {review.title && (
                  <h4 className="font-bold text-slate-900 text-sm">
                    {review.title}
                  </h4>
                )}
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  &ldquo;{review.comment}&rdquo;
                </p>
              </div>

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto py-1">
                  {review.images.map((img, idx) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={idx}
                      src={img}
                      alt={`Review photo ${idx + 1}`}
                      className="w-16 h-16 rounded-lg object-cover border border-slate-100 hover:scale-105 transition-transform"
                    />
                  ))}
                </div>
              )}

              {/* Reject Reason */}
              {review.status === 'REJECTED' && review.rejectReason && (
                <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 text-xs text-rose-700 flex gap-2">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Lý do từ chối phê duyệt:</p>
                    <p className="mt-0.5">{review.rejectReason}</p>
                  </div>
                </div>
              )}

              {/* Admin Reply */}
              {review.adminReply && (
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 text-xs text-slate-700 flex gap-2">
                  <MessageSquare size={16} className="flex-shrink-0 text-primary mt-0.5" />
                  <div>
                    <p className="font-bold text-primary">Phản hồi từ khách sạn Hoàng Minh:</p>
                    <p className="mt-1 leading-relaxed italic">{review.adminReply}</p>
                    {review.adminReplyAt && (
                      <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                        Ngày phản hồi: {formatDate(review.adminReplyAt)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Write / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingReview ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá mới'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* Product Info */}
              <div className="bg-slate-50 p-4 rounded-xl flex gap-3 text-xs">
                <div className="space-y-1">
                  <p className="font-bold text-slate-800">
                    Phòng: {editingReview ? editingReview.roomCategoryName : selectedBooking?.roomCategoryName}
                  </p>
                  <p className="text-slate-400">
                    Mã đặt phòng: {editingReview ? editingReview.booking?.bookingCode : selectedBooking?.bookingCode}
                  </p>
                </div>
              </div>

              {/* Rating fields */}
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 mb-2">Đánh giá điểm số</h3>
                {renderStarsSelector('Điểm tổng quan *', rating, setRating)}
                {renderStarsSelector('Độ sạch sẽ', cleanlinessRating, setCleanlinessRating)}
                {renderStarsSelector('Dịch vụ khách sạn', serviceRating, setServiceRating)}
                {renderStarsSelector('Sự thoải mái của phòng', comfortRating, setComfortRating)}
                {renderStarsSelector('Vị trí đắc địa', locationRating, setLocationRating)}
                {renderStarsSelector('Giá trị xứng đáng tiền', valueRating, setValueRating)}
              </div>

              {/* Title & Comment */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-900">Tiêu đề đánh giá</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={150}
                    placeholder="Tóm tắt ngắn gọn trải nghiệm của bạn (ví dụ: Rất tuyệt vời!)"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary text-sm outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-900">Nội dung chi tiết *</label>
                  <textarea
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    minLength={10}
                    maxLength={1000}
                    rows={4}
                    placeholder="Hãy chia sẻ thêm về trải nghiệm của bạn (tối thiểu 10 ký tự, tối đa 1000 ký tự)"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary text-sm outline-none transition-all resize-none"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                    <span>Tối thiểu 10 ký tự</span>
                    <span>{comment.length}/1000 ký tự</span>
                  </div>
                </div>
              </div>

              {/* Upload Images Link */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 flex items-center gap-1">
                  <ImageIcon size={16} /> Thêm ảnh đính kèm (URL, tối đa 5 ảnh)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="Nhập đường dẫn URL của hình ảnh..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary text-sm outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1 transition-all"
                  >
                    <Plus size={16} /> Thêm
                  </button>
                </div>

                {images.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-0.5 right-0.5 bg-black/70 hover:bg-black text-white p-0.5 rounded-full"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-semibold transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-primary hover:bg-primary-container hover:text-primary text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 min-w-[120px] transition-all"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : editingReview ? (
                    'Lưu thay đổi'
                  ) : (
                    'Gửi đánh giá'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
