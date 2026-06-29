import Link from "next/link";
import RoomCard from "@/components/rooms/RoomCard";
import { roomService } from "@/services/room.service";
import { hotelServiceApi } from "@/services/hotel-service.service";
import { RoomCategory } from "@/types/room";
import { HotelService } from "@/types/services";

// Luôn render dynamic (SSR) vì trang fetch dữ liệu realtime từ API
export const dynamic = "force-dynamic";

const SERIF = { fontFamily: "var(--font-cormorant), Georgia, serif" };

// ──────────────────────────────────────────────
// Helper: build image URL for service images
// ──────────────────────────────────────────────
const BACKEND_URL =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api").replace(
    /\/api$/,
    ""
  );

function buildServiceImageUrl(url: string | null): string | null {
  if (!url || url.trim() === "") return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${BACKEND_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

// ──────────────────────────────────────────────
// Data fetching helpers with error handling
// ──────────────────────────────────────────────
async function fetchRooms(): Promise<{ data: RoomCategory[]; error: string | null }> {
  try {
    const rooms = await roomService.getCategories();
    // Chỉ hiển thị phòng đang hoạt động
    const activeRooms = rooms.filter((r) => r.is_active !== false);
    return { data: activeRooms.slice(0, 3), error: null };
  } catch (err) {
    console.error("[Home] fetchRooms error:", err);
    return { data: [], error: "Không thể tải danh sách phòng." };
  }
}

async function fetchServices(): Promise<{ data: HotelService[]; error: string | null }> {
  try {
    const services = await hotelServiceApi.getServices();
    // Chỉ hiển thị dịch vụ đang hoạt động
    const active = Array.isArray(services)
      ? services.filter((s) => s.isActive !== false)
      : [];
    return { data: active.slice(0, 5), error: null };
  } catch (err) {
    console.error("[Home] fetchServices error:", err);
    return { data: [], error: "Không thể tải danh sách dịch vụ." };
  }
}

async function fetchFeaturedReviews(): Promise<any[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const res = await fetch(`${apiUrl}/reviews?featured=true&limit=3`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.error("[Home] fetchFeaturedReviews error:", err);
    return [];
  }
}

async function fetchReviewsSummary(): Promise<any> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const res = await fetch(`${apiUrl}/reviews/summary`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || null;
  } catch (err) {
    console.error("[Home] fetchReviewsSummary error:", err);
    return null;
  }
}

// ──────────────────────────────────────────────
// Page Component (Server Component — async)
// ──────────────────────────────────────────────
export default async function Home() {
  const [roomsResult, servicesResult, featuredReviews, reviewsSummary] = await Promise.all([
    fetchRooms(),
    fetchServices(),
    fetchFeaturedReviews(),
    fetchReviewsSummary(),
  ]);

  const rooms = roomsResult.data;
  const roomsError = roomsResult.error;
  const services = servicesResult.data;
  const servicesError = servicesResult.error;

  return (
    <>
      {/* ──────── HERO ──────── */}
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-[#1A1A1A]">
        {/* Background image */}
        <img
          alt="Luxury hotel pool at golden hour"
          src="https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1920&q=85"
          className="absolute inset-0 w-full h-full object-cover opacity-50 scale-105"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A]/60 via-[#1A1A1A]/30 to-[#1A1A1A]/80" />

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <span className="inline-block text-[10px] uppercase tracking-[0.4em] text-[#C8A97E] mb-6 font-medium">
            Chào mừng đến với
          </span>
          <h1
            className="text-5xl md:text-8xl font-light text-white mb-6 leading-[1.05]"
            style={SERIF}
          >
            Hoàng Minh Hotel<br />
          </h1>
          <div className="w-16 h-[1px] bg-[#C8A97E] mx-auto mb-6" />
          <p className="text-base md:text-xl text-white/70 font-light leading-relaxed max-w-2xl mx-auto mb-10">
            Không gian nghỉ dưỡng tinh tế ngay trung tâm thành phố — nơi mỗi khoảnh khắc đều là đặc quyền của riêng bạn.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/booking"
              className="px-8 py-3.5 bg-[#C8A97E] hover:bg-[#b5956a] text-white text-xs font-medium uppercase tracking-[0.2em] transition-all duration-300 hover:shadow-xl hover:shadow-[#C8A97E]/20 active:scale-95"
            >
              Đặt phòng ngay
            </Link>
            <Link
              href="/rooms"
              className="px-8 py-3.5 border border-white/30 hover:border-[#C8A97E] text-white hover:text-[#C8A97E] text-xs font-medium uppercase tracking-[0.2em] transition-all duration-300 backdrop-blur-sm bg-white/5"
            >
              Khám phá phòng
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
          <span className="text-[9px] uppercase tracking-[0.3em] text-white/40">Cuộn xuống</span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-white/40 to-transparent animate-pulse" />
        </div>
      </section>

      {/* ──────── BOOKING BAR ──────── */}
      <section className="relative z-20 -mt-1 bg-[#F8F6F3]">
        <div className="max-w-6xl mx-auto px-6 py-0">
          <div className="bg-white shadow-2xl shadow-stone-300/40 border border-[#C8A97E]/10 -mt-8 relative">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-0 divide-y md:divide-y-0 md:divide-x divide-stone-100">
              {[
                { label: "Ngày nhận phòng", icon: "calendar_today", type: "date" },
                { label: "Ngày trả phòng", icon: "calendar_today", type: "date" },
              ].map(({ label, icon, type }) => (
                <div key={label} className="p-5 space-y-1">
                  <label className="block text-[9px] uppercase tracking-[0.25em] font-semibold text-[#C8A97E]">
                    {label}
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-stone-400 text-[18px]">
                      {icon}
                    </span>
                    <input
                      type={type}
                      className="w-full pl-7 pr-0 py-1 bg-transparent border-0 text-sm text-stone-700 focus:ring-0 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
              <div className="p-5 space-y-1">
                <label className="block text-[9px] uppercase tracking-[0.25em] font-semibold text-[#C8A97E]">
                  Số khách
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-stone-400 text-[18px]">
                    person
                  </span>
                  <select className="w-full pl-7 pr-0 py-1 bg-transparent border-0 text-sm text-stone-700 focus:ring-0 focus:outline-none appearance-none">
                    <option>1 Người lớn</option>
                    <option>2 Người lớn</option>
                    <option>3 Người lớn</option>
                  </select>
                </div>
              </div>
              <div className="p-3 flex items-stretch">
                <Link
                  href="/booking"
                  className="flex-1 bg-[#C8A97E] hover:bg-[#b5956a] text-white text-xs font-medium uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-300"
                >
                  <span className="material-symbols-outlined text-lg">search</span>
                  Tìm kiếm
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────── ROOMS PREVIEW ──────── */}
      {/* Data source: GET /api/rooms/categories — only active categories, max 3 */}
      <section className="py-28 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#C8A97E] font-medium block mb-3">
              Bộ sưu tập phòng
            </span>
            <h2 className="text-4xl md:text-5xl font-light text-stone-900" style={SERIF}>
              Phòng nghỉ sang trọng
            </h2>
          </div>
          <Link
            href="/rooms"
            className="flex items-center gap-2 text-[#C8A97E] text-sm font-medium hover:gap-3 transition-all duration-300 uppercase tracking-wider"
          >
            Xem tất cả <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </Link>
        </div>

        {/* Error state */}
        {roomsError && (
          <div className="flex items-center gap-3 px-6 py-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-sm mb-8">
            <span className="material-symbols-outlined text-lg">error_outline</span>
            {roomsError}
          </div>
        )}

        {/* Empty state */}
        {!roomsError && rooms.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center text-stone-400">
            <span className="material-symbols-outlined text-5xl mb-4 text-stone-300">hotel</span>
            <p className="text-sm">Hiện chưa có hạng phòng nào được hiển thị.</p>
          </div>
        )}

        {/* Room grid */}
        {rooms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <RoomCard key={room.id} category={room} />
            ))}
          </div>
        )}
      </section>

      {/* ──────── SERVICES / AMENITIES ──────── */}
      {/* Data source: GET /api/services — only active services, max 5 */}
      <section className="py-24 bg-stone-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#C8A97E] font-medium block mb-3">
              Đặc quyền thượng lưu
            </span>
            <h2 className="text-3xl md:text-4xl font-light text-white" style={SERIF}>
              Dịch vụ &amp; Tiện ích
            </h2>
            <div className="w-10 h-[1px] bg-[#C8A97E] mx-auto mt-4" />
          </div>

          {/* Error state */}
          {servicesError && (
            <div className="flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-white/10 text-stone-400 text-sm rounded-sm mb-8 max-w-md mx-auto">
              <span className="material-symbols-outlined text-lg">error_outline</span>
              {servicesError}
            </div>
          )}

          {/* Empty state */}
          {!servicesError && services.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center text-stone-500">
              <span className="material-symbols-outlined text-4xl mb-3 text-stone-600">room_service</span>
              <p className="text-sm">Hiện chưa có dịch vụ nào được hiển thị.</p>
            </div>
          )}

          {/* Services grid */}
          {services.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {services.map((service) => {
                const imgUrl = buildServiceImageUrl(service.imageUrl);
                return (
                  <div
                    key={service.id}
                    className="group text-center p-8 border border-stone-700 hover:border-[#C8A97E]/60 transition-all duration-500 hover:bg-[#C8A97E]/5"
                  >
                    <div className="w-14 h-14 border border-stone-700 group-hover:border-[#C8A97E]/50 flex items-center justify-center mx-auto mb-4 transition-all duration-500 overflow-hidden">
                      {imgUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imgUrl}
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                      ) : service.icon ? (
                        <span className="material-symbols-outlined text-[#C8A97E]/70 group-hover:text-[#C8A97E] text-2xl transition-colors duration-300">
                          {service.icon}
                        </span>
                      ) : (
                        <span className="material-symbols-outlined text-[#C8A97E]/70 group-hover:text-[#C8A97E] text-2xl transition-colors duration-300">
                          room_service
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-stone-400 group-hover:text-stone-200 uppercase tracking-wider transition-colors duration-300 line-clamp-2">
                      {service.name}
                    </p>
                    {service.shortDescription && (
                      <p className="text-[10px] text-stone-600 group-hover:text-stone-500 mt-1 leading-relaxed transition-colors duration-300 line-clamp-2">
                        {service.shortDescription}
                      </p>
                    )}
                    {(service.openTime || service.location) && (
                      <div className="mt-2 space-y-0.5">
                        {service.openTime && (
                          <p className="text-[10px] text-stone-600">
                            {service.openTime}
                            {service.closeTime ? ` – ${service.closeTime}` : ""}
                          </p>
                        )}
                        {service.location && (
                          <p className="text-[10px] text-stone-600 italic">{service.location}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* View all link */}
          {services.length > 0 && (
            <div className="text-center mt-10">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 text-[#C8A97E] text-xs font-medium hover:gap-3 transition-all duration-300 uppercase tracking-wider"
              >
                Xem tất cả dịch vụ
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ──────── REVIEWS ──────── */}
      <section className="py-28 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C8A97E] font-medium block mb-3">
            Khách hàng nói
          </span>
          <h2 className="text-3xl md:text-5xl font-light text-stone-900 mb-4" style={SERIF}>
            Đánh giá từ quý khách
          </h2>
          <div className="flex items-center justify-center gap-1 text-[#C8A97E]">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className="material-symbols-outlined text-xl"
                style={{
                  fontVariationSettings:
                    i < Math.round(reviewsSummary?.averageRating || 5) ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                star
              </span>
            ))}
            <span className="ml-2 text-sm text-stone-500 font-medium">
              {reviewsSummary
                ? `${reviewsSummary.averageRating} / 5.0 dựa trên ${reviewsSummary.totalReviews} đánh giá`
                : "4.9 / 5 dựa trên 500+ đánh giá"}
            </span>
          </div>
        </div>

        {featuredReviews.length === 0 ? (
          <div className="text-center py-12 bg-white border border-stone-100 rounded-lg p-8 max-w-md mx-auto">
            <span className="material-symbols-outlined text-4xl text-stone-300 mb-3 block">
              chat_bubble_outline
            </span>
            <p className="text-sm text-stone-400">Chưa có đánh giá nổi bật nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white p-8 border border-stone-100 shadow-xs hover:shadow-md transition-all duration-300 relative group flex flex-col justify-between"
              >
                <span
                  className="absolute top-6 right-6 text-6xl leading-none text-[#C8A97E]/10 select-none"
                  style={SERIF}
                >
                  &ldquo;
                </span>
                <div>
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
                        {review.customerName[0]?.toUpperCase() || "K"}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-stone-800 text-sm">{review.customerName}</p>
                      {(review.roomCategoryName || review.stayPeriod) && (
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          {review.roomCategoryName}{review.roomCategoryName && review.stayPeriod && ' · '}{review.stayPeriod}
                        </p>
                      )}
                      <div className="flex text-[#C8A97E]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className="material-symbols-outlined text-xs"
                            style={{
                              fontVariationSettings: i < review.rating ? "'FILL' 1" : "'FILL' 0",
                            }}
                          >
                            star
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {review.title && (
                    <p className="font-bold text-stone-850 text-sm mb-1.5">{review.title}</p>
                  )}
                  <p className="text-stone-500 italic leading-relaxed text-sm">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                </div>
                {review.adminReply && (
                  <div className="mt-4 pt-3 border-t border-stone-50 text-[11px] text-stone-600">
                    <p className="font-bold text-primary mb-0.5">Khách sạn phản hồi:</p>
                    <p className="italic leading-relaxed">&ldquo;{review.adminReply}&rdquo;</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ──────── CTA BANNER ──────── */}
      <section className="relative py-32 bg-[#1A1A1A] overflow-hidden">
        <div
          className="absolute inset-0 bg-fixed bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1920&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A] via-[#1A1A1A]/90 to-[#1A1A1A]" />
        <div className="relative z-10 text-center max-w-3xl mx-auto px-6">
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#C8A97E] font-medium block mb-4">
            Kỳ nghỉ đẳng cấp
          </span>
          <h2 className="text-4xl md:text-6xl font-light text-white mb-6 leading-tight" style={SERIF}>
            Tận hưởng từng khoảnh<br />
            <em className="italic">khắc thượng lưu</em>
          </h2>
          <div className="w-12 h-[1px] bg-[#C8A97E] mx-auto mb-8" />
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/booking"
              className="px-8 py-3.5 bg-[#C8A97E] hover:bg-[#b5956a] text-white text-xs font-medium uppercase tracking-[0.2em] transition-all duration-300 hover:shadow-lg"
            >
              Đặt phòng ngay
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3.5 border border-white/20 hover:border-[#C8A97E] text-white hover:text-[#C8A97E] text-xs font-medium uppercase tracking-[0.2em] transition-all duration-300"
            >
              Liên hệ tư vấn
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
