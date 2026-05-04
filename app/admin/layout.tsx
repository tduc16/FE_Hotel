"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import AdminGuard from "@/components/admin/AdminGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  return (
    <AdminGuard>
      {isLoginPage ? (
        children
      ) : (
        <div className="min-h-screen bg-surface flex flex-col">
          <AdminTopbar />
          <div className="flex flex-1 overflow-hidden">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto bg-surface p-6 md:p-8">
              {children}
            </main>
          </div>
        </div>
      )}
    </AdminGuard>
  );
}
