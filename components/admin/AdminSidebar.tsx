"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Tổng quan", href: "/admin/dashboard", icon: "dashboard" },
    { name: "Phòng", href: "/admin/rooms", icon: "bed" },
    { name: "Loại phòng", href: "/admin/room-categories", icon: "category" },
    { name: "Đặt phòng", href: "/admin/bookings", icon: "book_online" },
    { name: "Lịch phòng", href: "/admin/bookings/calendar", icon: "calendar_month" },
    { name: "Dịch vụ", href: "/admin/services", icon: "room_service" },
    { name: "Đánh giá", href: "/admin/reviews", icon: "star" },
    { name: "Liên hệ", href: "/admin/contacts", icon: "mail" },
  ];

  return (
    <aside className="w-64 bg-surface-container-lowest border-r border-surface-container-highest flex-shrink-0 min-h-[calc(100vh-64px)] overflow-y-auto hidden md:block">
      <div className="py-6 px-4 space-y-1">
        {navItems.map((item) => {
          // Exact match, or startsWith but only for non-exact parent paths
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin/bookings' && pathname.startsWith(`${item.href}/`)) ||
            (item.href === '/admin/bookings' && pathname === '/admin/bookings');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
