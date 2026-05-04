import Navigation from "@/components/Navigation";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navigation />
      <main className="flex-1 pt-20">
        {children}
      </main>

      <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 mt-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8 py-12 max-w-7xl mx-auto font-sans text-sm text-slate-500 dark:text-slate-400">
          <div className="space-y-4">
            <div className="text-lg font-bold text-slate-900 dark:text-white">Hotel Hoang Minh</div>
            <p>© 2024 Hotel Hoang Minh. All rights reserved.</p>
            <div className="flex gap-4">
              <a className="text-slate-500 dark:text-slate-400 hover:text-sky-700 dark:hover:text-sky-300 underline opacity-80 hover:opacity-100 transition-opacity" href="#">Facebook</a>
              <a className="text-slate-500 dark:text-slate-400 hover:text-sky-700 dark:hover:text-sky-300 underline opacity-80 hover:opacity-100 transition-opacity" href="#">Instagram</a>
              <a className="text-slate-500 dark:text-slate-400 hover:text-sky-700 dark:hover:text-sky-300 underline opacity-80 hover:opacity-100 transition-opacity" href="#">Zalo</a>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-xs">Liên hệ</h4>
            <p>Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</p>
            <p>Hotline: 0123 456 789</p>
            <p>Email: contact@hoangminhhotel.com</p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-xs">Nhận bản tin</h4>
            <div className="flex gap-2">
              <input className="bg-surface-container-highest border-none rounded-lg px-4 py-2 flex-1 focus:ring-1 focus:ring-primary text-sm" placeholder="Email của bạn" type="email" />
              <button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider">Gửi</button>
            </div>
            <p className="text-xs opacity-60 italic">Đăng ký để nhận các ưu đãi phòng sớm nhất từ chúng tôi.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
