"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { roomService } from "@/services/room.service";
import { RoomCategory } from "@/types/room";
import Link from "next/link";

const SERIF = { fontFamily: "var(--font-cormorant), Georgia, serif" };

export default function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [category, setCategory] = useState<RoomCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string>("");

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const data = await roomService.getCategoryById(id);
      setCategory(data);
      if (data.thumbnail_url) {
        setActiveImage(data.thumbnail_url);
      }
    } catch (err) {
      console.error("Lỗi khi tải chi tiết hạng phòng:", err);
      setError("Không thể tải thông tin phòng. Vui lòng quay lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
  const buildImageUrl = (url: string | null) => {
    if (!url) return "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80"; // fallback
    if (url.startsWith("http")) return url;
    return `${BACKEND_URL}${url.startsWith("/") ? url : "/" + url}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F6F3] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#C8A97E]/30 border-t-[#C8A97E] animate-spin"></div>
        <p className="text-stone-500 font-light tracking-widest text-xs uppercase animate-pulse">
          Đang chuẩn bị không gian của bạn...
        </p>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-[#F8F6F3] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 border border-stone-200/60 shadow-xl text-center">
          <span className="material-symbols-outlined text-[#C8A97E] text-5xl mb-4">error</span>
          <h2 className="text-xl font-light text-stone-950 mb-2" style={SERIF}>Đã xảy ra lỗi</h2>
          <p className="text-sm text-stone-500 mb-6">{error || "Hạng phòng không tồn tại."}</p>
          <button
            onClick={() => router.push("/rooms")}
            className="w-full py-3 bg-[#C8A97E] hover:bg-[#b5956a] text-white text-xs font-semibold uppercase tracking-wider transition-all duration-300"
          >
            Quay lại hệ thống phòng
          </button>
        </div>
      </div>
    );
  }

  const allImages = [
    category.thumbnail_url,
    ...(category.gallery || []),
  ].filter(Boolean) as string[];

  return (
    <div className="bg-[#F8F6F3] text-stone-850 min-h-screen pb-24 pt-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Breadcrumb & Navigation Back */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/rooms"
            className="inline-flex items-center gap-2 text-stone-500 hover:text-[#C8A97E] transition-colors font-medium text-xs uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Trở lại danh sách phòng
          </Link>
          <span
            className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest ${
              category.is_available
                ? "bg-emerald-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {category.is_available ? "Còn phòng" : "Hết phòng"}
          </span>
        </div>

        {/* Title and Pricing Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-stone-200/60 pb-8">
          <div>
            <span className="text-[10px] uppercase tracking-[0.35em] text-[#C8A97E] font-medium block mb-2">
              Khám phá không gian
            </span>
            <h1 className="text-4xl md:text-5xl font-light text-stone-900 leading-tight" style={SERIF}>
              {category.name}
            </h1>
            <div className="flex flex-wrap gap-4 mt-4 items-center text-stone-500 text-xs font-medium uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-[#C8A97E]">group</span>
                Sức chứa: {category.capacity} Khách
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-stone-300"></span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-[#C8A97E]">meeting_room</span>
                Còn trống: {category.available_rooms || 0} phòng
              </span>
            </div>
          </div>
          <div className="text-left md:text-right flex-shrink-0">
            <span className="block text-[9px] uppercase tracking-widest text-stone-400 font-bold mb-1">Giá mỗi đêm từ</span>
            <span className="text-3xl md:text-4xl font-semibold text-[#C8A97E]">
              {new Intl.NumberFormat("vi-VN").format(category.base_price)}đ
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Cột Trái (8/12) - Gallery & Details */}
          <div className="lg:col-span-8 space-y-12">
            {/* Gallery Section */}
            <div className="space-y-4">
              <div className="aspect-[16/9] w-full overflow-hidden bg-stone-100 border border-stone-200/50">
                <img
                  src={buildImageUrl(activeImage || category.thumbnail_url)}
                  alt={category.name}
                  className="w-full h-full object-cover transition-all duration-500"
                />
              </div>
              {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-stone-200">
                  {allImages.map((img, index) => {
                    const isSelected = (activeImage || category.thumbnail_url) === img;
                    return (
                      <div
                        key={index}
                        onClick={() => setActiveImage(img)}
                        className={`aspect-[16/10] w-24 sm:w-28 overflow-hidden cursor-pointer flex-shrink-0 border transition-all duration-300 ${
                          isSelected ? "border-[#C8A97E] scale-95 opacity-100" : "border-stone-200 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={buildImageUrl(img)} alt={`${category.name} ${index}`} className="w-full h-full object-cover" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-2xl font-light text-stone-900" style={SERIF}>Tổng quan hạng phòng</h2>
              <div className="w-8 h-[1px] bg-[#C8A97E]" />
              <p className="text-stone-600 leading-relaxed font-light text-sm whitespace-pre-line">
                {category.description || "Không có mô tả chi tiết cho hạng phòng này."}
              </p>
            </div>

            {/* Room Amenities Section */}
            {category.amenities && category.amenities.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-light text-stone-900" style={SERIF}>Tiện nghi trong phòng</h2>
                <div className="w-8 h-[1px] bg-[#C8A97E]" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-white p-6 border border-stone-100">
                  {category.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-stone-600">
                      <span className="material-symbols-outlined text-base text-[#C8A97E]">check</span>
                      <span className="text-xs font-medium uppercase tracking-wider">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cột Phải (4/12) - Services & Booking Action */}
          <div className="lg:col-span-4 space-y-8">
            {/* Booking Card */}
            <div className="bg-white p-8 border border-stone-100 space-y-6">
              <div className="text-center">
                <span className="block text-[9px] uppercase tracking-widest text-stone-400 font-bold mb-1">Giá tốt nhất</span>
                <span className="text-2xl font-semibold text-stone-900">
                  {new Intl.NumberFormat("vi-VN").format(category.base_price)}đ <span className="text-xs text-stone-400 font-normal">/ đêm</span>
                </span>
              </div>

              {category.is_available ? (
                <Link
                  href={`/booking?roomId=${category.id}`}
                  className="block w-full py-3.5 bg-[#C8A97E] hover:bg-[#b5956a] text-white text-xs font-medium text-center uppercase tracking-widest transition-all duration-300"
                >
                  Đặt phòng ngay
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full py-3.5 bg-stone-100 text-stone-400 text-xs font-medium text-center uppercase tracking-widest cursor-not-allowed"
                >
                  Hiện đã hết phòng
                </button>
              )}

              <div className="bg-[#F8F6F3] p-5 text-xs text-stone-500 leading-relaxed border border-stone-200/40">
                <span className="font-bold block text-stone-700 uppercase tracking-widest mb-2 text-[9px]">Chính sách đặt phòng:</span>
                <ul className="space-y-1.5 list-disc pl-3">
                  <li>Hủy phòng miễn phí trước 24 giờ.</li>
                  <li>Nhận phòng lúc 14:00, trả phòng lúc 12:00.</li>
                  <li>Liên hệ lễ tân nếu muốn nhận phòng sớm.</li>
                </ul>
              </div>
            </div>

            {/* Included Services (Đặc quyền dịch vụ khách sạn đi kèm) */}
            <div className="bg-white p-8 border border-stone-100 space-y-6">
              <div>
                <h3 className="font-light text-xl text-stone-900" style={SERIF}>
                  Đặc quyền dịch vụ
                </h3>
                <p className="text-[10px] text-stone-400 uppercase tracking-wider mt-1">
                  Đã bao gồm trong chi phí lưu trú của bạn
                </p>
                <div className="w-8 h-[1px] bg-[#C8A97E] mt-3" />
              </div>

              {category.services && category.services.length > 0 ? (
                <div className="space-y-5">
                  {category.services.map((service) => (
                    <div
                      key={service.id}
                      className="group flex gap-4 p-2 hover:bg-[#F8F6F3] transition-colors duration-300"
                    >
                      <div className="bg-[#F8F6F3] text-[#C8A97E] p-2.5 flex items-center justify-center flex-shrink-0 self-start border border-[#C8A97E]/10">
                        <span className="material-symbols-outlined text-lg">{service.icon || "room_service"}</span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-xs text-stone-900 uppercase tracking-wider">
                          {service.name}
                        </h4>
                        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                          {service.shortDescription || "Hưởng đặc quyền dịch vụ thượng lưu."}
                        </p>
                        <div className="flex gap-3 text-[9px] text-[#C8A97E] font-semibold uppercase tracking-widest pt-1">
                          <span className="flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-xs">schedule</span>
                            {service.openTime && service.closeTime ? `${service.openTime} - ${service.closeTime}` : "Cả ngày"}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-xs">location_on</span>
                            {service.location || "Khách sạn"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-stone-400 italic text-xs border border-dashed border-stone-200">
                  Chỉ bao gồm dịch vụ lưu trú cơ bản. Các dịch vụ khác như Spa, Nhà hàng sẽ được tính phí riêng khi sử dụng.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
