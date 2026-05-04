"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Phòng", href: "/rooms" },
    { name: "Tiện nghi", href: "/amenities" },
    { name: "Đánh giá", href: "/reviews" },
    { name: "Liên hệ", href: "/contact" },
  ];

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
        <Link href="/admin/login">
          <button className="bg-primary text-on-primary px-6 py-2.5 rounded hover:bg-primary-container transition-colors active:scale-95 duration-150 font-semibold">
            Đăng nhập
          </button>
        </Link>
      </div>
    </nav>
  );
}
