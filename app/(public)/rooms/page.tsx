import Link from 'next/link';

export default async function Rooms() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  let categories = [];
  try {
    const res = await fetch(`${baseUrl}/rooms/categories`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      categories = data.data || [];
    }
  } catch (error) {
    console.error("Failed to fetch categories:", error);
  }

  return (
    <>
      {/* Page Header / Banner */}
      <section className="relative h-[614px] min-h-[400px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img className="w-full h-full object-cover scale-105 blur-[2px]" alt="luxury hotel lobby" src="https://lh3.googleusercontent.com/aida-public/AB6AXuClo-WyeFV1PIEU8eTnsW83k-qKHUaLbpjr2VFv656c2PRgYjviL2S3hSuBwH9DmlSiUHTuTp84h0fpwPTxI3PnOdpddIwMej7-UAnASxFHI5gLE1c7QGzIyjS8z1FKOhvZnEfazh7fPFt3SuK29clmoY7w7B2TH1gkUmTrmXdEgzXifrGzCyf4xEDVqgUL9XHB1lcyztwkz9-DWjXjS01pBlOnkdPKDdfm-nWEOM6suo6kuVhrUeYPsljh4L1rCG8ew2Tsmb6esxHt" />
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
                <input className="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20" type="date" defaultValue="2024-05-20" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Ngày trả phòng</label>
                <input className="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20" type="date" defaultValue="2024-05-22" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Số khách</label>
                <select className="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20">
                  <option>2 Người lớn, 0 Trẻ em</option>
                  <option>1 Người lớn</option>
                  <option>2 Người lớn, 1 Trẻ em</option>
                  <option>3 Người lớn</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Khoảng giá (VNĐ)</label>
                <select className="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20">
                  <option>Tất cả mức giá</option>
                  <option>Dưới 1.000.000</option>
                  <option>1.000.000 - 3.000.000</option>
                  <option>Trên 3.000.000</option>
                </select>
              </div>
              <button className="w-full bg-[#449dd1] text-white py-3.5 rounded-lg font-bold uppercase tracking-wider text-xs hover:brightness-110 transition-all active:scale-[0.98]" type="button">
                Lọc kết quả
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Room List Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {categories.length > 0 ? categories.map((category: any) => (
              <div key={category.id} className="group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden hover:shadow-xl transition-all duration-500">
                <div className="aspect-video overflow-hidden relative">
                  <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={category.name} src={category.thumbnail_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuBFidgcxI3otvpIUVOdC2Is0_WGesIe3FIZXa7esuX-jyE7Q5KXcx1mZ9kjPYUQ5m-qsUMVYGJSvdgn39ZHUmByYeQ_AmBaUEE9H1dO699xSweEKgMtcYBlccwLFr_Q2WZ0XWxteOjkpLpJKy-bg5JW2bA2uabNZ3vsvvNS3g0LPBQQN6wWUPKkxB7VZJEROhtyfX10iD6OCv3xq97PMeHMe_6wxa2L8VhDYv4snYSqwhY5SA4Nx2AswNWCa8yUcezob2h8n91TJIKK"} />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest">{category.name}</div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold font-headline text-on-surface">{category.name}</h3>
                    <div className="text-right">
                      <span className="text-primary font-bold text-xl">{new Intl.NumberFormat('vi-VN').format(category.base_price)}đ</span>
                      <span className="block text-[10px] text-on-surface-variant uppercase tracking-tighter">/ đêm</span>
                    </div>
                  </div>
                  <p className="text-on-surface-variant text-sm mb-6 line-clamp-2 leading-relaxed">
                    {category.description || "Không có mô tả chi tiết."}
                  </p>
                  <div className="flex flex-wrap gap-4 mb-8">
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-lg">group</span>
                      <span className="text-xs font-medium">Sức chứa: {category.capacity} khách</span>
                    </div>
                    {Array.isArray(category.amenities) && category.amenities.map((amenity: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-on-surface-variant">
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                        <span className="text-xs font-medium">{amenity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto flex flex-col sm:flex-row gap-3">
                    <button className="flex-1 py-3 border border-outline-variant text-on-surface text-xs font-bold uppercase tracking-widest rounded hover:bg-surface-container transition-colors">Xem chi tiết</button>
                    <Link href={`/booking?category=${category.id}`} className="flex-1 py-3 bg-[#449dd1] text-white text-xs font-bold text-center uppercase tracking-widest rounded hover:brightness-110 transition-all inline-flex items-center justify-center">Đặt ngay</Link>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-12 text-center text-on-surface-variant">
                Chưa có hạng phòng nào được thiết lập. Vui lòng quay lại sau.
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
