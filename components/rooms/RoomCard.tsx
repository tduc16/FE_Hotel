"use client";

import Link from 'next/link';
import { useState } from 'react';
import { RoomCategory } from '@/types/room';

interface RoomCardProps {
  category: RoomCategory;
}

// BACKEND_URL để build URL ảnh — KHÔNG dùng /api prefix
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api$/, '');

function buildImageUrl(thumbnailUrl: any): string | null {
  if (typeof thumbnailUrl !== 'string' || !thumbnailUrl || thumbnailUrl.trim() === '') return null;

  // Đã là URL đầy đủ → giữ nguyên
  if (thumbnailUrl.startsWith('http://') || thumbnailUrl.startsWith('https://')) {
    return thumbnailUrl;
  }

  // Chuẩn hóa path: đảm bảo bắt đầu bằng /
  const path = thumbnailUrl.startsWith('/') ? thumbnailUrl : `/${thumbnailUrl}`;
  return `${BACKEND_URL}${path}`;
}

export default function RoomCard({ category }: RoomCardProps) {
  const [imgError, setImgError] = useState(false);

  const imageUrl = imgError ? null : buildImageUrl(category.thumbnail_url);

  if (process.env.NODE_ENV === 'development') {
    console.log(`[RoomCard] id=${category.id} | thumbnail_url=${category.thumbnail_url} | imageUrl=${imageUrl}`);
  }

  return (
    <div className="group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden hover:shadow-xl transition-all duration-500 border border-outline-variant/10">
      {/* Thumbnail — dùng <img> thường thay vì next/image để tránh SSR crash khi URL không match remotePatterns */}
      <div className="aspect-video overflow-hidden relative bg-surface-container">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={imageUrl}
            src={imageUrl}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={() => {
              console.warn(`[RoomCard] Ảnh lỗi, hiện placeholder cho room_id: ${category.id} - ${imageUrl}`);
              setImgError(true);
            }}
          />
        ) : (
          /* Fallback placeholder — không bao giờ crash */
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-surface-container to-surface-container-high">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 select-none">
              hotel
            </span>
            <span className="text-xs text-on-surface-variant/40 mt-2 select-none">
              Chưa có ảnh
            </span>
          </div>
        )}

        {/* Badge: Tên hạng phòng */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-on-surface shadow-sm">
          {category.name}
        </div>

        {/* Badge: Trạng thái còn phòng */}
        <div
          className={`absolute top-4 right-4 backdrop-blur-md px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest shadow-sm ${
            category.is_available
              ? 'bg-green-500/90 text-white'
              : 'bg-error/90 text-white'
          }`}
        >
          {category.is_available ? 'Còn phòng' : 'Hết phòng'}
        </div>
      </div>

      {/* Nội dung card */}
      <div className="p-8 flex-1 flex flex-col">
        {/* Tên + Giá */}
        <div className="flex justify-between items-start mb-4 gap-4">
          <h3 className="text-2xl font-bold font-headline text-on-surface line-clamp-2">
            {category.name}
          </h3>
          <div className="text-right flex-shrink-0">
            <span className="text-primary font-bold text-xl">
              {new Intl.NumberFormat('vi-VN').format(category.base_price)}đ
            </span>
            <span className="block text-[10px] text-on-surface-variant uppercase tracking-tighter">
              / đêm
            </span>
          </div>
        </div>

        {/* Mô tả */}
        <p className="text-on-surface-variant text-sm mb-6 line-clamp-2 leading-relaxed min-h-[40px]">
          {category.description || 'Không có mô tả chi tiết.'}
        </p>

        {/* Thông tin: sức chứa, phòng trống, tiện nghi */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-lg">group</span>
            <span className="text-xs font-medium">Sức chứa: {category.capacity} khách</span>
          </div>

          {category.available_rooms !== undefined && (
            <div className="flex items-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-lg">meeting_room</span>
              <span className="text-xs font-medium">Trống: {category.available_rooms}</span>
            </div>
          )}

          {Array.isArray(category.amenities) &&
            category.amenities.slice(0, 3).map((amenity, idx) => (
              <div key={idx} className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                <span className="text-xs font-medium">{amenity}</span>
              </div>
            ))}

          {Array.isArray(category.amenities) && category.amenities.length > 3 && (
            <div className="flex items-center gap-2 text-on-surface-variant">
              <span className="text-xs font-medium italic">
                +{category.amenities.length - 3} khác
              </span>
            </div>
          )}
        </div>

        {/* Nút CTA */}
        <div className="mt-auto flex flex-col sm:flex-row gap-3">
          <Link
            href={`/rooms/${category.id}`}
            className="flex-1 py-3 border border-outline-variant text-on-surface text-xs font-bold uppercase tracking-widest rounded hover:bg-surface-container transition-colors text-center inline-flex items-center justify-center"
          >
            Xem chi tiết
          </Link>

          {category.is_available ? (
            <Link
              href={`/booking?roomId=${category.id}`}
              className="flex-1 py-3 bg-[#449dd1] text-white text-xs font-bold text-center uppercase tracking-widest rounded hover:brightness-110 transition-all inline-flex items-center justify-center active:scale-[0.98]"
            >
              Đặt phòng ngay
            </Link>
          ) : (
            <button
              disabled
              className="flex-1 py-3 bg-surface-container-high text-on-surface-variant text-xs font-bold text-center uppercase tracking-widest rounded cursor-not-allowed inline-flex items-center justify-center"
            >
              Hết phòng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
