"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const SERIF = { fontFamily: "var(--font-cormorant), Georgia, serif" };

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  return (
    <div className="min-h-[75vh] bg-[#F8F6F3] flex items-center justify-center py-20 px-6">
      <div className="max-w-xl w-full bg-white border border-stone-200/60 p-12 text-center shadow-sm">
        <div className="w-16 h-16 border border-[#C8A97E]/30 flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-[#C8A97E] text-3xl">check</span>
        </div>

        <h1 className="text-3xl font-light text-stone-900 mb-4" style={SERIF}>
          Đặt phòng thành công!
        </h1>

        {code && (
          <div className="mb-6 p-4 bg-[#F8F6F3] border border-stone-150 inline-block">
            <p className="text-[9px] text-stone-400 uppercase tracking-widest font-semibold mb-1">Mã đặt phòng của bạn</p>
            <p className="text-xl font-mono text-[#C8A97E] font-bold tracking-wider">{code}</p>
          </div>
        )}

        <p className="text-stone-500 mb-8 text-sm leading-relaxed max-w-sm mx-auto">
          Cảm ơn bạn đã tin tưởng chọn Hotel Hoang Minh. Chúng tôi đã nhận được yêu cầu đặt phòng của bạn và sẽ gửi email xác nhận trong thời gian sớm nhất.
        </p>

        <Link
          href="/"
          className="inline-flex bg-[#C8A97E] hover:bg-[#b5956a] items-center justify-center gap-2 text-white px-8 py-3 text-xs font-medium uppercase tracking-widest transition-all"
        >
          <span className="material-symbols-outlined text-base">home</span>
          Quay về trang chủ
        </Link>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 rounded-full border-2 border-[#C8A97E]/30 border-t-[#C8A97E] animate-spin mx-auto"></div>
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  );
}
