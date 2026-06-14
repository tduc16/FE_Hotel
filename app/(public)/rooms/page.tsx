import { Suspense } from 'react';
import { roomService } from '@/services/room.service';
import { RoomCategory } from '@/types/room';
import RoomCard from '@/components/rooms/RoomCard';

const SERIF = { fontFamily: "var(--font-cormorant), Georgia, serif" };

function RoomListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col bg-white overflow-hidden border border-stone-100 animate-pulse">
          <div className="aspect-[16/10] bg-stone-100" />
          <div className="p-7 space-y-4">
            <div className="flex justify-between">
              <div className="h-6 bg-stone-100 rounded w-1/2" />
              <div className="h-6 bg-stone-100 rounded w-1/4" />
            </div>
            <div className="h-3 bg-stone-100 rounded w-8" />
            <div className="h-4 bg-stone-100 rounded w-full" />
            <div className="h-4 bg-stone-100 rounded w-5/6" />
            <div className="flex gap-3 mt-2">
              <div className="h-3 bg-stone-100 rounded w-16" />
              <div className="h-3 bg-stone-100 rounded w-16" />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-100">
              <div className="h-9 bg-stone-100 rounded" />
              <div className="h-9 bg-stone-100 rounded" />
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
    console.log(`[RoomList] Số lượng rooms chuẩn bị render: ${categories.length}`);
    categories.forEach(c => console.log(`[RoomList Render] Room: id=${c.id}, name=${c.name}, thumbnail=${c.thumbnail_url}`));
  } catch (err) {
    console.error("[RoomList] Failed to fetch categories:", err);
    error = "Không thể tải danh sách phòng. Vui lòng thử lại sau.";
  }

  if (error) {
    return (
      <div className="col-span-full py-16 px-6 text-center border border-red-100 bg-red-50 text-red-600">
        <span className="material-symbols-outlined text-4xl block mb-3">error</span>
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="col-span-full py-20 px-6 text-center text-stone-400">
        <span className="material-symbols-outlined text-5xl block mb-3 opacity-30">hotel</span>
        <p className="text-sm">Chưa có hạng phòng nào. Vui lòng quay lại sau.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      {categories.map((category) => (
        <RoomCard key={category.id} category={category} />
      ))}
    </div>
  );
}

export default function RoomsPage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden bg-[#1A1A1A]">
        <img
          className="absolute inset-0 w-full h-full object-cover opacity-45"
          alt="Luxury hotel room overview"
          src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1920&q=85"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A]/80 via-[#1A1A1A]/40 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
          <div className="max-w-2xl">
            <span className="block text-[10px] uppercase tracking-[0.4em] text-[#C8A97E] font-medium mb-4">
              Bộ sưu tập phòng
            </span>
            <h1 className="text-5xl md:text-7xl font-light text-white mb-5 leading-[1.05]" style={SERIF}>
              Phòng nghỉ<br />
              <em className="italic">sang trọng</em>
            </h1>
            <div className="w-12 h-[1px] bg-[#C8A97E] mb-6" />
            <p className="text-base text-white/70 font-light leading-relaxed max-w-xl">
              Trải nghiệm không gian lưu trú tinh tế với đa dạng hạng phòng được thiết kế chuẩn 5 sao cho kỳ nghỉ của bạn.
            </p>
          </div>
        </div>
      </section>

      {/* ── FILTER BAR ── */}
      <section className="relative z-20 bg-white shadow-md shadow-stone-200/50 border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-8">
          <form className="grid grid-cols-2 md:grid-cols-5 gap-0 divide-y-2 md:divide-y-0 md:divide-x divide-stone-100">
            {[
              { label: "Ngày nhận phòng", type: "date", default: "2024-05-20" },
              { label: "Ngày trả phòng", type: "date", default: "2024-05-22" },
            ].map(({ label, type, default: def }) => (
              <div key={label} className="px-6 py-4 space-y-1">
                <label className="block text-[9px] uppercase tracking-[0.25em] font-semibold text-[#C8A97E]">
                  {label}
                </label>
                <input
                  className="w-full bg-transparent border-0 text-sm text-stone-700 focus:ring-0 focus:outline-none"
                  type={type}
                  defaultValue={def}
                />
              </div>
            ))}

            <div className="px-6 py-4 space-y-1">
              <label className="block text-[9px] uppercase tracking-[0.25em] font-semibold text-[#C8A97E]">
                Số khách
              </label>
              <select className="w-full bg-transparent border-0 text-sm text-stone-700 focus:ring-0 focus:outline-none appearance-none">
                <option>2 Người lớn, 0 Trẻ em</option>
                <option>1 Người lớn</option>
                <option>2 Người lớn, 1 Trẻ em</option>
                <option>3 Người lớn</option>
              </select>
            </div>

            <div className="px-6 py-4 space-y-1">
              <label className="block text-[9px] uppercase tracking-[0.25em] font-semibold text-[#C8A97E]">
                Khoảng giá
              </label>
              <select className="w-full bg-transparent border-0 text-sm text-stone-700 focus:ring-0 focus:outline-none appearance-none">
                <option>Tất cả mức giá</option>
                <option>Dưới 1.000.000đ</option>
                <option>1.000.000 – 3.000.000đ</option>
                <option>Trên 3.000.000đ</option>
              </select>
            </div>

            <div className="flex items-stretch">
              <button
                type="button"
                className="w-full bg-[#C8A97E] hover:bg-[#b5956a] text-white text-xs font-medium uppercase tracking-[0.2em] transition-all duration-300 px-6"
              >
                Tìm kiếm
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ── ROOM LIST ── */}
      <section className="py-20 px-6 bg-[#F8F6F3]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#C8A97E] font-medium block mb-2">
                Lựa chọn của bạn
              </span>
              <h2 className="text-3xl font-light text-stone-900" style={SERIF}>
                Tất cả hạng phòng
              </h2>
            </div>
          </div>

          <Suspense fallback={<RoomListSkeleton />}>
            <RoomList />
          </Suspense>
        </div>
      </section>
    </>
  );
}
