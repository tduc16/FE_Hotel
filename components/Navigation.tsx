"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { useState, useRef, useEffect } from "react";
import { User, Calendar, LogOut, ChevronDown, LayoutDashboard, Menu, X } from "lucide-react";
import toast from "react-hot-toast";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { customer, isAuthenticated, logout } = useCustomerAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    toast.success("Đã đăng xuất");
    router.push("/");
  };

  const navLinks = [
    { name: "Phòng nghỉ", href: "/rooms" },
    { name: "Dịch vụ", href: "/services" },
    { name: "Đánh giá", href: "/reviews" },
    { name: "Liên hệ", href: "/contact" },
    { name: "Tra cứu đặt phòng", href: "/booking-lookup" },
  ];

  const initials = customer?.fullName
    ?.split(" ")
    .slice(-2)
    .map((n) => n[0])
    .join("")
    .toUpperCase() ?? "U";

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl shadow-[0_2px_20px_rgba(200,169,126,0.12)] border-b border-[#C8A97E]/10"
            : "bg-white/70 backdrop-blur-md border-b border-[#C8A97E]/5"
        }`}
      >
        <div className="flex items-center justify-between px-6 md:px-10 py-4 max-w-7xl mx-auto">
          {/* Logo */}
          <Link href="/" className="flex flex-col leading-none group">
            <span
              className="font-serif-luxury text-2xl font-light tracking-widest text-[#1A1A1A] group-hover:text-[#C8A97E] transition-colors duration-300"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              HOANG MINH
            </span>
            <span className="text-[9px] uppercase tracking-[0.35em] text-[#C8A97E] font-medium mt-0.5">
              Resort &amp; Hotel
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative text-sm font-medium tracking-wide transition-colors duration-300 py-1 group ${
                    isActive
                      ? "text-[#C8A97E]"
                      : "text-stone-600 hover:text-[#C8A97E]"
                  }`}
                >
                  {link.name}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-[1px] bg-[#C8A97E] transition-all duration-300 ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          {/* Right: Auth */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-none border border-[#C8A97E]/30 hover:border-[#C8A97E] hover:bg-[#C8A97E]/5 transition-all duration-300 focus:outline-none"
                >
                  {customer?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={customer.avatar_url}
                      alt={customer?.fullName ?? ""}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-[#C8A97E]/30"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#C8A97E] flex items-center justify-center text-white font-bold text-xs">
                      {initials}
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium text-stone-700">
                    {customer?.fullName?.split(" ").pop()}
                  </span>
                  <ChevronDown
                    size={13}
                    className={`text-[#C8A97E] transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-1 w-56 bg-white shadow-2xl shadow-stone-200/80 border border-[#C8A97E]/15 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-stone-100 mb-1">
                      <p className="text-sm font-semibold text-stone-800 truncate">
                        {customer?.fullName}
                      </p>
                      <p className="text-xs text-stone-400 truncate mt-0.5">
                        {customer?.email}
                      </p>
                    </div>

                    {[
                      { href: "/account", icon: LayoutDashboard, label: "Tổng quan tài khoản" },
                      { href: "/account/bookings", icon: Calendar, label: "Đặt phòng của tôi" },
                      { href: "/account/profile", icon: User, label: "Hồ sơ cá nhân" },
                    ].map(({ href, icon: Icon, label }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-[#C8A97E]/8 hover:text-[#C8A97E] transition-colors"
                      >
                        <Icon size={15} className="text-[#C8A97E]/70" />
                        {label}
                      </Link>
                    ))}

                    <div className="border-t border-stone-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full text-left transition-colors"
                      >
                        <LogOut size={15} />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="hidden sm:block text-sm font-medium text-stone-600 hover:text-[#C8A97E] transition-colors duration-300 px-4 py-2"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/booking"
                  className="bg-[#C8A97E] hover:bg-[#b5956a] text-white text-xs font-medium tracking-widest uppercase px-5 py-2.5 transition-all duration-300 hover:shadow-md hover:shadow-[#C8A97E]/20 active:scale-95"
                >
                  Đặt phòng
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-stone-600 hover:text-[#C8A97E] transition-colors"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-[#C8A97E]/10 px-6 py-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block py-3 text-sm font-medium border-b border-stone-100 last:border-0 transition-colors ${
                    isActive ? "text-[#C8A97E]" : "text-stone-600 hover:text-[#C8A97E]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            {!isAuthenticated && (
              <div className="pt-3 flex gap-3">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2.5 border border-[#C8A97E] text-[#C8A97E] text-sm font-medium"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/booking"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2.5 bg-[#C8A97E] text-white text-sm font-medium"
                >
                  Đặt phòng
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
