"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const SERIF = { fontFamily: "var(--font-cormorant), Georgia, serif" };

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const method = searchParams.get("method");
  const amountStr = searchParams.get("amount");
  const qrUrl = searchParams.get("qr");
  const transferContent = searchParams.get("content");
  const bankName = searchParams.get("bankName");
  const accountNumber = searchParams.get("accountNumber");
  const accountName = searchParams.get("accountName");

  const amount = amountStr ? Number(amountStr) : 0;
  const isBankTransfer = method === "BANK_TRANSFER";

  const [qrLoaded, setQrLoaded] = useState(false);
  const [qrError, setQrError] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="min-h-[75vh] bg-[#F8F6F3] py-16 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="bg-white border border-stone-200/60 p-10 text-center shadow-sm mb-6">
          <div className="w-16 h-16 border border-[#C8A97E]/30 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-[#C8A97E] text-3xl">check</span>
          </div>

          <h1 className="text-3xl font-light text-stone-900 mb-3" style={SERIF}>
            Đặt phòng thành công!
          </h1>

          <p className="text-stone-400 text-xs uppercase tracking-widest mb-6">
            {isBankTransfer
              ? "Vui lòng hoàn tất thanh toán chuyển khoản"
              : "Chúng tôi sẽ liên hệ xác nhận với quý khách"}
          </p>

          {code && (
            <div className="mb-6 p-4 bg-[#F8F6F3] border border-stone-200 inline-block">
              <p className="text-[9px] text-stone-400 uppercase tracking-widest font-semibold mb-1">
                Mã đặt phòng của bạn
              </p>
              <p className="text-2xl font-mono text-[#C8A97E] font-bold tracking-wider">{code}</p>
            </div>
          )}

          {!isBankTransfer && (
            <p className="text-stone-500 text-sm leading-relaxed max-w-sm mx-auto">
              Cảm ơn bạn đã tin tưởng chọn Khách sạn Hoàng Minh. Thông tin đặt phòng và hóa đơn đã được gửi đến email của quý khách.
            </p>
          )}
        </div>

        {/* Bank Transfer QR Section */}
        {isBankTransfer && (
          <div className="bg-white border border-stone-200/60 shadow-sm overflow-hidden mb-6">
            {/* Header */}
            <div className="bg-[#1A1A1A] px-8 py-5 text-center">
              <h2 className="text-xs font-semibold text-white uppercase tracking-[0.25em]">
                Thông tin chuyển khoản
              </h2>
            </div>

            <div className="p-8">
              {/* Bank Info */}
              <div className="grid grid-cols-1 gap-3 mb-8">
                {bankName && (
                  <div className="flex justify-between items-center text-sm border-b border-stone-50 pb-3">
                    <span className="text-stone-400 text-xs uppercase tracking-wider font-medium">Ngân hàng</span>
                    <span className="font-semibold text-stone-800">{bankName}</span>
                  </div>
                )}
                {accountNumber && (
                  <div className="flex justify-between items-center text-sm border-b border-stone-50 pb-3">
                    <span className="text-stone-400 text-xs uppercase tracking-wider font-medium">Số tài khoản</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-stone-900 text-base">{accountNumber}</span>
                      <button
                        onClick={() => handleCopy(accountNumber, "account")}
                        className="text-[#C8A97E] hover:text-[#b5956a] transition-colors"
                        title="Sao chép"
                      >
                        <span className="material-symbols-outlined text-sm">
                          {copied === "account" ? "check" : "content_copy"}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
                {accountName && (
                  <div className="flex justify-between items-center text-sm border-b border-stone-50 pb-3">
                    <span className="text-stone-400 text-xs uppercase tracking-wider font-medium">Tên tài khoản</span>
                    <span className="font-semibold text-stone-800 uppercase">{accountName}</span>
                  </div>
                )}
                {amount > 0 && (
                  <div className="flex justify-between items-center text-sm border-b border-stone-50 pb-3">
                    <span className="text-stone-400 text-xs uppercase tracking-wider font-medium">Số tiền</span>
                    <span className="font-bold text-[#C8A97E] text-lg">{formatCurrency(amount)}</span>
                  </div>
                )}
                {transferContent && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-stone-400 text-xs uppercase tracking-wider font-medium">Nội dung CK</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-stone-900 bg-amber-50 px-3 py-1 border border-amber-100">
                        {transferContent}
                      </span>
                      <button
                        onClick={() => handleCopy(transferContent, "content")}
                        className="text-[#C8A97E] hover:text-[#b5956a] transition-colors"
                        title="Sao chép"
                      >
                        <span className="material-symbols-outlined text-sm">
                          {copied === "content" ? "check" : "content_copy"}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* QR Code */}
              {qrUrl && !qrError ? (
                <div className="flex flex-col items-center">
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold mb-4">
                    Quét mã QR để thanh toán
                  </p>
                  <div className="relative">
                    {!qrLoaded && (
                      <div className="w-64 h-64 bg-stone-50 border border-stone-200 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full border-2 border-[#C8A97E]/30 border-t-[#C8A97E] animate-spin"></div>
                      </div>
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrUrl}
                      alt="VietQR Payment QR Code"
                      className={`w-64 h-auto border border-stone-200 ${qrLoaded ? "block" : "hidden"}`}
                      onLoad={() => setQrLoaded(true)}
                      onError={() => setQrError(true)}
                    />
                  </div>
                  <p className="text-[11px] text-stone-400 mt-4 text-center max-w-xs leading-relaxed">
                    Mở ứng dụng ngân hàng → Quét mã QR → Kiểm tra thông tin → Xác nhận thanh toán
                  </p>
                </div>
              ) : (
                <div className="text-center py-6 bg-stone-50 border border-stone-200">
                  <span className="material-symbols-outlined text-stone-400 text-4xl mb-2">qr_code</span>
                  <p className="text-stone-500 text-sm">
                    Vui lòng chuyển khoản theo thông tin trên
                  </p>
                </div>
              )}

              {/* Warning */}
              <div className="mt-6 p-4 bg-amber-50 border border-amber-100 text-sm text-amber-800 leading-relaxed">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-base mt-0.5">warning</span>
                  <div>
                    <p className="font-semibold mb-1">Lưu ý quan trọng:</p>
                    <ul className="text-xs space-y-1 text-amber-700">
                      <li>• Nhập <strong>đúng nội dung chuyển khoản</strong> để dễ đối soát</li>
                      <li>• Booking sẽ được xác nhận sau khi admin kiểm tra giao dịch</li>
                      <li>• Thời gian xử lý: <strong>trong vòng 24 giờ làm việc</strong></li>
                      <li>• Liên hệ hotline nếu cần hỗ trợ gấp</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {code && (
            <Link
              href={`/booking-lookup?code=${code}`}
              className="flex-1 flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-[#333] text-white px-6 py-3 text-xs font-medium uppercase tracking-widest transition-all"
            >
              <span className="material-symbols-outlined text-base">search</span>
              Tra cứu đặt phòng
            </Link>
          )}
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 bg-[#C8A97E] hover:bg-[#b5956a] text-white px-6 py-3 text-xs font-medium uppercase tracking-widest transition-all"
          >
            <span className="material-symbols-outlined text-base">home</span>
            Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <div className="w-10 h-10 rounded-full border-2 border-[#C8A97E]/30 border-t-[#C8A97E] animate-spin mx-auto"></div>
        </div>
      }
    >
      <BookingSuccessContent />
    </Suspense>
  );
}
