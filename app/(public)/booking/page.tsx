"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { roomService } from "@/services/room.service";
import { bookingService } from "@/services/booking.service";
import { RoomCategory } from "@/types/room";
import { toast } from "react-hot-toast";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";

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

const SERIF = { fontFamily: "var(--font-cormorant), Georgia, serif" };

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get('roomId');

  const { customer } = useCustomerAuth();

  // Temporary debug logs
  console.log('customer_info', typeof window !== 'undefined' ? localStorage.getItem('customer_info') : null);
  console.log('customer_access_token', typeof window !== 'undefined' ? localStorage.getItem('customer_access_token') : null);
  console.log('auth customer', customer);

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

  // Auto-populate customer profile when logged in
  useEffect(() => {
    if (customer) {
      setFormData(prev => ({
        ...prev,
        fullName: customer.fullName || prev.fullName,
        email: customer.email || prev.email,
        phone: customer.phone || prev.phone,
      }));
    }
  }, [customer]);

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [nights, setNights] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Availability states
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityData, setAvailabilityData] = useState<{
    available: boolean;
    availableRoomCount: number;
  } | null>(null);

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

  // Check availability on checkIn/checkOut/guests change
  useEffect(() => {
    let active = true;

    async function checkRoomAvailability() {
      if (!roomId || !formData.checkIn || !formData.checkOut) {
        setAvailabilityData(null);
        return;
      }

      const [inYear, inMonth, inDay] = formData.checkIn.split('-').map(Number);
      const [outYear, outMonth, outDay] = formData.checkOut.split('-').map(Number);
      const checkInDate = new Date(inYear, inMonth - 1, inDay);
      const checkOutDate = new Date(outYear, outMonth - 1, outDay);

      if (checkOutDate <= checkInDate) {
        setAvailabilityData(null);
        return;
      }

      setIsCheckingAvailability(true);
      try {
        const guestCount = parseInt(formData.guests, 10);
        const res = await bookingService.checkAvailability({
          categoryId: roomId,
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
          guestCount: isNaN(guestCount) ? 1 : guestCount,
        });

        if (active && res.success && res.data) {
          setAvailabilityData({
            available: res.data.available,
            availableRoomCount: res.data.availableRoomCount,
          });
        } else if (active) {
          setAvailabilityData(null);
        }
      } catch (error) {
        console.error("Lỗi check availability:", error);
        if (active) {
          setAvailabilityData(null);
        }
      } finally {
        if (active) {
          setIsCheckingAvailability(false);
        }
      }
    }

    checkRoomAvailability();

    return () => {
      active = false;
    };
  }, [formData.checkIn, formData.checkOut, formData.guests, roomId]);

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

  // Voucher states
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<any | null>(null);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);

  // Reset voucher khi số đêm hoặc thông tin khách hàng đổi
  useEffect(() => {
    setAppliedVoucher(null);
  }, [nights, formData.email]);

  const handleApplyVoucher = async () => {
    if (!voucherCodeInput.trim()) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }
    if (!roomData || nights === 0) {
      toast.error("Vui lòng chọn ngày nhận/trả phòng trước khi áp dụng voucher");
      return;
    }

    setIsValidatingVoucher(true);
    try {
      const basePrice = roomData.base_price || 0;
      const totalAmount = nights * basePrice;
      const guestEmail = formData.email;
      const customerId = customer?.id || undefined;

      const result = await bookingService.validateVoucher(
        voucherCodeInput.toUpperCase().trim(),
        totalAmount,
        customerId,
        guestEmail || undefined
      );

      if (result.valid) {
        setAppliedVoucher({
          code: result.code,
          discountAmount: Number(result.discountAmount),
          finalAmount: Number(result.finalAmount),
        });
        toast.success("Áp dụng mã giảm giá thành công!");
      } else {
        setAppliedVoucher(null);
        toast.error(result.message || "Mã giảm giá không hợp lệ hoặc không đủ điều kiện");
      }
    } catch (err: any) {
      setAppliedVoucher(null);
      toast.error(err.message || "Lỗi khi kiểm tra mã giảm giá");
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || !roomData || !roomId) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      let pm = formData.paymentMethod;
      if (pm === 'PAY_AT_HOTEL') pm = 'CASH';
      if (pm === 'E_WALLET') pm = 'EWALLET';

      const result = await bookingService.createBooking({
        customer_name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        note: formData.notes,
        room_category_id: roomId,
        check_in_date: formData.checkIn,
        check_out_date: formData.checkOut,
        guest_count: parseInt(formData.guests),
        payment_method: pm,
        voucherCode: appliedVoucher ? appliedVoucher.code : undefined,
        ...(customer?.id ? { customerId: customer.id } : {}),
      });

      if (result && result.error) {
        setFormError(result.message);
        toast.error(result.message);
        return;
      }

      const response = { data: result };
      const bookingData = response?.data?.data;

      if (!bookingData?.booking_code) {
         throw new Error('Invalid booking response');
      }

      router.push(
        `/booking-success?code=${bookingData.booking_code}`
      );
    } catch (err: any) {
      console.error("Booking error:", err);
      setFormError(err.message || 'Đã xảy ra lỗi khi đặt phòng. Vui lòng thử lại.');
      toast.error(err.message || 'Đã xảy ra lỗi khi đặt phòng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  if (isLoadingRoom) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 rounded-full border-2 border-[#C8A97E]/30 border-t-[#C8A97E] animate-spin mx-auto mb-4"></div>
        <p className="text-stone-500 font-light tracking-widest text-xs uppercase">Đang tải thông tin phòng...</p>
      </div>
    );
  }

  if (roomError || !roomData) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 text-center">
        <div className="bg-white p-8 border border-stone-200 max-w-xl mx-auto shadow-sm">
          <span className="material-symbols-outlined text-[#C8A97E] text-5xl mb-4">error</span>
          <h2 className="text-xl font-light text-stone-900 mb-2" style={SERIF}>Không thể đặt phòng</h2>
          <p className="text-stone-500 text-sm mb-6">{roomError}</p>
          <Link href="/rooms" className="bg-[#C8A97E] hover:bg-[#b5956a] text-white px-6 py-3 text-xs uppercase tracking-widest transition-all">
            Xem danh sách phòng
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = imgError ? null : buildImageUrl(roomData.thumbnail_url);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-xs uppercase tracking-wider text-stone-400 font-medium">
        <Link href="/" className="hover:text-[#C8A97E] transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-base">home</span>
          Trang chủ
        </Link>
        <span className="material-symbols-outlined text-sm opacity-50">chevron_right</span>
        <Link href="/rooms" className="hover:text-[#C8A97E] transition-colors">
          Phòng nghỉ
        </Link>
        <span className="material-symbols-outlined text-sm opacity-50">chevron_right</span>
        <span className="text-[#C8A97E] font-semibold">Đặt phòng</span>
      </nav>

      <div className="mb-12 border-b border-stone-200/60 pb-6">
        <span className="text-[10px] uppercase tracking-[0.35em] text-[#C8A97E] font-medium block mb-2">
          Đăng ký phòng
        </span>
        <h1 className="text-4xl font-light text-stone-900 tracking-tight" style={SERIF}>
          Xác nhận đặt phòng
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left Column: Form Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Personal Info Card */}
          <div className="bg-white border border-stone-100 p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#C8A97E] text-xl">person</span>
                <h2 className="text-lg font-light text-stone-900 uppercase tracking-widest">Thông tin liên hệ</h2>
              </div>
              {customer && (
                <div className="text-[9px] uppercase tracking-widest text-[#C8A97E] font-bold bg-[#C8A97E]/10 px-3 py-1 flex items-center gap-1.5 self-start sm:self-auto">
                  <span className="material-symbols-outlined text-xs">verified</span>
                  Tài khoản đã xác thực
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C8A97E]">Họ và tên *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  readOnly={!!customer}
                  placeholder="VD: Nguyễn Văn A"
                  className={`w-full bg-[#F8F6F3] border border-stone-200 py-3 px-4 text-sm focus:border-[#C8A97E]/60 focus:ring-0 focus:outline-none transition-colors ${errors.fullName ? 'border-red-400' : ''} ${customer ? 'opacity-70 cursor-not-allowed' : ''}`}
                />
                {errors.fullName && <p className="text-red-500 text-xs font-medium mt-1">{errors.fullName}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C8A97E]">Số điện thoại *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  readOnly={!!customer}
                  placeholder="VD: 0901234567"
                  className={`w-full bg-[#F8F6F3] border border-stone-200 py-3 px-4 text-sm focus:border-[#C8A97E]/60 focus:ring-0 focus:outline-none transition-colors ${errors.phone ? 'border-red-400' : ''} ${customer ? 'opacity-70 cursor-not-allowed' : ''}`}
                />
                {errors.phone && <p className="text-red-500 text-xs font-medium mt-1">{errors.phone}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C8A97E]">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  readOnly={!!customer}
                  placeholder="VD: email@example.com"
                  className={`w-full bg-[#F8F6F3] border border-stone-200 py-3 px-4 text-sm focus:border-[#C8A97E]/60 focus:ring-0 focus:outline-none transition-colors ${errors.email ? 'border-red-400' : ''} ${customer ? 'opacity-70 cursor-not-allowed' : ''}`}
                />
                {errors.email && <p className="text-red-500 text-xs font-medium mt-1">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* Booking Details Card */}
          <div className="bg-white border border-stone-100 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-stone-100">
              <span className="material-symbols-outlined text-[#C8A97E] text-xl">calendar_month</span>
              <h2 className="text-lg font-light text-stone-900 uppercase tracking-widest">Chi tiết lịch trình</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C8A97E]">Ngày nhận phòng *</label>
                <input
                  type="date"
                  name="checkIn"
                  min={getTodayStr()}
                  value={formData.checkIn}
                  onChange={handleChange}
                  className={`w-full bg-[#F8F6F3] border border-stone-200 py-3 px-4 text-sm focus:border-[#C8A97E]/60 focus:ring-0 focus:outline-none transition-colors ${errors.checkIn ? 'border-red-400' : ''}`}
                />
                {errors.checkIn && <p className="text-red-500 text-xs font-medium mt-1">{errors.checkIn}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C8A97E]">Ngày trả phòng *</label>
                <input
                  type="date"
                  name="checkOut"
                  min={getMinCheckOut()}
                  value={formData.checkOut}
                  onChange={handleChange}
                  className={`w-full bg-[#F8F6F3] border border-stone-200 py-3 px-4 text-sm focus:border-[#C8A97E]/60 focus:ring-0 focus:outline-none transition-colors ${errors.checkOut ? 'border-red-400' : ''}`}
                />
                {errors.checkOut && <p className="text-red-500 text-xs font-medium mt-1">{errors.checkOut}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C8A97E]">
                  Số lượng khách * {roomData ? `(Tối đa ${roomData.capacity} khách)` : ''}
                </label>
                <select
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                  disabled={!roomData}
                  className="w-full bg-[#F8F6F3] border border-stone-200 py-3 px-4 text-sm focus:border-[#C8A97E]/60 focus:ring-0 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

              <div className="space-y-2 md:col-span-2">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C8A97E]">Yêu cầu thêm (Tùy chọn)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Yêu cầu giường phụ, phòng tầm cao, v.v..."
                  rows={3}
                  className="w-full bg-[#F8F6F3] border border-stone-200 py-3 px-4 text-sm focus:border-[#C8A97E]/60 focus:ring-0 focus:outline-none resize-none transition-colors"
                ></textarea>
              </div>

              {/* Availability Status */}
              {formData.checkIn && formData.checkOut && !errors.checkOut && (
                <div className="md:col-span-2 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-stone-400 font-semibold">Tình trạng phòng</span>
                  {isCheckingAvailability ? (
                    <span className="flex items-center gap-1.5 text-xs text-stone-500">
                      <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                      Đang kiểm tra phòng trống...
                    </span>
                  ) : availabilityData ? (
                    availabilityData.available ? (
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Còn phòng trống ({availabilityData.availableRoomCount} phòng khả dụng)
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">cancel</span>
                        Đã hết phòng trong khoảng thời gian này
                      </span>
                    )
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white border border-stone-100 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-stone-100">
              <span className="material-symbols-outlined text-[#C8A97E] text-xl">payments</span>
              <h2 className="text-lg font-light text-stone-900 uppercase tracking-widest">Phương thức thanh toán</h2>
            </div>

            <div className="space-y-4">
              <label className={`flex items-start gap-4 p-5 border cursor-pointer transition-all ${formData.paymentMethod === 'PAY_AT_HOTEL' ? 'border-[#C8A97E] bg-[#C8A97E]/5' : 'border-stone-250 hover:bg-stone-50'}`}>
                <div className="pt-1">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.paymentMethod === 'PAY_AT_HOTEL' ? 'border-[#C8A97E]' : 'border-stone-300'}`}>
                    {formData.paymentMethod === 'PAY_AT_HOTEL' && <div className="w-2.5 h-2.5 rounded-full bg-[#C8A97E]"></div>}
                  </div>
                </div>
                <input type="radio" name="paymentMethod" value="PAY_AT_HOTEL" checked={formData.paymentMethod === 'PAY_AT_HOTEL'} onChange={handleChange} className="sr-only" />
                <div>
                  <div className="font-semibold text-stone-800 text-sm">Thanh toán khi nhận phòng</div>
                  <div className="text-xs text-stone-500 mt-1">Thanh toán bằng tiền mặt hoặc thẻ tại quầy lễ tân</div>
                </div>
              </label>

              <label className={`flex items-start gap-4 p-5 border cursor-pointer transition-all ${formData.paymentMethod === 'BANK_TRANSFER' ? 'border-[#C8A97E] bg-[#C8A97E]/5' : 'border-stone-250 hover:bg-stone-50'}`}>
                <div className="pt-1">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.paymentMethod === 'BANK_TRANSFER' ? 'border-[#C8A97E]' : 'border-stone-300'}`}>
                    {formData.paymentMethod === 'BANK_TRANSFER' && <div className="w-2.5 h-2.5 rounded-full bg-[#C8A97E]"></div>}
                  </div>
                </div>
                <input type="radio" name="paymentMethod" value="BANK_TRANSFER" checked={formData.paymentMethod === 'BANK_TRANSFER'} onChange={handleChange} className="sr-only" />
                <div>
                  <div className="font-semibold text-stone-800 text-sm">Chuyển khoản ngân hàng</div>
                  <div className="text-xs text-stone-500 mt-1">Quét mã QR qua ứng dụng Internet Banking</div>
                </div>
              </label>

              <label className={`flex items-start gap-4 p-5 border cursor-pointer transition-all ${formData.paymentMethod === 'E_WALLET' ? 'border-[#C8A97E] bg-[#C8A97E]/5' : 'border-stone-250 hover:bg-stone-50'}`}>
                <div className="pt-1">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.paymentMethod === 'E_WALLET' ? 'border-[#C8A97E]' : 'border-stone-300'}`}>
                    {formData.paymentMethod === 'E_WALLET' && <div className="w-2.5 h-2.5 rounded-full bg-[#C8A97E]"></div>}
                  </div>
                </div>
                <input type="radio" name="paymentMethod" value="E_WALLET" checked={formData.paymentMethod === 'E_WALLET'} onChange={handleChange} className="sr-only" />
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-stone-800 text-sm">Ví điện tử</div>
                    <div className="text-xs text-stone-500 mt-1">Thanh toán qua Momo, ZaloPay, VNPay</div>
                  </div>
                </div>
              </label>
            </div>
            {errors.paymentMethod && <p className="text-red-500 text-xs font-medium mt-3 px-2">{errors.paymentMethod}</p>}
          </div>

        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-stone-100 overflow-hidden sticky top-32">
            <div className="p-6 bg-[#1A1A1A] text-center">
              <h3 className="font-medium text-xs text-white uppercase tracking-[0.2em]" style={SERIF}>Tóm tắt kỳ nghỉ</h3>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex gap-4">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt={roomData.name}
                    className="w-20 h-16 object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-20 h-16 bg-stone-100 flex flex-col items-center justify-center text-stone-400">
                    <span className="material-symbols-outlined text-xl">hotel</span>
                  </div>
                )}
                
                <div className="flex-1">
                  <h4 className="font-light text-stone-900 leading-tight mb-2 line-clamp-2" style={SERIF}>{roomData.name}</h4>
                  
                  <div className="flex flex-col gap-1 text-[10px] text-stone-400 uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs text-[#C8A97E]">group</span>
                      <span>Sức chứa: {roomData.capacity}</span>
                    </div>
                  </div>
                </div>
              </div>

              {roomData.description && (
                <div className="text-xs text-stone-500 line-clamp-2 italic leading-relaxed border-t border-stone-50 pt-3">
                  &quot;{roomData.description}&quot;
                </div>
              )}

              <div className="border-t border-b border-stone-100 py-4 space-y-3">
                <div className="flex justify-between items-center text-xs uppercase tracking-wider">
                  <span className="text-stone-400">Đơn giá</span>
                  <span className="font-semibold text-stone-800">{formatCurrency(roomData.base_price)}</span>
                </div>
                <div className="flex justify-between items-center text-xs uppercase tracking-wider">
                  <span className="text-stone-400">Số đêm</span>
                  <span className="font-semibold text-stone-800">{nights} đêm</span>
                </div>
                <div className="flex justify-between items-center text-xs uppercase tracking-wider">
                  <span className="text-stone-400">Thuế phí</span>
                  <span className="font-medium text-[#C8A97E]">Đã bao gồm</span>
                </div>
              </div>

              {/* Voucher Section */}
              <div className="border-t border-stone-100 pt-4 space-y-2.5">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C8A97E]">Mã khuyến mãi</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="NHẬP MÃ GIẢM GIÁ"
                    value={voucherCodeInput}
                    onChange={(e) => setVoucherCodeInput(e.target.value)}
                    className="flex-1 bg-[#F8F6F3] border border-stone-200 py-2 px-3 text-xs focus:border-[#C8A97E]/60 focus:ring-0 focus:outline-none uppercase font-bold tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={handleApplyVoucher}
                    disabled={isValidatingVoucher || !voucherCodeInput.trim() || nights === 0}
                    className="bg-[#1A1A1A] hover:bg-[#333] text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
                  >
                    {isValidatingVoucher ? "..." : "Áp dụng"}
                  </button>
                </div>
                {appliedVoucher && (
                  <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 p-2.5 border border-emerald-100 font-medium">
                    <span>Áp dụng thành công: <strong className="text-emerald-700">{appliedVoucher.code}</strong></span>
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedVoucher(null);
                        setVoucherCodeInput("");
                      }}
                      className="text-emerald-700 hover:text-emerald-900 font-bold ml-2"
                    >
                      Bỏ áp dụng
                    </button>
                  </div>
                )}
              </div>

              {appliedVoucher ? (
                <div className="border-t border-stone-100 pt-4 space-y-3">
                  <div className="flex justify-between items-center text-xs uppercase tracking-wider">
                    <span className="text-stone-400">Tạm tính</span>
                    <span className="font-semibold text-stone-800">{formatCurrency(nights * roomData.base_price)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs uppercase tracking-wider">
                    <span className="text-stone-400">Giảm giá</span>
                    <span className="font-bold text-emerald-600">-{formatCurrency(appliedVoucher.discountAmount)}</span>
                  </div>
                  <div className="flex justify-between items-end pb-2 border-t border-stone-50 pt-3">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">Tổng thanh toán</span>
                    <span className="text-2xl font-semibold text-[#C8A97E]">{formatCurrency(appliedVoucher.finalAmount)}</span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-end pb-2 border-t border-stone-100 pt-4">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">Tổng tiền</span>
                  <span className="text-2xl font-semibold text-[#C8A97E]">{formatCurrency(nights * roomData.base_price)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-stone-50">
                <label className="flex items-start gap-3 cursor-pointer p-1">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="mt-1 flex-shrink-0 w-3.5 h-3.5 accent-[#C8A97E] rounded-none border-stone-300"
                  />
                  <span className="text-[11px] text-stone-500 leading-relaxed">
                    Tôi đồng ý với các <a href="#" className="text-[#C8A97E] hover:underline font-semibold">điều khoản &amp; quy định</a> của khách sạn.
                  </span>
                </label>
                {errors.agreeTerms && <p className="text-red-500 text-xs font-medium mt-1 pl-2">{errors.agreeTerms}</p>}
              </div>

              {formError && (
                <div className="bg-red-50 text-red-500 p-3 rounded-none text-xs border border-red-100 flex items-start gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  <span>{formError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  nights === 0 ||
                  !!errors.checkOut ||
                  !!errors.checkIn ||
                  (availabilityData !== null && !availabilityData.available)
                }
                className="w-full bg-[#C8A97E] hover:bg-[#b5956a] text-white h-12 text-xs font-medium uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                    Đang đặt...
                  </span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">lock</span>
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
        <div className="w-10 h-10 rounded-full border-2 border-[#C8A97E]/30 border-t-[#C8A97E] animate-spin mx-auto"></div>
        <p className="mt-4 text-stone-400 text-xs uppercase tracking-widest">Đang tải...</p>
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
