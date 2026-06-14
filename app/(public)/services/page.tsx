"use client";

import { useEffect, useState, useRef } from "react";
import hotelServiceApi from "@/services/hotel-service.service";
import { HotelService } from "@/types/services";
import Link from "next/link";

// Component Đếm số chuyển động (Animated Counter) khi cuộn tới
function AnimatedCounter({ value, duration = 1800, suffix = "" }: { value: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;
    let start = 0;
    const end = value;
    if (end === 0) return;
    const stepTime = 25;
    const steps = duration / stepTime;
    const increment = end / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [hasStarted, value, duration]);

  // Hỗ trợ hiển thị số thập phân nếu cần (ví dụ rating 4.9)
  if (value % 1 !== 0) {
    const displayVal = hasStarted ? (count === value ? value : (Math.round(count * 10) / 10).toFixed(1)) : "0";
    return <span ref={elementRef}>{displayVal}{suffix}</span>;
  }

  return <span ref={elementRef}>{count.toLocaleString()}{suffix}</span>;
}

export default function ServicesPage() {
  const [services, setServices] = useState<HotelService[]>([]);
  const [selectedService, setSelectedService] = useState<HotelService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State quản lý slide hiện tại ở Hero Section
  const [currentSlide, setCurrentSlide] = useState(0);
  // State quản lý mở/đóng Modal chi tiết
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await hotelServiceApi.getServices();
      setServices(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách dịch vụ:", err);
      setError("Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
  const buildImageUrl = (url: string | null) => {
    if (!url) return "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80"; // fallback cao cấp
    if (url.startsWith("http")) return url;
    return `${BACKEND_URL}${url.startsWith("/") ? url : "/" + url}`;
  };

  // Lọc danh sách dịch vụ đang hoạt động
  const activeServices = services.filter((s) => s.isActive);

  // Tự động xoay vòng slide Hero mỗi 5 giây
  useEffect(() => {
    if (activeServices.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeServices.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeServices.length]);

  // Section 2: FEATURED SERVICE (Tự động chọn dịch vụ đầu tiên đang hoạt động)
  const featuredService = activeServices[0] || services[0];

  const handleOpenModal = (service: HotelService) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        {/* Spinner hoàng gia tinh tế */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-[#c5a880]/20"></div>
          <div className="absolute inset-0 rounded-full border-2 border-t-[#c5a880] animate-spin"></div>
        </div>
        <p className="text-[#c5a880] font-serif-luxury tracking-widest text-sm uppercase animate-pulse mt-4">
          Hoàng Minh Resort &amp; Hotel
        </p>
        <p className="text-slate-400 text-xs tracking-wider">Đang khởi tạo không gian trải nghiệm...</p>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-100 min-h-screen pb-0 font-sans transition-colors duration-300">
      
      {/* SECTION 1 - HERO SLIDER */}
      <section className="relative h-[650px] md:h-[750px] w-full overflow-hidden flex items-center justify-center bg-black">
        {activeServices.length > 0 ? (
          activeServices.map((service, index) => {
            const isActive = index === currentSlide;
            return (
              <div
                key={service.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                {/* Background image với zoom animation chậm */}
                <img
                  alt={service.name}
                  className={`absolute inset-0 w-full h-full object-cover filter brightness-[0.5] transition-transform duration-[5000ms] ease-out ${
                    isActive ? "scale-105" : "scale-100"
                  }`}
                  src={buildImageUrl(service.imageUrl)}
                />
                {/* Lớp phủ gradient tạo cảm giác chiều sâu */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-stone-50 dark:to-stone-950"></div>
                
                {/* Nội dung slide */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                  <div
                    className={`max-w-4xl transition-all duration-1000 transform ${
                      isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                    }`}
                  >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[#c5a880] font-bold text-xs uppercase tracking-widest mb-6 border border-[#c5a880]/30">
                      Đặc Quyền Thượng Lưu
                    </span>
                    <h1 className="font-serif-luxury text-4xl md:text-7xl font-extralight text-white mb-6 tracking-wide leading-tight">
                      {service.name}
                    </h1>
                    <p className="font-body text-base md:text-xl text-stone-200/90 max-w-2xl mx-auto font-light leading-relaxed mb-8">
                      {service.shortDescription || "Trải nghiệm đặc quyền thượng lưu cùng các tiện ích đỉnh cao dành riêng cho kỳ nghỉ của bạn."}
                    </p>
                    <button
                      onClick={() => handleOpenModal(service)}
                      className="px-8 py-3.5 bg-[#c5a880] hover:bg-[#b89047] text-white font-medium text-xs tracking-widest uppercase transition-all duration-300 hover:shadow-lg hover:shadow-[#c5a880]/20 active:scale-95"
                    >
                      Khám phá chi tiết
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="relative z-10 text-center px-6 max-w-4xl">
            <h1 className="font-serif-luxury text-4xl md:text-6xl text-white mb-6">Dịch vụ Khách sạn</h1>
            <p className="text-slate-300">Không có dịch vụ nào đang hoạt động để hiển thị slide.</p>
          </div>
        )}

        {/* Slide Indicator dots */}
        {activeServices.length > 1 && (
          <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-3">
            {activeServices.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentSlide ? "w-8 bg-[#c5a880]" : "w-1.5 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Đi tới slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {error ? (
        <div className="max-w-xl mx-auto my-16 p-8 bg-red-50 dark:bg-red-950/10 text-red-600 dark:text-red-400 rounded-none border border-red-200/50 dark:border-red-900/20 text-center">
          <span className="material-symbols-outlined text-4xl block mb-2 text-red-500">warning</span>
          <p className="font-medium font-serif-luxury text-lg">{error}</p>
        </div>
      ) : services.length === 0 ? (
        <div className="max-w-xl mx-auto my-24 p-8 text-center text-stone-500">
          <span className="material-symbols-outlined text-5xl block mb-4 text-[#c5a880] opacity-70">room_service</span>
          <p className="font-serif-luxury text-xl mb-2">Không gian yên ả</p>
          <p className="text-sm">Hiện tại khách sạn chưa cập nhật dịch vụ hoạt động nào.</p>
        </div>
      ) : (
        <main className="w-full">
          
          {/* SECTION 2 - FEATURED SERVICE */}
          {featuredService && (
            <section className="py-24 max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <span className="text-xs uppercase tracking-widest font-semibold text-[#c5a880] block mb-2">
                  Trải Nghiệm Nổi Bật
                </span>
                <h2 className="font-serif-luxury text-3xl md:text-5xl font-light text-stone-900 dark:text-stone-55">
                  Điểm Nhấn Kỳ Nghỉ
                </h2>
                <div className="w-12 h-[1px] bg-[#c5a880] mx-auto mt-4"></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
                {/* Left: Large Image */}
                <div className="lg:col-span-7 group overflow-hidden relative shadow-xl dark:shadow-black/40">
                  <div className="aspect-[16/10] overflow-hidden relative bg-stone-200 dark:bg-stone-900">
                    <img
                      src={buildImageUrl(featuredService.imageUrl)}
                      alt={featuredService.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500"></div>
                  </div>
                  {/* Đường line trang trí góc */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-white/50"></div>
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-white/50"></div>
                </div>

                {/* Right: Info */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="bg-[#c5a880]/10 text-[#c5a880] p-2.5 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-xl">{featuredService.icon || "room_service"}</span>
                    </span>
                    <span className="text-[11px] uppercase tracking-widest font-semibold text-[#c5a880]">
                      Dịch vụ tinh tuyển
                    </span>
                  </div>

                  <h3 className="font-serif-luxury text-3xl md:text-4xl font-light tracking-wide text-stone-900 dark:text-stone-50 leading-tight">
                    {featuredService.name}
                  </h3>

                  <p className="text-stone-600 dark:text-stone-300 leading-relaxed text-sm font-light">
                    {featuredService.description || featuredService.shortDescription || "Cung cấp những dịch vụ đỉnh cao chuẩn mực quốc tế, mang lại trải nghiệm hoàn mỹ bậc nhất cho quý khách."}
                  </p>

                  <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-stone-200 dark:border-stone-800">
                    <div>
                      <span className="block text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wider font-semibold">Giờ phục vụ</span>
                      <span className="text-sm font-medium text-stone-800 dark:text-stone-200 flex items-center gap-1.5 mt-1">
                        <span className="material-symbols-outlined text-base text-[#c5a880]">schedule</span>
                        {featuredService.openTime && featuredService.closeTime
                          ? `${featuredService.openTime} - ${featuredService.closeTime}`
                          : "24/7"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wider font-semibold">Địa điểm</span>
                      <span className="text-sm font-medium text-stone-800 dark:text-stone-200 flex items-center gap-1.5 mt-1">
                        <span className="material-symbols-outlined text-base text-[#c5a880]">location_on</span>
                        {featuredService.location || "Nội khu resort"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => handleOpenModal(featuredService)}
                      className="px-7 py-3 bg-[#c5a880] hover:bg-[#b89047] text-white font-medium text-xs tracking-widest uppercase transition-all duration-300 hover:shadow-lg active:scale-95"
                    >
                      Khám phá dịch vụ
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* SECTION 3 - LUXURY STATISTICS */}
          <section className="relative py-20 bg-stone-900 text-white overflow-hidden">
            {/* Background Image overlay mờ */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-15 filter brightness-50"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1920&q=80')` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900/90 to-stone-950"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center">
                <div className="space-y-2">
                  <span className="material-symbols-outlined text-3xl text-[#c5a880] mb-2 block">room_service</span>
                  <div className="text-3xl md:text-4xl font-light font-serif-luxury tracking-wide">
                    <AnimatedCounter value={services.length} />
                  </div>
                  <p className="text-xs uppercase tracking-widest text-stone-400 font-light">Tiện ích đẳng cấp</p>
                </div>

                <div className="space-y-2 border-l border-white/10">
                  <span className="material-symbols-outlined text-3xl text-[#c5a880] mb-2 block">star</span>
                  <div className="text-3xl md:text-4xl font-light font-serif-luxury tracking-wide text-white">
                    <AnimatedCounter value={4.9} />
                    <span className="text-lg">/5</span>
                  </div>
                  <p className="text-xs uppercase tracking-widest text-stone-400 font-light">Đánh giá trung bình</p>
                </div>

                <div className="space-y-2 border-l border-white/10">
                  <span className="material-symbols-outlined text-3xl text-[#c5a880] mb-2 block">rate_review</span>
                  <div className="text-3xl md:text-4xl font-light font-serif-luxury tracking-wide">
                    <AnimatedCounter value={1850} suffix="+" />
                  </div>
                  <p className="text-xs uppercase tracking-widest text-stone-400 font-light">Đánh giá tích cực</p>
                </div>

                <div className="space-y-2 border-l border-white/10">
                  <span className="material-symbols-outlined text-3xl text-[#c5a880] mb-2 block">sentiment_satisfied</span>
                  <div className="text-3xl md:text-4xl font-light font-serif-luxury tracking-wide">
                    <AnimatedCounter value={99} suffix="%" />
                  </div>
                  <p className="text-xs uppercase tracking-widest text-stone-400 font-light">Khách hàng hài lòng</p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4 - SERVICE COLLECTION */}
          <section className="py-24 max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#c5a880] block mb-2">
                Bộ sưu tập trải nghiệm
              </span>
              <h2 className="font-serif-luxury text-3xl md:text-5xl font-light text-stone-900 dark:text-stone-50">
                Danh Mục Dịch Vụ
              </h2>
              <div className="w-12 h-[1px] bg-[#c5a880] mx-auto mt-4"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => handleOpenModal(service)}
                  className="group cursor-pointer bg-white dark:bg-stone-900 overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between border border-stone-200/30 dark:border-stone-800/30"
                >
                  <div className="relative aspect-[16/11] overflow-hidden bg-stone-100 dark:bg-stone-850">
                    <img
                      src={buildImageUrl(service.imageUrl)}
                      alt={service.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500"></div>
                    
                    {/* Icon tag góc */}
                    <div className="absolute top-4 left-4 bg-white/90 dark:bg-stone-900/90 p-2.5 shadow-md text-[#c5a880] flex items-center justify-center border border-[#c5a880]/20">
                      <span className="material-symbols-outlined text-lg">{service.icon || "room_service"}</span>
                    </div>
                  </div>

                  <div className="p-8 flex flex-col flex-1 justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-light tracking-wide font-serif-luxury text-stone-900 dark:text-stone-50 line-clamp-1">
                        {service.name}
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-3 leading-relaxed font-light">
                        {service.shortDescription || "Hãy thả mình thư giãn và trải nghiệm những dịch vụ được thiết kế tỉ mỉ cho kỳ nghỉ hoàn hảo của bạn."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider uppercase pt-4 border-t border-stone-100 dark:border-stone-800 text-[#c5a880]">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        {service.location || "Resort"}
                      </span>
                      <span className="flex items-center gap-1 transition-transform group-hover:translate-x-1 duration-300">
                        Chi tiết <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 5 - SERVICE DETAIL MODAL */}
          {isModalOpen && selectedService && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-opacity duration-300">
              <div 
                className="bg-white dark:bg-stone-900 w-full max-w-4xl shadow-2xl overflow-hidden relative border border-stone-200/40 dark:border-stone-800/40 transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Nút đóng */}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors duration-300 border border-white/10"
                  aria-label="Đóng modal"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* Cột trái: Ảnh lớn */}
                  <div className="relative h-[250px] md:h-full min-h-[300px] bg-stone-100 dark:bg-stone-850">
                    <img
                      src={buildImageUrl(selectedService.imageUrl)}
                      alt={selectedService.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/50 via-transparent to-transparent"></div>
                    {/* Decor tag */}
                    <div className="absolute bottom-6 left-6 text-white hidden md:block">
                      <p className="text-[10px] uppercase tracking-widest text-[#c5a880] font-bold">Premium Services</p>
                      <h4 className="font-serif-luxury text-2xl font-light mt-1">{selectedService.name}</h4>
                    </div>
                  </div>

                  {/* Cột phải: Thông tin chi tiết */}
                  <div className="p-8 md:p-12 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[#c5a880] bg-[#c5a880]/10 p-2 rounded-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-lg">{selectedService.icon || "room_service"}</span>
                        </span>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-[#c5a880]">Chi tiết dịch vụ</span>
                      </div>

                      <h3 className="font-serif-luxury text-2xl md:text-3xl font-light text-stone-900 dark:text-stone-50 leading-tight">
                        {selectedService.name}
                      </h3>

                      <div className="h-[1px] bg-stone-100 dark:bg-stone-800 w-16"></div>

                      <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed font-light max-h-[180px] overflow-y-auto pr-2">
                        {selectedService.description || selectedService.shortDescription || "Hiện tại chưa có mô tả chi tiết đầy đủ cho dịch vụ này."}
                      </p>
                    </div>

                    <div className="space-y-6 pt-4 border-t border-stone-100 dark:border-stone-850">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-[#c5a880] text-xl mt-0.5">schedule</span>
                          <div>
                            <span className="block text-[9px] text-stone-400 dark:text-stone-500 uppercase tracking-wider font-bold">Mở cửa</span>
                            <span className="text-xs font-medium text-stone-800 dark:text-stone-200">
                              {selectedService.openTime && selectedService.closeTime
                                ? `${selectedService.openTime} - ${selectedService.closeTime}`
                                : "Hoạt động 24h"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-[#c5a880] text-xl mt-0.5">location_on</span>
                          <div>
                            <span className="block text-[9px] text-stone-400 dark:text-stone-500 uppercase tracking-wider font-bold">Vị trí</span>
                            <span className="text-xs font-medium text-stone-800 dark:text-stone-200">
                              {selectedService.location || "Trong Resort"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Link
                          href="/rooms"
                          onClick={() => setIsModalOpen(false)}
                          className="flex-1 bg-[#c5a880] hover:bg-[#b89047] text-white font-medium text-xs tracking-widest uppercase py-3.5 text-center transition-all duration-300 hover:shadow-lg active:scale-[0.98]"
                        >
                          Khám phá phòng nghỉ
                        </Link>
                        <button
                          onClick={() => setIsModalOpen(false)}
                          className="px-6 py-3.5 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium text-xs tracking-widest uppercase transition-all duration-300"
                        >
                          Đóng
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6 - LUXURY CTA BANNER */}
          <section className="relative py-28 md:py-36 bg-black flex items-center justify-center text-center overflow-hidden">
            {/* Background Parallax bằng CSS fixed background */}
            <div
              className="absolute inset-0 bg-fixed bg-cover bg-center filter brightness-[0.45] scale-105"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1920&q=90')`,
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-black/40 to-stone-950/90"></div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 space-y-8">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#c5a880] block">
                Kỳ nghỉ thượng hạng
              </span>
              
              <h2 className="font-serif-luxury text-3xl md:text-6xl font-light text-white tracking-wide leading-tight max-w-3xl mx-auto">
                Sẵn sàng cho kỳ nghỉ đẳng cấp?
              </h2>
              
              <div className="w-12 h-[1px] bg-[#c5a880] mx-auto"></div>

              <p className="text-stone-300 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-light">
                Hãy biến những giấc mơ xa hoa nhất thành hiện thực. Đặt phòng ngay hôm nay để nhận các ưu đãi đặc quyền dịch vụ tốt nhất.
              </p>

              <div className="pt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
                <Link
                  href="/rooms"
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#c5a880] hover:bg-[#b89047] text-white font-medium text-xs tracking-widest uppercase transition-all duration-300 hover:shadow-lg hover:shadow-[#c5a880]/15 active:scale-95 text-center"
                >
                  Khám phá phòng nghỉ
                </Link>
                <Link
                  href="/contact"
                  className="w-full sm:w-auto px-8 py-3.5 border border-white/20 hover:border-[#c5a880] hover:text-[#c5a880] text-white font-medium text-xs tracking-widest uppercase transition-all duration-300 backdrop-blur-sm bg-white/5 text-center"
                >
                  Liên hệ tư vấn
                </Link>
              </div>
            </div>
          </section>

        </main>
      )}
    </div>
  );
}
