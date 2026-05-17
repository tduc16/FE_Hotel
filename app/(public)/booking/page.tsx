"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { roomService } from "@/services/room.service";
import { RoomCategory } from "@/types/room";

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

// BACKEND_URL để build URL ảnh
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api$/, '');

function buildImageUrl(thumbnailUrl: any): string | null {
  if (typeof thumbnailUrl !== 'string' || !thumbnailUrl || thumbnailUrl.trim() === '') return null;
  if (thumbnailUrl.startsWith('http://') || thumbnailUrl.startsWith('https://')) return thumbnailUrl;
  const path = thumbnailUrl.startsWith('/') ? thumbnailUrl : `/${thumbnailUrl}`;
  return `${BACKEND_URL}${path}`;
}

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get('roomId');

  // State for room data
  const [roomData, setRoomData] = useState<RoomCategory | null>(null);
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  // Form State
  const [formData, setFormData] = useState<BookingData>({
    fullName: "",
    phone: "",
    email: "",
    checkIn: "",
    checkOut: "",
    guests: "1",
    notes: "",
    paymentMethod: "",
    agreeTerms: false,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [nights, setNights] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch room data
  useEffect(() => {
    async function loadRoom() {
      if (!roomId) {
        setRoomError("Không tìm thấy thông tin phòng. Vui lòng quay lại danh sách phòng và chọn lại.");
        setIsLoadingRoom(false);
        return;
      }

      console.log("BOOKING ROOM ID:", roomId);

      try {
        const data = await roomService.getCategoryById(roomId);
        console.log("ROOM DETAIL:", data);
        setRoomData(data);
      } catch (error: any) {
        console.error("Failed to load room:", error);
        setRoomError("Không thể tải thông tin phòng hoặc phòng không tồn tại.");
      } finally {
        setIsLoadingRoom(false);
      }
    }

    loadRoom();
  }, [roomId]);

  // Calculate nights & validate dates
  useEffect(() => {
    let calculatedNights = 0;
    
    if (formData.checkIn && formData.checkOut) {
      // Phân tích cú pháp chuỗi ngày địa phương để tránh lỗi Timezone
      const [inYear, inMonth, inDay] = formData.checkIn.split('-').map(Number);
      const [outYear, outMonth, outDay] = formData.checkOut.split('-').map(Number);
      
      const checkInDate = new Date(inYear, inMonth - 1, inDay);
      const checkOutDate = new Date(outYear, outMonth - 1, outDay);
      
      if (checkOutDate <= checkInDate) {
        setErrors(prev => ({ ...prev, checkOut: "Ngày trả phòng phải sau ngày nhận phòng" }));
        calculatedNights = 0;
      } else {
        setErrors(prev => ({ ...prev, checkOut: "" }));
        const diffTime = checkOutDate.getTime() - checkInDate.getTime();
        calculatedNights = Math.round(diffTime / (1000 * 60 * 60 * 24));
      }
    } else {
      calculatedNights = 0;
    }

    setNights(calculatedNights);

    const basePrice = roomData?.base_price || 0;
    const totalPrice = calculatedNights * basePrice;

    console.log({
      checkinDate: formData.checkIn,
      checkoutDate: formData.checkOut,
      nights: calculatedNights,
      basePrice,
      totalPrice
    });
  }, [formData.checkIn, formData.checkOut, roomData?.base_price]);

  // Realtime validation & auto-reset for guests
  useEffect(() => {
    if (roomData && roomData.capacity) {
      const currentGuests = parseInt(formData.guests);
      if (isNaN(currentGuests) || currentGuests > roomData.capacity) {
        setFormData(prev => ({ ...prev, guests: roomData.capacity.toString() }));
      }
    }
  }, [roomData, formData.guests]);

  // Debug log
  console.log({
    roomCapacity: roomData?.capacity,
    guestCount: formData.guests
  });

  // Helper để lấy ngày hôm nay theo YYYY-MM-DD local
  const getTodayStr = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  const getMinCheckOut = () => {
    if (formData.checkIn) {
      const [y, m, d] = formData.checkIn.split('-').map(Number);
      const nextDay = new Date(y, m - 1, d + 1);
      const offset = nextDay.getTimezoneOffset();
      const localNextDay = new Date(nextDay.getTime() - (offset * 60 * 1000));
      return localNextDay.toISOString().split('T')[0];
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const offset = tomorrow.getTimezoneOffset();
    const localTomorrow = new Date(tomorrow.getTime() - (offset * 60 * 1000));
    return localTomorrow.toISOString().split('T')[0];
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

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
    } else if (formData.checkIn) {
      const [inYear, inMonth, inDay] = formData.checkIn.split('-').map(Number);
      const [outYear, outMonth, outDay] = formData.checkOut.split('-').map(Number);
      const checkInDate = new Date(inYear, inMonth - 1, inDay);
      const checkOutDate = new Date(outYear, outMonth - 1, outDay);
      if (checkOutDate <= checkInDate) {
        newErrors.checkOut = "Ngày trả phòng phải sau ngày nhận phòng";
      }
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

    if (!validate() || !roomData) return;

    setIsSubmitting(true);

    console.log("Submitting booking data:", { ...formData, roomId, totalAmount: nights * roomData.base_price });

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

  if (isLoadingRoom) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 text-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        <p className="mt-4 text-on-surface-variant">Đang tải thông tin phòng...</p>
      </div>
    );
  }

  if (roomError || !roomData) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 text-center">
        <div className="bg-error-container/20 p-8 rounded-2xl max-w-xl mx-auto border border-error/20">
          <span className="material-symbols-outlined text-error text-5xl mb-4">error</span>
          <h2 className="text-xl font-bold text-on-surface mb-2">Không thể đặt phòng</h2>
          <p className="text-on-surface-variant mb-6">{roomError}</p>
          <Link href="/rooms" className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:brightness-110 transition-all inline-block">
            Xem danh sách phòng
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = imgError ? null : buildImageUrl(roomData.thumbnail_url);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-on-surface-variant font-medium">
        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-lg">home</span>
          Trang chủ
        </Link>
        <span className="material-symbols-outlined text-sm opacity-50">chevron_right</span>
        <Link href="/rooms" className="hover:text-primary transition-colors">
          Phòng
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
                    min={getTodayStr()}
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
                    min={getMinCheckOut()}
                    value={formData.checkOut}
                    onChange={handleChange}
                    className={`w-full bg-surface-container-highest border-none rounded-lg py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none transition-shadow ${errors.checkOut ? 'ring-2 ring-error/50 bg-error-container/20' : ''}`}
                  />
                </div>
                {errors.checkOut && <p className="text-error text-xs font-medium mt-1">{errors.checkOut}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">
                  Số lượng khách * {roomData ? `(Tối đa ${roomData.capacity} khách)` : ''}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary">group</span>
                  <select
                    name="guests"
                    value={formData.guests}
                    onChange={handleChange}
                    disabled={!roomData}
                    className="w-full bg-surface-container-highest border-none rounded-lg py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {!roomData && (
                      <option value={formData.guests}>{formData.guests} Khách</option>
                    )}
                    {roomData && Array.from({ length: roomData.capacity }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num.toString()}>
                        {num} Khách
                      </option>
                    ))}
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
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt={roomData.name}
                    className="w-20 h-20 object-cover rounded-lg"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-20 h-20 bg-surface-container-high rounded-lg flex flex-col items-center justify-center text-on-surface-variant/50">
                    <span className="material-symbols-outlined">hotel</span>
                  </div>
                )}
                
                <div className="flex-1">
                  <h4 className="font-bold text-on-surface leading-tight mb-2 line-clamp-2">{roomData.name}</h4>
                  
                  <div className="flex flex-col gap-1 text-xs text-on-surface-variant">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">group</span>
                      <span>Tối đa {roomData.capacity} khách</span>
                    </div>
                    {Array.isArray(roomData.amenities) && roomData.amenities.length > 0 && (
                       <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        <span className="truncate w-[120px]">{roomData.amenities.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {roomData.description && (
                <div className="text-sm text-on-surface-variant line-clamp-2 italic">
                  &quot;{roomData.description}&quot;
                </div>
              )}

              <div className="border-t border-b border-surface-container-highest py-4 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant font-medium">Giá mỗi đêm</span>
                  <span className="font-bold text-on-surface">{formatCurrency(roomData.base_price)}</span>
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
                <span className="text-3xl font-extrabold text-primary">{formatCurrency(nights * roomData.base_price)}</span>
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
                disabled={isSubmitting || nights === 0 || !!errors.checkOut || !!errors.checkIn}
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

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="max-w-5xl mx-auto px-4 py-24 text-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        <p className="mt-4 text-on-surface-variant">Đang tải...</p>
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
