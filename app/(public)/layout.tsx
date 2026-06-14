import Navigation from "@/components/Navigation";
import Link from "next/link";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navigation />
      <main className="flex-1 pt-[72px]">{children}</main>

      {/* FOOTER - Dark Luxury Style */}
      <footer className="bg-[#1A1A1A] text-stone-400">
        {/* Top decorative line */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-[#C8A97E]/50 to-transparent" />

        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

            {/* Column 1: About */}
            <div className="space-y-5 lg:col-span-1">
              <div>
                <span
                  className="block text-2xl font-light tracking-widest text-white"
                  style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                >
                  HOANG MINH
                </span>
                <span className="text-[9px] uppercase tracking-[0.35em] text-[#C8A97E] font-medium">
                  Resort &amp; Hotel
                </span>
              </div>
              <p className="text-sm leading-relaxed text-stone-500 font-light max-w-xs">
                Không gian nghỉ dưỡng tinh tế tại trung tâm thành phố — nơi mỗi khoảnh khắc đều là đặc quyền.
              </p>
              <div className="flex gap-4 pt-2">
                {["Facebook", "Instagram", "Zalo"].map((s) => (
                  <a
                    key={s}
                    href="#"
                    className="text-xs text-stone-600 hover:text-[#C8A97E] uppercase tracking-widest transition-colors duration-300"
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>

            {/* Column 2: Navigation */}
            <div className="space-y-5">
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#C8A97E]">
                Khám phá
              </h4>
              <ul className="space-y-3">
                {[
                  { label: "Phòng nghỉ", href: "/rooms" },
                  { label: "Dịch vụ", href: "/services" },
                  { label: "Đánh giá", href: "/reviews" },
                  { label: "Liên hệ", href: "/contact" },
                  { label: "Đặt phòng", href: "/booking" },
                ].map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-stone-500 hover:text-[#C8A97E] transition-colors duration-300 flex items-center gap-2 group"
                    >
                      <span className="w-3 h-[1px] bg-[#C8A97E]/40 group-hover:w-5 group-hover:bg-[#C8A97E] transition-all duration-300" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Contact */}
            <div className="space-y-5">
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#C8A97E]">
                Liên hệ
              </h4>
              <ul className="space-y-4">
                {[
                  { icon: "location_on", text: "123 Đường ABC, Quận 1, TP.HCM" },
                  { icon: "call", text: "+84 123 456 789" },
                  { icon: "mail", text: "contact@hoangminhhotel.com" },
                  { icon: "schedule", text: "Lễ tân: 24/7" },
                ].map(({ icon, text }) => (
                  <li key={icon} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#C8A97E] text-base mt-0.5 flex-shrink-0">
                      {icon}
                    </span>
                    <span className="text-sm text-stone-500 leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Newsletter */}
            <div className="space-y-5">
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#C8A97E]">
                Nhận ưu đãi
              </h4>
              <p className="text-sm text-stone-500 leading-relaxed">
                Đăng ký để nhận các ưu đãi độc quyền và thông tin sớm nhất từ chúng tôi.
              </p>
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="Địa chỉ email của bạn"
                  className="w-full bg-stone-900 border border-stone-700 text-stone-300 placeholder-stone-600 px-4 py-3 text-sm focus:outline-none focus:border-[#C8A97E]/60 transition-colors"
                />
                <button className="w-full bg-[#C8A97E] hover:bg-[#b5956a] text-white text-xs font-medium uppercase tracking-widest py-3 transition-all duration-300">
                  Đăng ký ngay
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-stone-800">
          <div className="max-w-7xl mx-auto px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-stone-600">
              © 2024 Hotel Hoang Minh. All rights reserved.
            </p>
            <p className="text-xs text-stone-700 tracking-wider">
              Luxury · Comfort · Excellence
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
