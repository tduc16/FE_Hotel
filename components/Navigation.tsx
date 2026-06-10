"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { useState, useRef, useEffect } from "react";
import { User, Calendar, LogOut, ChevronDown, LayoutDashboard } from "lucide-react";
import toast from "react-hot-toast";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { customer, isAuthenticated, logout } = useCustomerAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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
    { name: "Phòng", href: "/rooms" },
    { name: "Tiện nghi", href: "/amenities" },
    { name: "Đánh giá", href: "/reviews" },
    { name: "Liên hệ", href: "/contact" },
    { name: "Đặt phòng của tôi", href: "/booking-lookup" },
  ];

  const initials = customer?.fullName
    ?.split(" ")
    .slice(-2)
    .map((n) => n[0])
    .join("")
    .toUpperCase() ?? "U";

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto font-sans text-slate-600 dark:text-slate-300">
        <Link href="/" className="text-2xl font-bold tracking-tight text-sky-700 dark:text-sky-400">
          Hotel Hoang Minh
        </Link>
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => {
            // Check if current route matches link exactly or is a nested route
            const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");

            return (
              <Link
                key={link.name}
                href={link.href}
                className={
                  isActive
                    ? "text-sky-700 dark:text-sky-400 font-semibold border-b-2 border-sky-600"
                    : "text-slate-600 dark:text-slate-400 hover:text-sky-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200 font-normal border-b-2 border-transparent"
                }
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {isAuthenticated ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
            >
              {customer?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={customer.avatar_url}
                  alt={customer?.fullName ?? ''}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/10"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white font-bold text-xs">
                  {initials}
                </div>
              )}
              <span className="hidden sm:block text-sm font-semibold text-slate-700 dark:text-slate-200">
                {customer?.fullName?.split(" ").pop()}
              </span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-slate-50 dark:border-slate-700/50 mb-1.5">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                    {customer?.fullName}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-400 truncate">
                    {customer?.email}
                  </p>
                </div>

                <Link
                  href="/account"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-750 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <LayoutDashboard size={16} className="text-slate-450" />
                  Tổng quan tài khoản
                </Link>

                <Link
                  href="/account/bookings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-750 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <Calendar size={16} className="text-slate-450" />
                  Đặt phòng của tôi
                </Link>

                <Link
                  href="/account/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-750 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <User size={16} className="text-slate-450" />
                  Hồ sơ cá nhân
                </Link>

                <div className="border-t border-slate-50 dark:border-slate-700/50 mt-1.5 pt-1.5">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 w-full text-left transition-colors"
                  >
                    <LogOut size={16} />
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login">
              <button className="bg-primary text-on-primary px-6 py-2.5 rounded hover:bg-primary-container transition-colors active:scale-95 duration-150 font-semibold">
                Đăng nhập
              </button>
            </Link>
            <Link href="/register" className="hidden sm:block">
              <button className="border border-slate-200 text-slate-700 px-5 py-2.5 rounded hover:bg-slate-50 transition-colors active:scale-95 duration-150 font-semibold">
                Đăng ký
              </button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

