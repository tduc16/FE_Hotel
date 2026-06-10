'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import AccountSidebar from '@/components/account/AccountSidebar';
import { Menu } from 'lucide-react';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useCustomerAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Đang tải thông tin tài khoản...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Tránh nhấp nháy UI khi đang redirect
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-screen sticky top-0 flex-shrink-0">
        <AccountSidebar />
      </div>

      {/* Mobile Sidebar (Drawer) */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          {/* Content */}
          <div className="relative h-full w-72 max-w-full">
            <AccountSidebar onClose={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-slate-100 px-6 flex items-center gap-4 sticky top-0 z-40">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Menu size={20} className="text-slate-600" />
          </button>
          <span className="font-bold text-slate-800 text-sm">Tài khoản của tôi</span>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-6 lg:p-10 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
