"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";

export default function AdminTopbar() {
  const router = useRouter();
  const [adminInfo, setAdminInfo] = useState<{ username: string; role: string } | null>(null);

  useEffect(() => {
    const info = authService.getAdminInfo();
    if (info) setAdminInfo(info);
  }, []);

  const handleLogout = () => {
    authService.logout();
    router.push("/admin/login");
  };

  return (
    <nav className="bg-surface-container-lowest border-b border-surface-container-highest shadow-sm h-16 flex-shrink-0 z-10 sticky top-0">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex-shrink-0 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl">apartment</span>
          <span className="text-xl font-headline font-bold text-primary tracking-tight">
            Admin Panel
          </span>
        </div>
        <div className="flex items-center space-x-6">
          <span className="text-on-surface font-medium text-sm">
            Xin chào, {adminInfo?.username || "Admin"}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-surface-container-highest text-on-surface-variant hover:text-on-surface hover:bg-surface-container px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Đăng xuất
          </button>
        </div>
      </div>
    </nav>
  );
}
