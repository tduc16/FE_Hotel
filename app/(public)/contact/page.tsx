const SERIF = { fontFamily: "var(--font-cormorant), Georgia, serif" };

const FAQS = [
  {
    q: "Giờ nhận phòng và trả phòng là khi nào?",
    a: "Thời gian nhận phòng tiêu chuẩn là từ 14:00 và thời gian trả phòng là trước 12:00 trưa. Nếu quý khách có nhu cầu nhận phòng sớm hoặc trả phòng muộn, vui lòng liên hệ trước để được hỗ trợ tốt nhất.",
    open: true,
  },
  {
    q: "Khách sạn có dịch vụ đưa đón sân bay không?",
    a: "Có, chúng tôi cung cấp dịch vụ đưa đón sân bay 24/7 với đa dạng các dòng xe từ 4 đến 16 chỗ. Quý khách vui lòng cung cấp thông tin chuyến bay ít nhất 24 giờ trước khi đến.",
    open: false,
  },
  {
    q: "Chính sách hủy phòng như thế nào?",
    a: "Chính sách hủy phòng phụ thuộc vào loại giá phòng quý khách đã đặt. Thông thường, quý khách có thể hủy miễn phí trước 48 giờ tính từ ngày nhận phòng.",
    open: false,
  },
];

export default function Contact() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative min-h-[45vh] flex items-end pb-16 overflow-hidden bg-[#1A1A1A]">
        <img
          alt="Hotel lobby contact"
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=85"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/40 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
          <span className="block text-[10px] uppercase tracking-[0.4em] text-[#C8A97E] font-medium mb-3">
            Chúng tôi lắng nghe
          </span>
          <h1 className="text-5xl md:text-7xl font-light text-white leading-[1.05]" style={SERIF}>
            Trò chuyện<br />
            <em className="italic">cùng chúng tôi</em>
          </h1>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main className="bg-[#F8F6F3] pb-24">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

            {/* LEFT: Contact Form */}
            <div className="lg:col-span-7">
              <div className="bg-white border border-stone-100 shadow-sm p-10">
                <h2 className="text-2xl font-light text-stone-900 mb-1" style={SERIF}>
                  Gửi yêu cầu
                </h2>
                <div className="w-8 h-[1px] bg-[#C8A97E] mb-8" />

                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: "Họ và tên", placeholder: "Nguyễn Văn A", type: "text" },
                      { label: "Email", placeholder: "example@email.com", type: "email" },
                    ].map(({ label, placeholder, type }) => (
                      <div key={label} className="space-y-2">
                        <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C8A97E]">
                          {label}
                        </label>
                        <input
                          className="w-full px-4 py-3 bg-[#F8F6F3] border border-stone-200 focus:border-[#C8A97E]/60 focus:ring-0 focus:outline-none text-sm text-stone-700 transition-colors"
                          placeholder={placeholder}
                          type={type}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C8A97E]">
                      Số điện thoại
                    </label>
                    <input
                      className="w-full px-4 py-3 bg-[#F8F6F3] border border-stone-200 focus:border-[#C8A97E]/60 focus:ring-0 focus:outline-none text-sm text-stone-700 transition-colors"
                      placeholder="+84 000 000 000"
                      type="tel"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C8A97E]">
                      Nội dung tin nhắn
                    </label>
                    <textarea
                      className="w-full px-4 py-3 bg-[#F8F6F3] border border-stone-200 focus:border-[#C8A97E]/60 focus:ring-0 focus:outline-none text-sm text-stone-700 transition-colors resize-none"
                      placeholder="Bạn cần chúng tôi hỗ trợ điều gì?"
                      rows={5}
                    />
                  </div>

                  <button
                    type="button"
                    className="px-10 py-3.5 bg-[#C8A97E] hover:bg-[#b5956a] text-white text-xs font-medium uppercase tracking-[0.2em] transition-all duration-300 hover:shadow-md"
                  >
                    Gửi yêu cầu
                  </button>
                </form>
              </div>
            </div>

            {/* RIGHT: Info */}
            <div className="lg:col-span-5 space-y-6">
              {/* Contact cards */}
              {[
                { icon: "location_on", title: "Địa chỉ", value: "123 Đường ABC, Quận 1, TP. HCM" },
                { icon: "call", title: "Hotline", value: "+84 123 456 789" },
                { icon: "mail", title: "Email", value: "info@hoangminh.com" },
                { icon: "schedule", title: "Lễ tân", value: "Phục vụ 24/7, 365 ngày" },
              ].map(({ icon, title, value }) => (
                <div
                  key={icon}
                  className="bg-white border border-stone-100 p-6 flex items-start gap-5 hover:border-[#C8A97E]/30 transition-colors duration-300 group"
                >
                  <div className="w-11 h-11 border border-[#C8A97E]/30 group-hover:border-[#C8A97E] flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                    <span className="material-symbols-outlined text-[#C8A97E] text-xl">{icon}</span>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-400 mb-1">
                      {title}
                    </p>
                    <p className="text-stone-800 font-medium text-sm">{value}</p>
                  </div>
                </div>
              ))}

              {/* Map placeholder */}
              <div className="relative w-full aspect-video overflow-hidden shadow-sm group border border-stone-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Bản đồ vị trí khách sạn"
                  className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-md px-5 py-2.5 flex items-center gap-2 shadow-lg border border-stone-100">
                    <span className="material-symbols-outlined text-[#C8A97E] text-lg">map</span>
                    <span className="text-sm font-medium text-stone-800">Mở Bản đồ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── FAQ ── */}
        <section className="max-w-3xl mx-auto px-8">
          <div className="text-center mb-12">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#C8A97E] font-medium block mb-3">
              Hỗ trợ nhanh
            </span>
            <h2 className="text-3xl font-light text-stone-900" style={SERIF}>
              Câu hỏi thường gặp
            </h2>
            <div className="w-8 h-[1px] bg-[#C8A97E] mx-auto mt-4" />
          </div>

          <div className="space-y-3">
            {FAQS.map(({ q, a, open }) => (
              <details
                key={q}
                className="group bg-white border border-stone-100 overflow-hidden [&_summary::-webkit-details-marker]:hidden hover:border-[#C8A97E]/20 transition-colors"
                open={open}
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-[#C8A97E]/3 transition-colors">
                  <h3 className="font-medium text-stone-800 text-sm pr-4">{q}</h3>
                  <span className="material-symbols-outlined text-[#C8A97E] flex-shrink-0 transition-transform duration-300 group-open:rotate-180">
                    expand_more
                  </span>
                </summary>
                <div className="px-6 pb-6 text-stone-500 text-sm leading-relaxed border-t border-stone-100">
                  <div className="pt-4">{a}</div>
                </div>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
