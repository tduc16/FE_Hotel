"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Types
interface BookingData {
  fullName: string;
  phone: string;
  email: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  notes: string;
  paymentMethod: string;
  agreeTerms: boolean;
}

interface ValidationErrors {
  [key: string]: string;
}

const PRICE_PER_NIGHT = 850000;

export default function BookingPage() {
  const router = useRouter();

  // State
  const [formData, setFormData] = useState<BookingData>({
    fullName: "",
    phone: "",
    email: "",
    checkIn: "",
    checkOut: "",
    guests: "2 Người lớn",
    notes: "",
    paymentMethod: "",
    agreeTerms: false,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [nights, setNights] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Calculate nights
  useEffect(() => {
    if (formData.checkIn && formData.checkOut) {
      const start = new Date(formData.checkIn);
      const end = new Date(formData.checkOut);
      const diffTime = Math.max(0, end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setNights(diffDays);
    } else {
      setNights(0);
    }
  }, [formData.checkIn, formData.checkOut]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Vui lòng nhập họ và tên";
    if (!formData.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.checkIn) {
      newErrors.checkIn = "Vui lòng chọn ngày nhận phòng";
    }
    if (!formData.checkOut) {
      newErrors.checkOut = "Vui lòng chọn ngày trả phòng";
    } else if (formData.checkIn && new Date(formData.checkOut) <= new Date(formData.checkIn)) {
      newErrors.checkOut = "Ngày trả phòng phải sau ngày nhận phòng";
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Vui lòng chọn phương thức thanh toán";
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "Bạn phải đồng ý với điều khoản đặt phòng";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      // Scroll to top or show error validation globally
      return;
    }

    setIsSubmitting(true);

    // Mock API call
    console.log("Submitting booking data:", { ...formData, totalAmount: nights * PRICE_PER_NIGHT });

    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitSuccess(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  if (submitSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="bg-surface-container-lowest rounded-2xl shadow-xl p-12 border border-outline-variant/10">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-primary text-4xl">check_circle</span>
          </div>
          <h1 className="text-3xl font-extrabold text-on-surface mb-4">Đặt phòng thành công!</h1>
          <p className="text-on-surface-variant mb-8 text-lg">Cảm ơn {formData.fullName}. Chúng tôi đã nhận được yêu cầu đặt phòng của bạn và sẽ gửi SMS / Email xác nhận trong thời gian sớm nhất.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-primary-container flex items-center justify-center gap-2 mx-auto text-on-primary-container px-8 py-3 rounded-lg font-bold hover:bg-primary hover:text-on-primary transition-all shadow-sm active:scale-95"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-on-surface-variant font-medium">
        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-lg">home</span>
          Trang chủ
        </Link>
        <span className="material-symbols-outlined text-sm opacity-50">chevron_right</span>
        <span className="text-primary font-bold">Đặt phòng</span>
      </nav>

      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-on-surface mb-3 tracking-tight">Xác nhận đặt phòng</h1>
        <p className="text-on-surface-variant text-lg">Vui lòng điền thông tin bên dưới để hoàn tất việc đặt phòng của bạn.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* Left Column: Form Info */}
        <div className="lg:col-span-2 space-y-8">

          {/* Personal Info Card */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-surface-container-high">
              <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full">person</span>
              <h2 className="text-xl font-bold text-on-surface">Thông tin người đặt</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Họ và tên *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="VD: Nguyễn Văn A"
                  className={`w-full bg-surface-container-highest border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none transition-shadow ${errors.fullName ? 'ring-2 ring-error/50 bg-error-container/20' : ''}`}
                />
                {errors.fullName && <p className="text-error text-xs font-medium mt-1">{errors.fullName}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Số điện thoại *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="VD: 0901234567"
                  className={`w-full bg-surface-container-highest border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none transition-shadow ${errors.phone ? 'ring-2 ring-error/50 bg-error-container/20' : ''}`}
                />
                {errors.phone && <p className="text-error text-xs font-medium mt-1">{errors.phone}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="VD: email@example.com"
                  className={`w-full bg-surface-container-highest border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none transition-shadow ${errors.email ? 'ring-2 ring-error/50 bg-error-container/20' : ''}`}
                />
                {errors.email && <p className="text-error text-xs font-medium mt-1">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* Booking Details Card */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-surface-container-high">
              <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full">calendar_month</span>
              <h2 className="text-xl font-bold text-on-surface">Chi tiết lưu trú</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Ngày nhận phòng *</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary">calendar_today</span>
                  <input
                    type="date"
                    name="checkIn"
                    value={formData.checkIn}
                    onChange={handleChange}
                    className={`w-full bg-surface-container-highest border-none rounded-lg py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none transition-shadow ${errors.checkIn ? 'ring-2 ring-error/50 bg-error-container/20' : ''}`}
                  />
                </div>
                {errors.checkIn && <p className="text-error text-xs font-medium mt-1">{errors.checkIn}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Ngày trả phòng *</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary">calendar_today</span>
                  <input
                    type="date"
                    name="checkOut"
                    value={formData.checkOut}
                    onChange={handleChange}
                    className={`w-full bg-surface-container-highest border-none rounded-lg py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none transition-shadow ${errors.checkOut ? 'ring-2 ring-error/50 bg-error-container/20' : ''}`}
                  />
                </div>
                {errors.checkOut && <p className="text-error text-xs font-medium mt-1">{errors.checkOut}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Số lượng khách *</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary">group</span>
                  <select
                    name="guests"
                    value={formData.guests}
                    onChange={handleChange}
                    className="w-full bg-surface-container-highest border-none rounded-lg py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none appearance-none"
                  >
                    <option value="1 Người lớn">1 Người lớn</option>
                    <option value="2 Người lớn">2 Người lớn</option>
                    <option value="2 Người lớn, 1 Trẻ em">2 Người lớn, 1 Trẻ em</option>
                    <option value="3 Người lớn">3 Người lớn</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Ghi chú thêm (Tùy chọn)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Yêu cầu giường phụ, phòng tầm cao, v.v..."
                  rows={3}
                  className="w-full bg-surface-container-highest border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-surface-container-high">
              <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full">payments</span>
              <h2 className="text-xl font-bold text-on-surface">Phương thức thanh toán</h2>
            </div>

            <div className="space-y-4">
              <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${formData.paymentMethod === 'PAY_AT_HOTEL' ? 'border-primary bg-primary-fixed/20 ring-1 ring-primary' : 'border-outline-variant/30 hover:bg-surface-container-low'}`}>
                <div className="pt-1">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.paymentMethod === 'PAY_AT_HOTEL' ? 'border-primary' : 'border-outline-variant'}`}>
                    {formData.paymentMethod === 'PAY_AT_HOTEL' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                  </div>
                </div>
                <input type="radio" name="paymentMethod" value="PAY_AT_HOTEL" checked={formData.paymentMethod === 'PAY_AT_HOTEL'} onChange={handleChange} className="sr-only" />
                <div>
                  <div className="font-bold text-on-surface">Thanh toán khi nhận phòng</div>
                  <div className="text-sm text-on-surface-variant mt-1">Thanh toán bằng tiền mặt hoặc thẻ tại quầy lễ tân</div>
                </div>
              </label>

              <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${formData.paymentMethod === 'BANK_TRANSFER' ? 'border-primary bg-primary-fixed/20 ring-1 ring-primary' : 'border-outline-variant/30 hover:bg-surface-container-low'}`}>
                <div className="pt-1">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.paymentMethod === 'BANK_TRANSFER' ? 'border-primary' : 'border-outline-variant'}`}>
                    {formData.paymentMethod === 'BANK_TRANSFER' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                  </div>
                </div>
                <input type="radio" name="paymentMethod" value="BANK_TRANSFER" checked={formData.paymentMethod === 'BANK_TRANSFER'} onChange={handleChange} className="sr-only" />
                <div>
                  <div className="font-bold text-on-surface">Chuyển khoản ngân hàng</div>
                  <div className="text-sm text-on-surface-variant mt-1">Quét mã QR qua ứng dụng Internet Banking</div>
                </div>
              </label>

              <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${formData.paymentMethod === 'E_WALLET' ? 'border-primary bg-primary-fixed/20 ring-1 ring-primary' : 'border-outline-variant/30 hover:bg-surface-container-low'}`}>
                <div className="pt-1">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.paymentMethod === 'E_WALLET' ? 'border-primary' : 'border-outline-variant'}`}>
                    {formData.paymentMethod === 'E_WALLET' && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                  </div>
                </div>
                <input type="radio" name="paymentMethod" value="E_WALLET" checked={formData.paymentMethod === 'E_WALLET'} onChange={handleChange} className="sr-only" />
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-on-surface">Ví điện tử</div>
                    <div className="text-sm text-on-surface-variant mt-1">Thanh toán qua Momo, ZaloPay, VNPay</div>
                  </div>
                  <div className="flex gap-2">
                    <span className="material-symbols-outlined text-3xl opacity-80 text-primary">account_balance_wallet</span>
                  </div>
                </div>
              </label>
            </div>
            {errors.paymentMethod && <p className="text-error text-xs font-medium mt-3 px-2">{errors.paymentMethod}</p>}
          </div>

        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/10 overflow-hidden sticky top-32">
            <div className="p-6 bg-surface-container-low border-b border-surface-container-high text-center">
              <h3 className="font-extrabold text-lg text-on-surface uppercase tracking-widest">Tóm tắt đơn đặt phòng</h3>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex gap-4">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCgw_wx3Od5qx3EkdenXGiDZ0zDBHeRi0FseJsUTrkFA-DZ2C2Miw5puLw3fcSB2W1ouErnRqSovR1I2u7tKA8ONbC9HprTw0Ii83jUxsR73vKYHqLlGanezsIeH9n0Ze7xxTEFL9RUwP0h0XRS2E1ncbSxTLRfX6Mwo5Bgaj6Yaf5Jqk0cX2MHjONUhv4A249DMNIhdSHYAP7L8Z1wo9udcdAhjWJnF3xiUt-0OGXCaC5mZS9XxiqvcDrc-laJP6zdsIj0iloCpiT" alt="Room" className="w-20 h-20 object-cover rounded-lg" />
                <div>
                  <h4 className="font-bold text-on-surface leading-tight mb-2">Phòng Deluxe Giường Đôi Hướng Phố</h4>
                  <div className="flex items-center text-xs text-on-surface-variant gap-1">
                    <span className="material-symbols-outlined text-[16px] text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="font-bold text-on-surface">4.9/5</span>
                    <span>(Bao gồm bữa sáng)</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-b border-surface-container-highest py-4 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant font-medium">Giá mỗi đêm</span>
                  <span className="font-bold text-on-surface">{formatCurrency(PRICE_PER_NIGHT)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant font-medium">Số đêm lưu trú</span>
                  <span className="font-bold text-on-surface">{nights} đêm</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant font-medium">Thuế & Phí</span>
                  <span className="font-bold text-primary">Đã bao gồm</span>
                </div>
              </div>

              <div className="flex justify-between items-end pb-2">
                <div className="space-y-1">
                  <span className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Tổng cộng</span>
                </div>
                <span className="text-3xl font-extrabold text-primary">{formatCurrency(nights * PRICE_PER_NIGHT)}</span>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer p-2 rounded hover:bg-surface-container-low transition-colors">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className={`mt-1 flex-shrink-0 w-4 h-4 rounded text-primary focus:ring-primary/40 focus:ring-2 border-outline-variant ${errors.agreeTerms ? 'ring-2 ring-[var(--color-error)]' : ''}`}
                  />
                  <span className="text-sm text-on-surface-variant leading-relaxed">
                    Tôi đồng ý với các <a href="#" className="text-primary hover:underline font-bold">điều khoản & quy định</a> của khách sạn.
                  </span>
                </label>
                {errors.agreeTerms && <p className="text-error text-xs font-medium mt-1 pl-2">{errors.agreeTerms}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || nights === 0}
                className="w-full bg-primary-container text-on-primary-container h-14 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-container disabled:hover:text-on-primary-container disabled:active:scale-100"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                    Đang xử lý...
                  </span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xl">lock</span>
                    Xác nhận đặt phòng
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
