export default function Amenities() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[716px] flex items-center justify-center overflow-hidden">
        <img alt="Luxury Infinity Pool" className="absolute inset-0 w-full h-full object-cover opacity-90" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_WjorD-3n35ZZ4KV9ppRIzb-RIpNe3798Qh83u-Fxl-fVk5dqPTjOdroEdYoHi1pJxA0vJrI62bk4YGzE7BmGasd4rzDuDGiBz8dfQueEq9V8ZzwXt0rc3Sv4-vpI_E_JehyAAqx7KZqRRwuPs6J-wpTuFc3RDcaT68vE9Fq6mV8o0OP0V6rYLTx2rWRLn9Jm6KSrc5U--u-G1c-RhySj_7mU3Ev6S5H4sYyAvkDRihtzaqEGr6OjwKgjDLVm7cfIImMbz3TLWO8y" />
        <div className="absolute inset-0 bg-gradient-to-b from-surface/40 to-surface/10"></div>
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tighter shadow-sm">
            Dịch vụ &amp; Tiện ích đẳng cấp
          </h1>
          <p className="font-body text-xl md:text-2xl text-white/90 font-light leading-relaxed drop-shadow-md">
            Tận hưởng những giây phút thư giãn tuyệt đối tại Hotel Hoang Minh
          </p>
        </div>
      </section>

      {/* Services List (Z-Pattern) */}
      <main className="py-24 space-y-32">
        {/* Section 1: Nhà hàng & Bar */}
        <section className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 space-y-6">
            <span className="inline-block font-headline font-bold text-sm tracking-widest text-primary uppercase">Culinaries</span>
            <h2 className="font-headline text-4xl font-bold text-on-surface tracking-tight">Nhà hàng &amp; Bar</h2>
            <p className="text-on-surface-variant leading-relaxed text-lg">
              Thưởng thức ẩm thực đa dạng từ Á sang Âu trong không gian tinh tế và đẳng cấp bậc nhất.
            </p>
            <div className="bg-surface-container-low p-4 rounded-lg flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">schedule</span>
              <span className="font-medium">Giờ mở cửa: 6:00 - 22:00</span>
            </div>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">check_circle</span>
                <span className="font-medium">Đầu bếp 5 sao</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">check_circle</span>
                <span className="font-medium">Rượu vang thượng hạng</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">check_circle</span>
                <span className="font-medium">Tầm nhìn toàn cảnh</span>
              </li>
            </ul>
            <button className="mt-4 px-8 py-3 rounded-lg border-2 border-primary-container text-primary font-bold hover:bg-primary-container/10 transition-all">
              Tìm hiểu thêm
            </button>
          </div>
          <div className="order-1 md:order-2">
            <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl transform md:rotate-2 hover:rotate-0 transition-transform duration-500">
              <img alt="Fine Dining" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAo_cO7qMSHewB2jsRetUCOjo0rywkE9EMzwx2wfSL6SAO4hi2SDKZgxQDWq7lnmk1mdV-FwD937Z9duih0OhQPNWtNT_iCLUfNCmUOiA0tn4Tq7i6t7BTN7WkIBrcQpLgj5_nAMX7mXF5CwTDpf-73EJxcchEz7bfcYIgneKvKkjMQrVr7xalsAVP4Z_SHHz816CODanDufit-RUlXDxgpRPXRBGlt2ESzXVbMK2YAOBapUVBTBXQIygOLKoUUu5wguf4hFnliC7B9" />
            </div>
          </div>
        </section>

        {/* Section 2: Hồ bơi vô cực */}
        <section className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-1">
            <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl transform md:-rotate-2 hover:rotate-0 transition-transform duration-500">
              <img alt="Infinity Pool" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuClYQgAvvggUgHj4CAcNwcAVphQoh-DWeP4R4iOOqrjAKoSE25ZCsP4Or_v7ZpIfwVoZBL1Wy24kyJTpN7juZX4dR5Kc1zV6Z9MsOoaDxU-hynljgln6EIzpD-0IeDvqSno7ETiib-Rcu1zIAVQVtizJlXwiXCq7hzVjWHAjEQoNGvCOn9WyE_3kdYECq1CZohUb6B5VV9gpUr1ZRDDwGGzQZJpbTlykraR9BMtPOHkfohT0jqGF6m6npHeMwRAlc6xd3pTbQks21Zz" />
            </div>
          </div>
          <div className="order-2 space-y-6">
            <span className="inline-block font-headline font-bold text-sm tracking-widest text-primary uppercase">Wellness</span>
            <h2 className="font-headline text-4xl font-bold text-on-surface tracking-tight">Hồ bơi vô cực</h2>
            <p className="text-on-surface-variant leading-relaxed text-lg">
              Thả mình trong làn nước xanh mát với tầm nhìn bao trọn thành phố, một trải nghiệm không thể bỏ lỡ tại tầng thượng.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">pool</span>
                <span className="font-medium">Miễn phí cho khách lưu trú</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">straighten</span>
                <span className="font-medium">Độ sâu 1.2m - 1.6m</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">local_bar</span>
                <span className="font-medium">Phục vụ cocktail tại chỗ</span>
              </li>
            </ul>
            <button className="mt-4 px-8 py-3 rounded-lg border-2 border-primary-container text-primary font-bold hover:bg-primary-container/10 transition-all">
              Tìm hiểu thêm
            </button>
          </div>
        </section>

        {/* Section 3: Spa & Thư giãn */}
        <section className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 space-y-6">
            <span className="inline-block font-headline font-bold text-sm tracking-widest text-primary uppercase">Relaxation</span>
            <h2 className="font-headline text-4xl font-bold text-on-surface tracking-tight">Spa &amp; Thư giãn</h2>
            <p className="text-on-surface-variant leading-relaxed text-lg">
              Liệu trình chăm sóc sức khỏe chuyên sâu kết hợp tinh hoa truyền thống và hiện đại trong không gian tĩnh lặng tuyệt đối.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">spa</span>
                <span className="font-medium">Kỹ thuật viên chuyên nghiệp</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">thermostat</span>
                <span className="font-medium">Phòng xông hơi khô &amp; ướt</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">eco</span>
                <span className="font-medium">Tinh dầu thiên nhiên</span>
              </li>
            </ul>
            <button className="mt-4 px-8 py-3 rounded-lg border-2 border-primary-container text-primary font-bold hover:bg-primary-container/10 transition-all">
              Tìm hiểu thêm
            </button>
          </div>
          <div className="order-1 md:order-2">
            <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl transform md:rotate-1 hover:rotate-0 transition-transform duration-500">
              <img alt="Luxury Spa" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbcW-KMYyW3_RyLq847E-McaMctMMVBzp-J_Yk982fwN4vng8O0imkG96Jvu1t0BJnxWOXZnTXN2fX8jXLEP5GeU4MTA1bBDtAv3f3R6fZDuwEcLGDux3ULlGmOssU4JdEPYi4FK1kF6XqOX6SFShhufxoGqye3aVmJCuevjP43pfLpPEttalLBvTvzHALNhNljL1lOulgyTSChlALjm6iEr6WFjeJ2G9rvYOO-N6dEu0082m-ujt8SsmJn2nUlTJ6ZzR4YVxCIVSx" />
            </div>
          </div>
        </section>

        {/* Section 4: Phòng Gym */}
        <section className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-1">
            <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl transform md:-rotate-1 hover:rotate-0 transition-transform duration-500">
              <img alt="Modern Gym" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAD48k3Ce0CAdrO_UJyv3AeQo0FBOKLE6s4Sxps2rFTpWu4OAMxcFJmVoH5biV3dbBgORI2SpZe40ieCRS_aMVp53mfxw_vn7gV4WtX6bN7yYWzFluzwCQki2O_END8HeSxVn5SOKBgSlOG7sjWPCqLxtAOSYdE--v-8wCB4gjM-pcnluj0snIxzMMS-X_ZengN08l1I_BvTok8RdXwV2t3zX8nJdZtPaB5bFrFuQY1nmc7_f-6iemqsMaiJQEf13w4zSHlQ8bAQ5j6" />
            </div>
          </div>
          <div className="order-2 space-y-6">
            <span className="inline-block font-headline font-bold text-sm tracking-widest text-primary uppercase">Fitness</span>
            <h2 className="font-headline text-4xl font-bold text-on-surface tracking-tight">Phòng Gym</h2>
            <p className="text-on-surface-variant leading-relaxed text-lg">
              Duy trì vóc dáng và năng lượng trong kỳ nghỉ với trang thiết bị luyện tập tân tiến bậc nhất.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">fitness_center</span>
                <span className="font-medium">Máy chạy bộ Technogym</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">exercise</span>
                <span className="font-medium">Tạ tự do đa dạng</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">visibility</span>
                <span className="font-medium">Cửa kính nhìn ra công viên</span>
              </li>
            </ul>
            <button className="mt-4 px-8 py-3 rounded-lg border-2 border-primary-container text-primary font-bold hover:bg-primary-container/10 transition-all">
              Tìm hiểu thêm
            </button>
          </div>
        </section>

        {/* Section 5: Hội nghị & Sự kiện */}
        <section className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 space-y-6">
            <span className="inline-block font-headline font-bold text-sm tracking-widest text-primary uppercase">Business</span>
            <h2 className="font-headline text-4xl font-bold text-on-surface tracking-tight">Hội nghị &amp; Sự kiện</h2>
            <p className="text-on-surface-variant leading-relaxed text-lg">
              Không gian lý tưởng và chuyên nghiệp cho các buổi ký kết quan trọng, hội thảo quốc tế hay tiệc công ty.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">groups</span>
                <span className="font-medium">Sức chứa 200 khách</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">surround_sound</span>
                <span className="font-medium">Hệ thống âm thanh JBL</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">tv</span>
                <span className="font-medium">Màn hình LED P2.5</span>
              </li>
            </ul>
            <button className="mt-4 px-8 py-3 rounded-lg border-2 border-primary-container text-primary font-bold hover:bg-primary-container/10 transition-all">
              Tìm hiểu thêm
            </button>
          </div>
          <div className="order-1 md:order-2">
            <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl transform md:rotate-2 hover:rotate-0 transition-transform duration-500">
              <img alt="Conference Room" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqAqIn_ri6VMGMyOK6z2trDTRRLPzZM79Q1aIXHraASrwPtQAKJFb9QrntNwUWFOaXDo4UdCAB8eywiBv75y6iuC1H775nTYEaAlCz74DS2B2md-dJ4Q5zVnWnBag-0AzHO71X7e6qqydpxAlzLBzGDgnp1QxFhQjXzhegZvzt3fVU-9tAnau4aGZf9i5Hos39dD2aCtb3qBS1cWb5nb-nU1vuvTnTce4GekT8G_GeLbip4Y-4MTjEVYj7E7L33SuCIJ5djtDZssPk" />
            </div>
          </div>
        </section>
      </main>

      {/* Banner CTA Section */}
      <section className="max-w-7xl mx-auto px-8 py-16">
        <div className="bg-primary-container rounded-3xl p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
          {/* Decorative circle */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-on-primary-container/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 space-y-8 max-w-3xl mx-auto">
            <h2 className="font-headline text-3xl md:text-5xl font-extrabold text-white leading-tight">
              Sẵn sàng trải nghiệm kỳ nghỉ trong mơ? Đặt phòng ngay với ưu đãi 10%!
            </h2>
            <div className="flex justify-center">
              {/* <button className="bg-white text-primary-container px-10 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-xl">
                Đặt phòng ngay
              </button> */}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
