import Link from "next/link";

const SERIF = { fontFamily: "var(--font-cormorant), Georgia, serif" };

export default function Home() {
  return (
    <>
      {/* ──────── HERO ──────── */}
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-[#1A1A1A]">
        {/* Background image */}
        <img
          alt="Luxury hotel pool at golden hour"
          src="https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1920&q=85"
          className="absolute inset-0 w-full h-full object-cover opacity-50 scale-105"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A]/60 via-[#1A1A1A]/30 to-[#1A1A1A]/80" />

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <span className="inline-block text-[10px] uppercase tracking-[0.4em] text-[#C8A97E] mb-6 font-medium">
            Chào mừng đến với
          </span>
          <h1
            className="text-5xl md:text-8xl font-light text-white mb-6 leading-[1.05]"
            style={SERIF}
          >
            Hoang Minh<br />
            <em className="italic">Resort &amp; Hotel</em>
          </h1>
          <div className="w-16 h-[1px] bg-[#C8A97E] mx-auto mb-6" />
          <p className="text-base md:text-xl text-white/70 font-light leading-relaxed max-w-2xl mx-auto mb-10">
            Không gian nghỉ dưỡng tinh tế ngay trung tâm thành phố — nơi mỗi khoảnh khắc đều là đặc quyền của riêng bạn.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/booking"
              className="px-8 py-3.5 bg-[#C8A97E] hover:bg-[#b5956a] text-white text-xs font-medium uppercase tracking-[0.2em] transition-all duration-300 hover:shadow-xl hover:shadow-[#C8A97E]/20 active:scale-95"
            >
              Đặt phòng ngay
            </Link>
            <Link
              href="/rooms"
              className="px-8 py-3.5 border border-white/30 hover:border-[#C8A97E] text-white hover:text-[#C8A97E] text-xs font-medium uppercase tracking-[0.2em] transition-all duration-300 backdrop-blur-sm bg-white/5"
            >
              Khám phá phòng
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
          <span className="text-[9px] uppercase tracking-[0.3em] text-white/40">Cuộn xuống</span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-white/40 to-transparent animate-pulse" />
        </div>
      </section>

      {/* ──────── BOOKING BAR ──────── */}
      <section className="relative z-20 -mt-1 bg-[#F8F6F3]">
        <div className="max-w-6xl mx-auto px-6 py-0">
          <div className="bg-white shadow-2xl shadow-stone-300/40 border border-[#C8A97E]/10 -mt-8 relative">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-0 divide-y md:divide-y-0 md:divide-x divide-stone-100">
              {[
                { label: "Ngày nhận phòng", icon: "calendar_today", type: "date" },
                { label: "Ngày trả phòng", icon: "calendar_today", type: "date" },
              ].map(({ label, icon, type }) => (
                <div key={label} className="p-5 space-y-1">
                  <label className="block text-[9px] uppercase tracking-[0.25em] font-semibold text-[#C8A97E]">
                    {label}
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-stone-400 text-[18px]">
                      {icon}
                    </span>
                    <input
                      type={type}
                      className="w-full pl-7 pr-0 py-1 bg-transparent border-0 text-sm text-stone-700 focus:ring-0 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
              <div className="p-5 space-y-1">
                <label className="block text-[9px] uppercase tracking-[0.25em] font-semibold text-[#C8A97E]">
                  Số khách
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-stone-400 text-[18px]">
                    person
                  </span>
                  <select className="w-full pl-7 pr-0 py-1 bg-transparent border-0 text-sm text-stone-700 focus:ring-0 focus:outline-none appearance-none">
                    <option>1 Người lớn</option>
                    <option>2 Người lớn</option>
                    <option>3 Người lớn</option>
                  </select>
                </div>
              </div>
              <div className="p-3 flex items-stretch">
                <Link
                  href="/booking"
                  className="flex-1 bg-[#C8A97E] hover:bg-[#b5956a] text-white text-xs font-medium uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-300"
                >
                  <span className="material-symbols-outlined text-lg">search</span>
                  Tìm kiếm
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────── ROOMS PREVIEW ──────── */}
      <section className="py-28 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#C8A97E] font-medium block mb-3">
              Bộ sưu tập phòng
            </span>
            <h2 className="text-4xl md:text-5xl font-light text-stone-900" style={SERIF}>
              Phòng nghỉ sang trọng
            </h2>
          </div>
          <Link
            href="/rooms"
            className="flex items-center gap-2 text-[#C8A97E] text-sm font-medium hover:gap-3 transition-all duration-300 uppercase tracking-wider"
          >
            Xem tất cả <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Phòng Deluxe Giường Đôi",
              price: "850.000",
              tag: "Phổ biến",
              amenities: ["wifi", "ac_unit", "visibility"],
              amenityLabels: ["Wifi", "Máy lạnh", "View đẹp"],
              img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
            },
            {
              name: "Suite Cao Cấp Ban Công",
              price: "1.250.000",
              tag: "Ưu đãi",
              amenities: ["wifi", "ac_unit", "deck"],
              amenityLabels: ["Wifi", "Máy lạnh", "Ban công"],
              img: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
            },
            {
              name: "Phòng Twin Tiêu Chuẩn",
              price: "700.000",
              tag: null,
              amenities: ["wifi", "ac_unit", "tv"],
              amenityLabels: ["Wifi", "Máy lạnh", "Smart TV"],
              img: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
            },
          ].map((room) => (
            <div
              key={room.name}
              className="group bg-white overflow-hidden shadow-md hover:shadow-2xl hover:shadow-stone-300/50 transition-all duration-500 hover:-translate-y-1"
            >
              <div className="aspect-[4/3] overflow-hidden relative bg-stone-100">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  alt={room.name}
                  src={room.img}
                />
                {room.tag && (
                  <div className="absolute top-4 right-4 bg-[#C8A97E] text-white px-3 py-1 text-[10px] font-semibold uppercase tracking-widest">
                    {room.tag}
                  </div>
                )}
              </div>
              <div className="p-7">
                <h3 className="text-xl font-light text-stone-900 mb-3 line-clamp-1" style={SERIF}>
                  {room.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-2xl font-semibold text-[#C8A97E]">{room.price}đ</span>
                  <span className="text-stone-400 text-xs">/ đêm</span>
                </div>
                <div className="flex gap-4 mb-6">
                  {room.amenities.map((icon, i) => (
                    <div key={icon} className="flex items-center gap-1.5 text-stone-500">
                      <span className="material-symbols-outlined text-[16px] text-[#C8A97E]">{icon}</span>
                      <span className="text-xs">{room.amenityLabels[i]}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-100">
                  <Link
                    href="/rooms"
                    className="py-2.5 text-center border border-stone-200 hover:border-[#C8A97E] text-stone-600 hover:text-[#C8A97E] text-xs font-medium uppercase tracking-wider transition-all duration-300"
                  >
                    Xem chi tiết
                  </Link>
                  <Link
                    href="/booking"
                    className="py-2.5 text-center bg-[#C8A97E] hover:bg-[#b5956a] text-white text-xs font-medium uppercase tracking-wider transition-all duration-300"
                  >
                    Đặt phòng
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ──────── AMENITIES ──────── */}
      <section className="py-24 bg-stone-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#C8A97E] font-medium block mb-3">
              Đặc quyền thượng lưu
            </span>
            <h2 className="text-3xl md:text-4xl font-light text-white" style={SERIF}>
              Dịch vụ &amp; Tiện nghi
            </h2>
            <div className="w-10 h-[1px] bg-[#C8A97E] mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { icon: "wifi", label: "Free Wifi" },
              { icon: "ac_unit", label: "Điều hoà" },
              { icon: "smart_display", label: "Smart TV" },
              { icon: "local_parking", label: "Bãi đỗ xe" },
              { icon: "support_agent", label: "Lễ tân 24/7" },
            ].map(({ icon, label }) => (
              <div
                key={icon}
                className="group text-center p-8 border border-stone-700 hover:border-[#C8A97E]/60 transition-all duration-500 hover:bg-[#C8A97E]/5"
              >
                <div className="w-14 h-14 border border-stone-700 group-hover:border-[#C8A97E]/50 flex items-center justify-center mx-auto mb-4 transition-all duration-500">
                  <span className="material-symbols-outlined text-[#C8A97E]/70 group-hover:text-[#C8A97E] text-2xl transition-colors duration-300">
                    {icon}
                  </span>
                </div>
                <p className="text-xs font-medium text-stone-500 group-hover:text-stone-300 uppercase tracking-wider transition-colors duration-300">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── REVIEWS ──────── */}
      <section className="py-28 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C8A97E] font-medium block mb-3">
            Khách hàng nói
          </span>
          <h2 className="text-3xl md:text-5xl font-light text-stone-900 mb-4" style={SERIF}>
            Đánh giá từ quý khách
          </h2>
          <div className="flex items-center justify-center gap-1 text-[#C8A97E]">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
            ))}
            <span className="ml-2 text-sm text-stone-500 font-medium">4.9 / 5 dựa trên 500+ đánh giá</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Nguyễn Minh Tuấn",
              text: "Phòng ốc rất sạch sẽ, đầy đủ tiện nghi. Nhân viên phục vụ nhiệt tình và chuyên nghiệp. Vị trí ngay trung tâm rất tiện di chuyển.",
              img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
            },
            {
              name: "Lê Thị Mai",
              text: "Giá cả cực kỳ hợp lý so với chất lượng phòng. Thủ tục check-in rất nhanh chóng, không phải chờ đợi lâu.",
              img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80",
            },
            {
              name: "Trần Văn Hoàng",
              text: "View từ phòng nhìn ra thành phố rất đẹp, đặc biệt là vào buổi tối. Wifi mạnh, làm việc rất ổn. Sẽ còn quay lại!",
              img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80",
            },
          ].map(({ name, text, img }) => (
            <div key={name} className="bg-white p-8 border border-stone-100 shadow-sm hover:shadow-md transition-all duration-300 relative group">
              <span
                className="absolute top-6 right-6 text-6xl leading-none text-[#C8A97E]/10 select-none"
                style={SERIF}
              >
                &ldquo;
              </span>
              <div className="flex items-center gap-4 mb-5">
                <img alt={name} className="w-11 h-11 rounded-full object-cover ring-2 ring-[#C8A97E]/20" src={img} />
                <div>
                  <p className="font-semibold text-stone-800 text-sm">{name}</p>
                  <div className="flex text-[#C8A97E]">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-stone-500 italic leading-relaxed text-sm">&ldquo;{text}&rdquo;</p>
            </div>
          ))}
        </div>
      </section>

      {/* ──────── CTA BANNER ──────── */}
      <section className="relative py-32 bg-[#1A1A1A] overflow-hidden">
        <div
          className="absolute inset-0 bg-fixed bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1920&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A] via-[#1A1A1A]/90 to-[#1A1A1A]" />
        <div className="relative z-10 text-center max-w-3xl mx-auto px-6">
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#C8A97E] font-medium block mb-4">
            Kỳ nghỉ đẳng cấp
          </span>
          <h2 className="text-4xl md:text-6xl font-light text-white mb-6 leading-tight" style={SERIF}>
            Tận hưởng từng khoảnh<br />
            <em className="italic">khắc thượng lưu</em>
          </h2>
          <div className="w-12 h-[1px] bg-[#C8A97E] mx-auto mb-8" />
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/booking"
              className="px-8 py-3.5 bg-[#C8A97E] hover:bg-[#b5956a] text-white text-xs font-medium uppercase tracking-[0.2em] transition-all duration-300 hover:shadow-lg"
            >
              Đặt phòng ngay
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3.5 border border-white/20 hover:border-[#C8A97E] text-white hover:text-[#C8A97E] text-xs font-medium uppercase tracking-[0.2em] transition-all duration-300"
            >
              Liên hệ tư vấn
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
