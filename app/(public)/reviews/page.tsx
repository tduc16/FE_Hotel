import Link from "next/link";

const SERIF = { fontFamily: "var(--font-cormorant), Georgia, serif" };

const REVIEWS = [
  {
    id: 1,
    name: "Nguyễn Minh Anh",
    room: "Deluxe Room",
    date: "Tháng 3, 2026",
    stars: 5,
    text: "Trải nghiệm tuyệt vời! Khách sạn có không gian rất yên tĩnh và sang trọng. Nhân viên phục vụ cực kỳ chu đáo, đặc biệt là dịch vụ phòng luôn sạch sẽ mỗi ngày. Tôi chắc chắn sẽ quay lại.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80",
    helpful: 8,
  },
  {
    id: 2,
    name: "Lê Hoàng Nam",
    room: "Suite Ocean View",
    date: "Tháng 2, 2026",
    stars: 5,
    text: "Vị trí khách sạn rất thuận tiện để di chuyển. View từ phòng Suite nhìn ra biển thực sự là một \"tuyệt phẩm\". Đồ ăn sáng đa dạng và ngon miệng. Một nơi nghỉ dưỡng đúng nghĩa.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80",
    helpful: 12,
  },
  {
    id: 3,
    name: "Trần Thị Thu",
    room: "Family Room",
    date: "Tháng 1, 2026",
    stars: 5,
    text: "Gia đình tôi đã có một kỳ nghỉ tết đáng nhớ tại đây. Các con tôi rất thích khu vực hồ bơi và khu vui chơi. Sự nồng hậu của đội ngũ nhân viên khiến chúng tôi cảm thấy như đang ở nhà.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
    helpful: 0,
  },
  {
    id: 4,
    name: "Phạm Quốc Bảo",
    room: "Standard King",
    date: "Tháng 3, 2026",
    stars: 5,
    text: "Rất ấn tượng với thiết kế của khách sạn. Mọi góc nhỏ đều có thể chụp ảnh đẹp. Dịch vụ spa ở đây cũng rất chất lượng, giúp tôi thư giãn tuyệt đối sau chuyến bay dài.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80",
    helpful: 5,
  },
  {
    id: 5,
    name: "Đỗ Mỹ Linh",
    room: "Honeymoon Suite",
    date: "Tháng 12, 2025",
    stars: 5,
    text: "Khách sạn đã chuẩn bị bất ngờ cho vợ chồng tôi nhân dịp trăng mật. Sự tinh tế này thực sự ghi điểm lớn. Phòng ốc cực kỳ sang chảnh và riêng tư. Cảm ơn Hoang Minh Hotel rất nhiều!",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80",
    helpful: 21,
  },
  {
    id: 6,
    name: "Vũ Quang Huy",
    room: "Deluxe Twin",
    date: "Tháng 2, 2026",
    stars: 4,
    text: "Kỳ nghỉ rất hài lòng. Wifi ổn định giúp tôi có thể xử lý công việc từ xa hiệu quả. Các tiện ích khác đều đúng như mô tả trên website. Sẽ giới thiệu cho bạn bè.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80",
    helpful: 0,
  },
];

const CATEGORIES = [
  { label: "Cleanliness", score: 4.9, pct: 98 },
  { label: "Service", score: 5.0, pct: 100 },
  { label: "Location", score: 4.7, pct: 94 },
  { label: "Amenities", score: 4.8, pct: 96 },
];

export default function Reviews() {
  return (
    <>
      {/* ── HERO ── */}
      <header className="relative min-h-[55vh] flex items-center overflow-hidden bg-[#1A1A1A]">
        <img
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          alt="Happy couple at sunset"
          src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1920&q=85"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A]/80 via-[#1A1A1A]/40 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-8 w-full py-20">
          <div className="max-w-2xl">
            <span className="block text-[10px] uppercase tracking-[0.4em] text-[#C8A97E] font-medium mb-4">
              Phản hồi từ quý khách
            </span>
            <h1 className="text-5xl md:text-7xl font-light text-white mb-5 leading-[1.05]" style={SERIF}>
              Khách hàng<br />
              <em className="italic">nói về chúng tôi</em>
            </h1>
            <div className="w-12 h-[1px] bg-[#C8A97E] mb-6" />
            <p className="text-white/70 font-light leading-relaxed max-w-xl">
              Cùng nghe những nhận xét chân thực từ hàng ngàn du khách đã lựa chọn Hotel Hoang Minh cho kỳ nghỉ của mình.
            </p>
          </div>
        </div>
      </header>

      {/* ── STATS BAR ── */}
      <section className="bg-white border-b border-stone-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Overall score */}
            <div className="text-center lg:border-r lg:border-stone-200 lg:pr-12 flex-shrink-0">
              <div className="text-7xl font-light text-[#C8A97E]" style={SERIF}>4.8</div>
              <div className="flex justify-center text-[#C8A97E] my-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                ))}
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500 font-medium">Trên 5.0 Điểm</p>
              <p className="text-xs text-stone-400 mt-1">Dựa trên 2,450 đánh giá</p>
            </div>

            {/* Category scores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-5 w-full">
              {CATEGORIES.map(({ label, score, pct }) => (
                <div key={label} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-stone-700">{label}</span>
                    <span className="text-[#C8A97E] font-semibold">{score}</span>
                  </div>
                  <div className="h-1 w-full bg-stone-100 overflow-hidden">
                    <div
                      className="h-full bg-[#C8A97E] transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── REVIEW CARDS ── */}
      <section className="py-24 bg-[#F8F6F3]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-14">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#C8A97E] font-medium block mb-3">
              Câu chuyện từ khách hàng
            </span>
            <h2 className="text-4xl font-light text-stone-900" style={SERIF}>
              Đánh giá nổi bật
            </h2>
          </div>

          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {REVIEWS.map((review) => (
              <div
                key={review.id}
                className="break-inside-avoid bg-white p-8 border border-stone-100 hover:shadow-lg hover:shadow-stone-200/60 transition-all duration-300 relative group"
              >
                {/* Quote mark */}
                <span
                  className="absolute top-5 right-6 text-7xl leading-none text-[#C8A97E]/10 select-none"
                  style={SERIF}
                >
                  &ldquo;
                </span>

                {/* Reviewer */}
                <div className="flex items-center gap-4 mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={review.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-[#C8A97E]/20"
                    src={review.avatar}
                  />
                  <div>
                    <p className="font-semibold text-stone-800 text-sm">{review.name}</p>
                    <p className="text-xs text-stone-400">{review.date} · {review.room}</p>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex text-[#C8A97E] mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className="material-symbols-outlined text-[15px]"
                      style={{ fontVariationSettings: i < review.stars ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      star
                    </span>
                  ))}
                </div>

                {/* Text */}
                <p className="text-stone-500 text-sm leading-relaxed italic">
                  &ldquo;{review.text}&rdquo;
                </p>

                {/* Helpful */}
                {review.helpful > 0 && (
                  <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                    <button className="flex items-center gap-2 text-xs text-[#C8A97E] font-medium hover:text-[#b5956a] transition-colors">
                      <span className="material-symbols-outlined text-base">thumb_up</span>
                      Hữu ích ({review.helpful})
                    </button>
                    <button className="text-stone-400 hover:text-[#C8A97E] transition-colors">
                      <span className="material-symbols-outlined text-base">share</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-[#1A1A1A] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1920&q=80')" }} />
        <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-4" style={SERIF}>
            Trở thành khách hàng tiếp theo<br />
            <em className="italic text-[#C8A97E]">trải nghiệm sự khác biệt</em>
          </h2>
          <div className="w-10 h-[1px] bg-[#C8A97E] mx-auto mb-8" />
          <Link
            href="/booking"
            className="inline-block px-10 py-4 bg-[#C8A97E] hover:bg-[#b5956a] text-white text-xs font-medium uppercase tracking-[0.2em] transition-all duration-300 hover:shadow-xl"
          >
            Đặt phòng ngay
          </Link>
        </div>
      </section>
    </>
  );
}
