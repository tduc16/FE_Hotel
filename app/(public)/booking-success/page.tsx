"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center">
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl p-12 border border-outline-variant/10">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-primary text-4xl">check_circle</span>
        </div>

        <h1 className="text-3xl font-extrabold text-on-surface mb-4">Đặt phòng thành công!</h1>

        {code && (
          <div className="mb-6 p-4 bg-surface-container-low rounded-lg inline-block">
            <p className="text-sm text-on-surface-variant uppercase tracking-wider font-bold mb-1">Mã đặt phòng của bạn</p>
            <p className="text-2xl font-mono text-primary font-bold">{code}</p>
          </div>
        )}

        <p className="text-on-surface-variant mb-8 text-lg max-w-lg mx-auto">
          Cảm ơn bạn đã tin tưởng chọn Hotel Hoang Minh. Chúng tôi đã nhận được yêu cầu đặt phòng của bạn và sẽ gửi SMS / Email xác nhận trong thời gian sớm nhất.
        </p>

        <Link
          href="/"
          className="inline-flex bg-primary-container items-center justify-center gap-2 mx-auto text-on-primary-container px-8 py-3 rounded-lg font-bold hover:bg-primary hover:text-on-primary transition-all shadow-sm active:scale-95"
        >
          <span className="material-symbols-outlined">home</span>
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
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  );
}
