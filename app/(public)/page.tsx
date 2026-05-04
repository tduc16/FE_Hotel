import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[870px] flex items-center bg-gradient-to-r from-primary-container to-surface-container-lowest overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="z-10 py-12">
            <h1 className="text-[60px] font-extrabold leading-[1.1] tracking-tight text-on-primary-container mb-6">
              Không gian nghỉ dưỡng tiện nghi ngay trung tâm
            </h1>
            <p className="text-xl text-on-secondary-container mb-10 font-medium">
              Phòng sạch đẹp – Giá hợp lý – Check-in nhanh
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/booking" className="bg-primary-container inline-flex items-center text-on-primary-container px-10 py-4 rounded-lg font-bold text-lg shadow-lg hover:bg-primary hover:text-white transition-all active:scale-95">Đặt ngay</Link>
              <button className="bg-white/40 backdrop-blur-md border border-white/60 text-on-surface px-10 py-4 rounded-lg font-bold text-lg hover:bg-white/60 transition-all active:scale-95">Xem phòng</button>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="absolute -inset-4 bg-primary/10 rounded-[2rem] transform rotate-3 blur-2xl"></div>
            <img alt="Hotel Room" className="relative rounded-xl shadow-2xl w-full h-[500px] object-cover transform -rotate-1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAI50fUB5NlIqs3kTVqBUQf9fHPosf_GGRw72LotZ5bHApBQnoA3FcPabg7kINu0L56s5Vd5CnCXwaWUjt1JLue_DISUj7T3nrEJjypFKUjEyxZ25nvx7ShRMoECl3SXUeBF0rIHAOWfbuetGuXiOeArvl33dOJSgyfRFiRROCgZFJak8y1Nc3ZK_xiSXA3rwIikbQdakwUeBEEUL8pQHcqDvuEGmcsr9typ3hvmxR97ZyWqS-g31pYgo3Eb2IlZm5U6_E9_ahkEQhJ" />
          </div>
        </div>
      </section>

      {/* Sticky Booking Bar */}
      <div className="sticky top-20 z-40 -mt-12 px-8 max-w-7xl mx-auto">
        <div className="bg-surface-container-lowest shadow-2xl rounded-xl p-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end border border-outline-variant/10">
          <div className="space-y-2">
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">Ngày nhận phòng</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary">calendar_today</span>
              <input className="w-full bg-surface-container-highest border-none rounded-lg py-3 pl-10 text-sm focus:ring-2 focus:ring-primary/20" type="date" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">Ngày trả phòng</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary">calendar_today</span>
              <input className="w-full bg-surface-container-highest border-none rounded-lg py-3 pl-10 text-sm focus:ring-2 focus:ring-primary/20" type="date" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">Số khách</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary">person</span>
              <select defaultValue="2 Người lớn" className="w-full bg-surface-container-highest border-none rounded-lg py-3 pl-10 text-sm focus:ring-2 focus:ring-primary/20 appearance-none">
                <option value="1 Người lớn">1 Người lớn</option>
                <option value="2 Người lớn">2 Người lớn</option>
                <option value="3 Người lớn">3 Người lớn</option>
              </select>
            </div>
          </div>
          <Link href="/booking" className="bg-primary-container text-on-primary-container h-[50px] rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-colors active:scale-95 shadow-md">
            <span className="material-symbols-outlined">search</span>
            Tìm kiếm
          </Link>
        </div>
      </div>

      {/* Room Grid Section */}
      <section className="py-24 max-w-7xl mx-auto px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-xl">
            <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs mb-3 block">Lựa chọn hàng đầu</span>
            <h2 className="text-4xl font-extrabold text-on-surface">Phòng nghỉ sang trọng</h2>
          </div>
          <button className="text-primary font-bold flex items-center gap-2 hover:underline">
            Xem tất cả hạng phòng <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Room Card 1 */}
          <div className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="aspect-[4/3] overflow-hidden relative">
              <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="deluxe hotel room" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCgw_wx3Od5qx3EkdenXGiDZ0zDBHeRi0FseJsUTrkFA-DZ2C2Miw5puLw3fcSB2W1ouErnRqSovR1I2u7tKA8ONbC9HprTw0Ii83jUxsR73vKYHqLlGanezsIeH9n0Ze7xxTEFL9RUwP0h0XRS2E1ncbSxTLRfX6Mwo5Bgaj6Yaf5Jqk0cX2MHjONUhv4A249DMNIhdSHYAP7L8Z1wo9udcdAhjWJnF3xiUt-0OGXCaC5mZS9XxiqvcDrc-laJP6zdsIj0iloCpiT" />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">Phổ biến</div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-on-surface mb-2 line-clamp-2">Phòng Deluxe Giường Đôi Hướng Phố</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-2xl font-extrabold text-primary">850.000đ</span>
                <span className="text-on-surface-variant text-sm">/ đêm</span>
              </div>
              <div className="flex gap-4 mb-8 text-on-surface-variant">
                <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-lg">wifi</span><span className="text-xs font-medium">Wifi</span></div>
                <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-lg">ac_unit</span><span className="text-xs font-medium">Máy lạnh</span></div>
                <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-lg">visibility</span><span className="text-xs font-medium">View đẹp</span></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button className="py-2.5 rounded-lg border border-outline-variant text-on-surface font-bold text-sm hover:bg-surface-container-low transition-colors">Xem chi tiết</button>
                <Link href="/booking" className="py-2.5 rounded-lg bg-primary-container text-on-primary-container font-bold text-sm hover:bg-primary hover:text-white transition-colors inline-flex justify-center items-center">Đặt phòng</Link>
              </div>
            </div>
          </div>
          {/* Room Card 2 */}
          <div className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="aspect-[4/3] overflow-hidden relative">
              <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="premium suite" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1px6WuyA0XeRvS1XaveH7SDZzmExv87fwKmkmDEEHF5yjg9bL_wYUHX6Ipu-J6BRhOzQMcnyYLD3AU25ttUcaDJu_gswgAWoxe4Sgz1TK3_HMnka5UeY01t7b7Eo-Cs5GQ5jDx6d964sioUTUy_JuHe36tJut5Lh3gjxsrT_y2M4ILYodJrUDv4gpY9O2JeAv8zwilwYd3WLhhv6jKzrjHk49DTGt9MCZim6xcTZfme8MfYETSIDAT92DmaXcCAYUoMAPmtuqgvUr" />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">Ưu đãi</div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-on-surface mb-2 line-clamp-2">Phòng Suite Cao Cấp Ban Công</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-2xl font-extrabold text-primary">1.250.000đ</span>
                <span className="text-on-surface-variant text-sm">/ đêm</span>
              </div>
              <div className="flex gap-4 mb-8 text-on-surface-variant">
                <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-lg">wifi</span><span className="text-xs font-medium">Wifi</span></div>
                <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-lg">ac_unit</span><span className="text-xs font-medium">Máy lạnh</span></div>
                <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-lg">deck</span><span className="text-xs font-medium">Ban công</span></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button className="py-2.5 rounded-lg border border-outline-variant text-on-surface font-bold text-sm hover:bg-surface-container-low transition-colors">Xem chi tiết</button>
                <Link href="/booking" className="py-2.5 rounded-lg bg-primary-container text-on-primary-container font-bold text-sm hover:bg-primary hover:text-white transition-colors inline-flex justify-center items-center">Đặt phòng</Link>
              </div>
            </div>
          </div>
          {/* Room Card 3 */}
          <div className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="aspect-[4/3] overflow-hidden relative">
              <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="cozy twin room" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_phMHMpHVk6P3vqR_TQfIbAi-c5Sga28HUZOv-rxdIFwfe7R79mBYRNr67keAf_ATGf7lWmr98DioPGZDQNtTI1Kl-vNTD_ZSHF8MWfOEBaBQ3eFTNY-H7F-oTjig3iEGzp0XapVfaWYoPXgYpH3l2Rfih0RPn-v8FZu7f5wH5xv1AxuLTIU0kiLDjpliiCuIPLQRFWSffQmLi_fjBRmgyUGhBt5plDk6CH6qM4TuUHvAlFDEN0n6NJsenAzdm33RC8nOe8ysC1XK" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-on-surface mb-2 line-clamp-2">Phòng Twin Tiêu Chuẩn 2 Giường</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-2xl font-extrabold text-primary">700.000đ</span>
                <span className="text-on-surface-variant text-sm">/ đêm</span>
              </div>
              <div className="flex gap-4 mb-8 text-on-surface-variant">
                <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-lg">wifi</span><span className="text-xs font-medium">Wifi</span></div>
                <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-lg">ac_unit</span><span className="text-xs font-medium">Máy lạnh</span></div>
                <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-lg">tv</span><span className="text-xs font-medium">Smart TV</span></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button className="py-2.5 rounded-lg border border-outline-variant text-on-surface font-bold text-sm hover:bg-surface-container-low transition-colors">Xem chi tiết</button>
                <Link href="/booking" className="py-2.5 rounded-lg bg-primary-container text-on-primary-container font-bold text-sm hover:bg-primary hover:text-white transition-colors inline-flex justify-center items-center">Đặt phòng</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Amenities Icon Grid */}
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-on-surface mb-4">Dịch vụ &amp; Tiện nghi</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">Chúng tôi mang đến trải nghiệm nghỉ dưỡng trọn vẹn với đầy đủ trang thiết bị hiện đại nhất.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="bg-white p-8 rounded-xl text-center shadow-sm hover:shadow-md transition-all">
              <div className="w-16 h-16 bg-primary-container/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">wifi</span>
              </div>
              <p className="font-bold text-on-surface">Free Wifi</p>
            </div>
            <div className="bg-white p-8 rounded-xl text-center shadow-sm hover:shadow-md transition-all">
              <div className="w-16 h-16 bg-primary-container/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">ac_unit</span>
              </div>
              <p className="font-bold text-on-surface">AC</p>
            </div>
            <div className="bg-white p-8 rounded-xl text-center shadow-sm hover:shadow-md transition-all">
              <div className="w-16 h-16 bg-primary-container/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">smart_display</span>
              </div>
              <p className="font-bold text-on-surface">Smart TV</p>
            </div>
            <div className="bg-white p-8 rounded-xl text-center shadow-sm hover:shadow-md transition-all">
              <div className="w-16 h-16 bg-primary-container/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">local_parking</span>
              </div>
              <p className="font-bold text-on-surface">Parking</p>
            </div>
            <div className="bg-white p-8 rounded-xl text-center shadow-sm hover:shadow-md transition-all">
              <div className="w-16 h-16 bg-primary-container/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">support_agent</span>
              </div>
              <p className="font-bold text-on-surface">24/7 Reception</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-24 max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-on-surface mb-4">Đánh giá từ khách hàng</h2>
          <div className="flex items-center justify-center gap-1 text-tertiary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="ml-2 font-bold text-on-surface">4.9/5 dựa trên 500+ đánh giá</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Review 1 */}
          <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10 shadow-sm relative">
            <span className="material-symbols-outlined absolute top-6 right-8 text-primary/10 text-6xl select-none">format_quote</span>
            <div className="flex items-center gap-4 mb-6">
              <img alt="User" className="w-12 h-12 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEalyfGIpbEwjKNnOjguq-zvFZ027VTBIxLiDiIwW8Q27XuQNf2pWoevXyQEu61i7n-SI-tE3gW_5OcWPtWg5x6CwIidZ1oNWZTLziAU1_0YrZmEEBh8BlHWRGtBeYatICNguT5iHjPFInyNumLyPhpvM6JcF66PXqPgb6muEb1ollQpK-42Udj4gonGeme3EZa_Stt9gdubBu8d62qT-DDqyw-LtkFMTQVgv54l9pZAXHBQKc4qkAz0xMd05e5mV-H-SvKTHOR6SD" />
              <div>
                <p className="font-bold text-on-surface">Nguyễn Minh Tuấn</p>
                <div className="flex text-tertiary text-xs">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
              </div>
            </div>
            <p className="text-on-surface-variant italic leading-relaxed">"Phòng ốc rất sạch sẽ, đầy đủ tiện nghi. Nhân viên phục vụ nhiệt tình và chuyên nghiệp. Vị trí ngay trung tâm rất tiện di chuyển."</p>
          </div>
          {/* Review 2 */}
          <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10 shadow-sm relative">
            <span className="material-symbols-outlined absolute top-6 right-8 text-primary/10 text-6xl select-none">format_quote</span>
            <div className="flex items-center gap-4 mb-6">
              <img alt="User" className="w-12 h-12 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjxYUj1o0ednpZpf7EPEI5eBiukMDyGff5fui5DtG-BurA4ueb7AIs45S7mpE6D8zcYAfTP4EoOj997JPqvGGD3VmB_fNeo0lQTaBU3S_zNN9r4UFWPrqSqwunnFiqoVCyQGBXvrLUdkGegzFcmrgZ8Nsncl0YU46As-hEyxzEhso6PXKM9K9HaCL1rFXo1_r67kMq_yjWCvnm3-8rZWkVWvR8Kxcq0ywJJufwzdiBc95g2muVRBG4FKxpQ9fkeNiM6ehMEtvOZQLn" />
              <div>
                <p className="font-bold text-on-surface">Lê Thị Mai</p>
                <div className="flex text-tertiary text-xs">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
              </div>
            </div>
            <p className="text-on-surface-variant italic leading-relaxed">"Giá cả cực kỳ hợp lý so với chất lượng phòng. Thủ tục check-in rất nhanh chóng, không phải chờ đợi lâu."</p>
          </div>
          {/* Review 3 */}
          <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10 shadow-sm relative">
            <span className="material-symbols-outlined absolute top-6 right-8 text-primary/10 text-6xl select-none">format_quote</span>
            <div className="flex items-center gap-4 mb-6">
              <img alt="User" className="w-12 h-12 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIed-ZCIiqGP_pKh-Jjq7ipfejrdrYBnrIi579AhSdqiUB9zy4XIz2wliKnzgHpU91NWrBTYgsKw5cV3BiAz9eiXGKDU4RrBb1s0fDmlzo5cSVPkMuFwAMb33_drmqVbNsWIZYl1D-ll0gBCUHJHV8tc4lXswePfSGAXADTTFvf6g09kxT0W5K3CXucQKeRYZ5qwS8jmuLhxjfayDNT4_41EMnBrhuMB5rbIFhFJRslQAelTmksQoFFBHj6W8waKrKh_V6KC3zD04g" />
              <div>
                <p className="font-bold text-on-surface">Trần Văn Hoàng</p>
                <div className="flex text-tertiary text-xs">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
              </div>
            </div>
            <p className="text-on-surface-variant italic leading-relaxed">"View từ phòng nhìn ra thành phố rất đẹp, đặc biệt là vào buổi tối. Wifi mạnh, làm việc rất ổn. Sẽ còn quay lại!"</p>
          </div>
        </div>
      </section>
    </>
  );
}
