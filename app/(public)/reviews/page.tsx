'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { reviewService } from '@/services/review.service';
import { roomService } from '@/services/room.service';
import toast from 'react-hot-toast';
import { Star, Calendar, MessageSquare, ArrowUpDown, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

const SERIF = { fontFamily: 'var(--font-cormorant), Georgia, serif' };

interface SummaryData {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    five: number;
    four: number;
    three: number;
    two: number;
    one: number;
  };
  featuredCount: number;
  categoryAverages: {
    cleanliness: number;
    service: number;
    comfort: number;
    location: number;
    value: number;
  };
}

interface ReviewItem {
  id: string;
  customerName: string;
  customerAvatar: string | null;
  rating: number;
  cleanlinessRating: number | null;
  serviceRating: number | null;
  comfortRating: number | null;
  locationRating: number | null;
  valueRating: number | null;
  title: string | null;
  comment: string;
  images: string[] | null;
  adminReply: string | null;
  roomCategoryName: string | null;
  stayPeriod: string | null;
  createdAt: string;
}

export default function ReviewsPage() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  
  // Filter & Sort States
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingFilter, setRatingFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sort, setSort] = useState('newest');

  // Categories for Filter
  const [categories, setCategories] = useState<any[]>([]);

  // Featured Reviews for top section
  const [featuredReviews, setFeaturedReviews] = useState<ReviewItem[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    fetchSummary();
    fetchCategories();
    fetchFeaturedReviews();
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [page, ratingFilter, categoryFilter, sort]);

  const fetchSummary = async () => {
    try {
      const res = await reviewService.getReviewsSummary();
      if (res.success) {
        setSummary(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch summary', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const cats = await roomService.getCategories();
      setCategories(cats || []);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const fetchFeaturedReviews = async () => {
    setLoadingFeatured(true);
    try {
      const res = await reviewService.getApprovedReviews({ featured: true, limit: 3 });
      setFeaturedReviews(res.items || []);
    } catch (err) {
      console.error('Failed to fetch featured reviews', err);
    } finally {
      setLoadingFeatured(false);
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const queryParams = {
        page,
        limit,
        rating: ratingFilter !== 'all' ? parseInt(ratingFilter, 10) : undefined,
        roomCategoryId: categoryFilter !== 'all' ? categoryFilter : undefined,
        sort,
      };
      const res = await reviewService.getApprovedReviews(queryParams);
      setReviews(res.items || []);
      setTotalPages(res.totalPages || 1);
      setTotalReviews(res.total || 0);
    } catch (err: any) {
      toast.error('Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingFilterChange = (val: string) => {
    setRatingFilter(val);
    setPage(1);
  };

  const handleCategoryFilterChange = (val: string) => {
    setCategoryFilter(val);
    setPage(1);
  };

  const handleSortChange = (val: string) => {
    setSort(val);
    setPage(1);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `Tháng ${d.getMonth() + 1}, ${d.getFullYear()}`;
  };

  const getPercent = (count: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  // Convert categories list to dynamic object
  const categoryScores = summary
    ? [
        { label: 'Độ sạch sẽ', score: summary.categoryAverages.cleanliness || 5.0 },
        { label: 'Dịch vụ', score: summary.categoryAverages.service || 5.0 },
        { label: 'Sự thoải mái', score: summary.categoryAverages.comfort || 5.0 },
        { label: 'Vị trí', score: summary.categoryAverages.location || 5.0 },
        { label: 'Đáng tiền', score: summary.categoryAverages.value || 5.0 },
      ]
    : [
        { label: 'Độ sạch sẽ', score: 5.0 },
        { label: 'Dịch vụ', score: 5.0 },
        { label: 'Sự thoải mái', score: 5.0 },
        { label: 'Vị trí', score: 5.0 },
        { label: 'Đáng tiền', score: 5.0 },
      ];

  return (
    <>
      {/* ── HERO ── */}
      <header className="relative min-h-[55vh] flex items-center overflow-hidden bg-[#1A1A1A]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          alt="Happy couple at sunset"
          src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1920&q=85"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A]/80 via-[#1A1A1A]/40 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-8 w-full py-20">
          <div className="max-w-2xl">
            <span className="block text-[10px] uppercase tracking-[0.4em] text-[#C8A97E] font-medium mb-4">
              Phản hồi thực tế từ khách hàng
            </span>
            <h1 className="text-5xl md:text-7xl font-light text-white mb-5 leading-[1.05]" style={SERIF}>
              Khách hàng<br />
              <em className="italic">nói về chúng tôi</em>
            </h1>
            <div className="w-12 h-[1px] bg-[#C8A97E] mb-6" />
            <p className="text-white/70 font-light leading-relaxed max-w-xl">
              Những nhận xét chân thực và công tâm nhất được gửi từ các vị khách đã từng lưu trú tại khách sạn Hoàng Minh.
            </p>
          </div>
        </div>
      </header>

      {/* ── STATS BAR ── */}
      <section className="bg-white border-b border-stone-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Overall score */}
            <div className="text-center lg:border-r lg:border-stone-200 lg:pr-12 flex-shrink-0 min-w-[180px]">
              <div className="text-7xl font-light text-[#C8A97E]" style={SERIF}>
                {summary?.averageRating || '5.0'}
              </div>
              <div className="flex justify-center text-[#C8A97E] my-2.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className="material-symbols-outlined text-xl"
                    style={{
                      fontVariationSettings:
                        i < Math.round(summary?.averageRating || 5) ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    star
                  </span>
                ))}
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500 font-bold">Trên 5.0 Điểm</p>
              <p className="text-xs text-stone-400 mt-1.5">
                Dựa trên {summary?.totalReviews || 0} đánh giá thực tế
              </p>
            </div>

            {/* Category scores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-6 w-full">
              {categoryScores.map(({ label, score }) => (
                <div key={label} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-stone-700">{label}</span>
                    <span className="text-[#C8A97E] font-bold">{score} / 5.0</span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#C8A97E] transition-all duration-700 rounded-full"
                      style={{ width: `${(score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED REVIEWS ── */}
      {featuredReviews.length > 0 && (
        <section className="py-20 bg-stone-50 border-b border-stone-100">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-12">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#C8A97E] font-bold block mb-3">
                Tuyển chọn đặc biệt
              </span>
              <h2 className="text-3xl font-light text-stone-900" style={SERIF}>
                Đánh giá nổi bật
              </h2>
              <div className="w-8 h-[1px] bg-[#C8A97E] mx-auto mt-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white p-8 border border-stone-100 hover:shadow-lg transition-all duration-300 relative group flex flex-col justify-between"
                >
                  <span
                    className="absolute top-5 right-6 text-7xl leading-none text-[#C8A97E]/10 select-none"
                    style={SERIF}
                  >
                    &ldquo;
                  </span>
                  <div>
                    {/* Reviewer */}
                    <div className="flex items-center gap-4 mb-5">
                      {review.customerAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          alt={review.customerName}
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-[#C8A97E]/20"
                          src={review.customerAvatar}
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                          {review.customerName[0]?.toUpperCase() || 'K'}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-stone-850 text-sm">{review.customerName}</p>
                        <p className="text-xs text-stone-400">
                          {formatDate(review.createdAt)} · {review.roomCategoryName || 'Khách sạn'}
                          {review.stayPeriod && ` · ${review.stayPeriod}`}
                        </p>
                      </div>
                    </div>

                    {/* Stars */}
                    <div className="flex text-[#C8A97E] mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className="material-symbols-outlined text-[16px]"
                          style={{
                            fontVariationSettings: i < review.rating ? "'FILL' 1" : "'FILL' 0",
                          }}
                        >
                          star
                        </span>
                      ))}
                    </div>

                    {/* Text */}
                    {review.title && (
                      <p className="font-bold text-stone-800 text-sm mb-1.5">{review.title}</p>
                    )}
                    <p className="text-stone-500 text-sm leading-relaxed italic">
                      &ldquo;{review.comment}&rdquo;
                    </p>
                  </div>

                  {/* Admin Reply */}
                  {review.adminReply && (
                    <div className="mt-5 pt-4 border-t border-stone-100 text-xs bg-stone-50/50 p-3 rounded-lg text-stone-600">
                      <p className="font-bold text-primary mb-1">Phản hồi của khách sạn:</p>
                      <p className="italic leading-relaxed">&ldquo;{review.adminReply}&rdquo;</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── ALL REVIEWS SECTION ── */}
      <section className="py-24 bg-[#FBF9F6]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Left Column: Filter Sidebar */}
            <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
              <div className="bg-white p-6 border border-stone-100 rounded-lg space-y-5">
                <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2 pb-3 border-b border-stone-100 uppercase tracking-wider">
                  <Filter size={16} /> Bộ lọc nhận xét
                </h3>

                {/* Rating filter */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-stone-500 uppercase">Theo số sao</h4>
                  <div className="space-y-2">
                    {[
                      { label: 'Tất cả đánh giá', val: 'all' },
                      { label: '5 sao', val: '5' },
                      { label: '4 sao', val: '4' },
                      { label: '3 sao', val: '3' },
                      { label: '2 sao', val: '2' },
                      { label: '1 sao', val: '1' },
                    ].map((item) => (
                      <label key={item.val} className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="ratingFilter"
                          checked={ratingFilter === item.val}
                          onChange={() => handleRatingFilterChange(item.val)}
                          className="text-primary focus:ring-primary border-stone-300"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Room category filter */}
                <div className="space-y-2.5 pt-4 border-t border-stone-100">
                  <h4 className="text-xs font-bold text-stone-500 uppercase">Loại phòng nghỉ</h4>
                  <select
                    value={categoryFilter}
                    onChange={(e) => handleCategoryFilterChange(e.target.value)}
                    className="w-full p-2.5 border border-stone-200 rounded-lg text-sm text-stone-600 bg-white focus:outline-none focus:border-[#C8A97E]"
                  >
                    <option value="all">Tất cả loại phòng</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort filter */}
                <div className="space-y-2.5 pt-4 border-t border-stone-100">
                  <h4 className="text-xs font-bold text-stone-500 uppercase flex items-center gap-1.5">
                    <ArrowUpDown size={13} /> Sắp xếp theo
                  </h4>
                  <select
                    value={sort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-full p-2.5 border border-stone-200 rounded-lg text-sm text-stone-600 bg-white focus:outline-none focus:border-[#C8A97E]"
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="highest">Điểm cao nhất</option>
                    <option value="lowest">Điểm thấp nhất</option>
                    <option value="featured">Được yêu thích nhất</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column: Review list */}
            <div className="flex-1 space-y-6">
              <div className="flex justify-between items-center text-sm text-stone-500 pb-3 border-b border-stone-100">
                <span className="font-medium">Tìm thấy {totalReviews} nhận xét khách hàng</span>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white border border-stone-100 rounded-lg">
                  <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <p className="text-sm text-stone-400">Đang tải danh sách nhận xét...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-20 bg-white border border-stone-100 rounded-lg p-8">
                  <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare size={28} className="text-stone-300" />
                  </div>
                  <h3 className="text-base font-semibold text-stone-800">Chưa có đánh giá nào được hiển thị.</h3>
                  <p className="text-sm text-stone-500 mt-1 max-w-sm mx-auto">
                    Hiện chưa có đánh giá nào phù hợp với bộ lọc được duyệt để hiển thị công khai.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white p-8 border border-stone-100 rounded-lg hover:shadow-xs transition-all flex flex-col gap-4"
                    >
                      {/* Top row: Reviewer info & rating */}
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 pb-4 border-b border-stone-50">
                        <div className="flex items-center gap-4.5">
                          {review.customerAvatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              alt={review.customerName}
                              className="w-12 h-12 rounded-full object-cover border border-stone-100 shadow-xs"
                              src={review.customerAvatar}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base border border-primary/5">
                              {review.customerName[0]?.toUpperCase() || 'K'}
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-stone-800 text-sm">{review.customerName}</h4>
                            <p className="text-xs text-stone-450 mt-0.5">
                              Đã lưu trú: {review.roomCategoryName || 'Khách sạn'}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:items-end gap-1.5">
                          <div className="flex text-[#C8A97E]">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className="material-symbols-outlined text-[18px]"
                                style={{
                                  fontVariationSettings: i < review.rating ? "'FILL' 1" : "'FILL' 0",
                                }}
                              >
                                star
                              </span>
                            ))}
                          </div>
                          <span className="text-[10px] text-stone-400 font-bold flex items-center gap-1">
                            <Calendar size={12} /> {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-2">
                        {review.title && (
                          <h5 className="font-bold text-stone-850 text-sm leading-snug">
                            {review.title}
                          </h5>
                        )}
                        <p className="text-stone-600 text-sm leading-relaxed italic">
                          &ldquo;{review.comment}&rdquo;
                        </p>
                      </div>

                      {/* Review Images */}
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 pt-1 overflow-x-auto">
                          {review.images.map((img, idx) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              key={idx}
                              src={img}
                              alt={`Guest upload ${idx + 1}`}
                              className="w-20 h-20 rounded-lg object-cover border border-stone-100 hover:scale-102 transition-transform cursor-pointer"
                            />
                          ))}
                        </div>
                      )}

                      {/* Admin Response */}
                      {review.adminReply && (
                        <div className="bg-[#FAF9F5] p-5 rounded-lg border border-stone-100 text-xs text-stone-600 mt-2 space-y-1.5">
                          <p className="font-bold text-[#C8A97E] uppercase tracking-wider flex items-center gap-1.5">
                            <MessageSquare size={13} /> Phản hồi từ Hoàng Minh Hotel:
                          </p>
                          <p className="italic leading-relaxed">&ldquo;{review.adminReply}&rdquo;</p>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                      <button
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        disabled={page === 1}
                        className="p-2.5 border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-40 transition-colors"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-sm text-stone-500 font-medium px-4">
                        Trang {page} / {totalPages}
                      </span>
                      <button
                        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                        disabled={page === totalPages}
                        className="p-2.5 border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-40 transition-colors"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-[#1A1A1A] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1920&q=80')",
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-4" style={SERIF}>
            Trở thành khách hàng tiếp theo<br />
            <em className="italic text-[#C8A97E]">trải nghiệm sự khác biệt</em>
          </h2>
          <div className="w-10 h-[1px] bg-[#C8A97E] mx-auto mb-8" />
          <Link
            href="/booking"
            className="inline-block px-10 py-4 bg-[#C8A97E] hover:bg-[#b5956a] text-white text-xs font-medium uppercase tracking-[0.2em] transition-all duration-300 hover:shadow-xl"
          >
            Đặt phòng ngay
          </Link>
        </div>
      </section>
    </>
  );
}
