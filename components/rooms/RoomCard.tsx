"use client";

import Link from 'next/link';
import { useState } from 'react';
import { RoomCategory } from '@/types/room';

interface RoomCardProps {
  category: RoomCategory;
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api$/, '');

function buildImageUrl(thumbnailUrl: any): string | null {
  if (typeof thumbnailUrl !== 'string' || !thumbnailUrl || thumbnailUrl.trim() === '') return null;
  if (thumbnailUrl.startsWith('http://') || thumbnailUrl.startsWith('https://')) {
    return thumbnailUrl;
  }
  const path = thumbnailUrl.startsWith('/') ? thumbnailUrl : `/${thumbnailUrl}`;
  return `${BACKEND_URL}${path}`;
}

const SERIF = { fontFamily: "var(--font-cormorant), Georgia, serif" };

export default function RoomCard({ category }: RoomCardProps) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = imgError ? null : buildImageUrl(category.thumbnail_url);

  if (process.env.NODE_ENV === 'development') {
    console.log(`[RoomCard] id=${category.id} | thumbnail_url=${category.thumbnail_url} | imageUrl=${imageUrl}`);
  }

  return (
    <div className="group flex flex-col bg-white overflow-hidden hover:shadow-2xl hover:shadow-stone-300/50 hover:-translate-y-1 transition-all duration-500 border border-stone-100">
      {/* Thumbnail */}
      <div className="aspect-[16/10] overflow-hidden relative bg-stone-100">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={imageUrl}
            src={imageUrl}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={() => {
              console.warn(`[RoomCard] Ảnh lỗi cho room_id: ${category.id}`);
              setImgError(true);
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
            <span className="material-symbols-outlined text-5xl text-stone-300 select-none">hotel</span>
            <span className="text-xs text-stone-400 mt-2 select-none">Chưa có ảnh</span>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Status badge */}
        <div
          className={`absolute top-4 right-4 px-3 py-1 text-[9px] font-bold uppercase tracking-widest ${
            category.is_available
              ? 'bg-emerald-500 text-white'
              : 'bg-red-500/90 text-white'
          }`}
        >
          {category.is_available ? 'Còn phòng' : 'Hết phòng'}
        </div>
      </div>

      {/* Content */}
      <div className="p-7 flex-1 flex flex-col">
        {/* Name + Price */}
        <div className="flex justify-between items-start mb-3 gap-4">
          <h3 className="text-xl font-light text-stone-900 line-clamp-2" style={SERIF}>
            {category.name}
          </h3>
          <div className="text-right flex-shrink-0">
            <span className="text-[#C8A97E] font-semibold text-lg">
              {new Intl.NumberFormat('vi-VN').format(category.base_price)}đ
            </span>
            <span className="block text-[10px] text-stone-400 uppercase tracking-wider">
              / đêm
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-8 h-[1px] bg-[#C8A97E]/50 mb-4" />

        {/* Description */}
        <p className="text-stone-500 text-sm mb-6 line-clamp-2 leading-relaxed">
          {category.description || 'Không gian phòng nghỉ tinh tế và sang trọng.'}
        </p>

        {/* Info chips */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-1.5 text-stone-500">
            <span className="material-symbols-outlined text-[15px] text-[#C8A97E]">group</span>
            <span className="text-xs">{category.capacity} khách</span>
          </div>

          {category.available_rooms !== undefined && (
            <div className="flex items-center gap-1.5 text-stone-500">
              <span className="material-symbols-outlined text-[15px] text-[#C8A97E]">meeting_room</span>
              <span className="text-xs">Trống: {category.available_rooms}</span>
            </div>
          )}

          {Array.isArray(category.amenities) &&
            category.amenities.slice(0, 2).map((amenity, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-stone-500">
                <span className="material-symbols-outlined text-[15px] text-[#C8A97E]">check</span>
                <span className="text-xs">{amenity}</span>
              </div>
            ))}

          {Array.isArray(category.amenities) && category.amenities.length > 2 && (
            <span className="text-xs text-stone-400 italic">
              +{category.amenities.length - 2} tiện nghi khác
            </span>
          )}
        </div>

        {/* CTAs */}
        <div className="mt-auto grid grid-cols-2 gap-3 pt-5 border-t border-stone-100">
          <Link
            href={`/rooms/${category.id}`}
            className="py-2.5 text-center border border-stone-200 hover:border-[#C8A97E] text-stone-600 hover:text-[#C8A97E] text-xs font-medium uppercase tracking-widest transition-all duration-300"
          >
            Xem chi tiết
          </Link>

          {category.is_available ? (
            <Link
              href={`/booking?roomId=${category.id}`}
              className="py-2.5 text-center bg-[#C8A97E] hover:bg-[#b5956a] text-white text-xs font-medium uppercase tracking-widest transition-all duration-300"
            >
              Đặt phòng
            </Link>
          ) : (
            <button
              disabled
              className="py-2.5 bg-stone-100 text-stone-400 text-xs font-medium uppercase tracking-widest cursor-not-allowed"
            >
              Hết phòng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
