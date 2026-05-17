import { Suspense } from 'react';
import { roomService } from '@/services/room.service';
import { RoomCategory } from '@/types/room';
import RoomCard from '@/components/rooms/RoomCard';

function RoomListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/10 animate-pulse">
          <div className="aspect-video bg-surface-container relative">
            <div className="absolute top-4 left-4 bg-surface-container-high h-6 w-24 rounded"></div>
            <div className="absolute top-4 right-4 bg-surface-container-high h-6 w-20 rounded"></div>
          </div>
          <div className="p-8 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="h-8 bg-surface-container rounded w-1/2"></div>
              <div className="h-8 bg-surface-container rounded w-1/4"></div>
            </div>
            <div className="h-4 bg-surface-container rounded w-full mb-2"></div>
            <div className="h-4 bg-surface-container rounded w-5/6 mb-6"></div>
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="h-6 bg-surface-container rounded w-24"></div>
              <div className="h-6 bg-surface-container rounded w-24"></div>
              <div className="h-6 bg-surface-container rounded w-24"></div>
            </div>
            <div className="mt-auto flex flex-col sm:flex-row gap-3">
              <div className="h-12 bg-surface-container rounded flex-1"></div>
              <div className="h-12 bg-surface-container rounded flex-1"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

async function RoomList() {
  let categories: RoomCategory[] = [];
  let error = null;

  try {
    categories = await roomService.getCategories();
    console.log(`[RoomList] Số lượng rooms chuẩn bị render ra UI: ${categories.length}`);
    categories.forEach(c => console.log(`[RoomList Render] Room: id=${c.id}, name=${c.name}, thumbnail=${c.thumbnail_url}`));
  } catch (err) {
    console.error("[RoomList] Failed to fetch categories:", err);
    error = "Không thể tải danh sách phòng. Vui lòng thử lại sau.";
  }

  if (error) {
    return (
      <div className="col-span-full py-12 px-6 text-center text-error bg-error-container/20 rounded-xl border border-error/20">
        <span className="material-symbols-outlined text-4xl block mb-2">error</span>
        <p>{error}</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="col-span-full py-16 px-6 text-center text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant/10">
        <span className="material-symbols-outlined text-4xl block mb-2 opacity-50">hotel</span>
        <p>Chưa có hạng phòng nào được thiết lập. Vui lòng quay lại sau.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      {categories.map((category) => (
        <RoomCard key={category.id} category={category} />
      ))}
    </div>
  );
}

export default function RoomsPage() {
  return (
    <>
      {/* Page Header / Banner */}
      <section className="relative h-[614px] min-h-[400px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-surface-container">
          <img 
            className="w-full h-full object-cover scale-105 blur-[2px]" 
            alt="luxury hotel lobby" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuClo-WyeFV1PIEU8eTnsW83k-qKHUaLbpjr2VFv656c2PRgYjviL2S3hSuBwH9DmlSiUHTuTp84h0fpwPTxI3PnOdpddIwMej7-UAnASxFHI5gLE1c7QGzIyjS8z1FKOhvZnEfazh7fPFt3SuK29clmoY7w7B2TH1gkUmTrmXdEgzXifrGzCyf4xEDVqgUL9XHB1lcyztwkz9-DWjXjS01pBlOnkdPKDdfm-nWEOM6suo6kuVhrUeYPsljh4L1rCG8ew2Tsmb6esxHt" 
          />
          <div className="absolute inset-0 bg-on-surface/30 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 font-headline">
              Hệ thống <br />phòng nghỉ
            </h1>
            <p className="text-xl text-white/90 font-body leading-relaxed max-w-xl">
              Trải nghiệm không gian lưu trú tuyệt vời với đa dạng hạng phòng được thiết kế tinh tế cho kỳ nghỉ của bạn.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="relative z-20 -mt-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-2xl shadow-on-surface/5 border border-outline-variant/10">
            <form className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Ngày nhận phòng</label>
                <input className="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none" type="date" defaultValue="2024-05-20" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Ngày trả phòng</label>
                <input className="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none" type="date" defaultValue="2024-05-22" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Số khách</label>
                <select className="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                  <option>2 Người lớn, 0 Trẻ em</option>
                  <option>1 Người lớn</option>
                  <option>2 Người lớn, 1 Trẻ em</option>
                  <option>3 Người lớn</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Khoảng giá (VNĐ)</label>
                <select className="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                  <option>Tất cả mức giá</option>
                  <option>Dưới 1.000.000</option>
                  <option>1.000.000 - 3.000.000</option>
                  <option>Trên 3.000.000</option>
                </select>
              </div>
              <button className="w-full bg-[#449dd1] text-white py-3.5 rounded-lg font-bold uppercase tracking-wider text-xs hover:brightness-110 transition-all active:scale-[0.98] outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#449dd1]" type="button">
                Lọc kết quả
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Room List Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={<RoomListSkeleton />}>
            <RoomList />
          </Suspense>
        </div>
      </section>
    </>
  );
}

