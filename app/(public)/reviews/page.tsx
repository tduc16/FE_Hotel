export default function Reviews() {
  return (
    <>
      {/* Hero Banner Section */}
      <header className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img className="w-full h-full object-cover" alt="Happy couple at sunset" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_B1TsFPDc_E-bojt7v3eh3uuuxDwJFfydYkvm7Cig6o162Qe6AkiU8ZErcyelVaiEsvbwVaz5BUuGWMe2LD9SNu-27OYjN4xd78GPrhJW_ieceRHx9ZXpAolByv2ldFVmhwqUSSxmQ1C2GqPh-V84fzq4--zVKGBkL8Pv1IfqHSJFYPRqhxv4GPaoIktBvZHCu_PADBhDwosoYysEZBsZ8s7NhHfT9BvDuyMUdIPy9I6UGbKYXBLA91NuHzFgwmHg1WvdhxbfPb6w" />
          <div className="absolute inset-0 bg-gradient-to-r from-on-surface/60 via-on-surface/30 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 mt-20 lg:mt-32">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white font-headline mb-6 leading-tight">
              Khách hàng nói gì về chúng tôi
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-light leading-relaxed mb-8">
              Cùng nghe những nhận xét chân thực từ hàng ngàn du khách đã lựa chọn Hotel Hoang Minh cho kỳ nghỉ của mình.
            </p>
          </div>
        </div>
      </header>

      {/* Overview Stats Section */}
      <section className="relative -mt-16 z-20 max-w-7xl mx-auto px-6">
        <div className="bg-surface-container-lowest rounded-xl shadow-xl p-8 md:p-12 flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-shrink-0 text-center lg:border-r border-outline-variant/30 lg:pr-12">
            <div className="text-7xl font-extrabold text-primary font-headline">4.8</div>
            <div className="flex justify-center text-tertiary my-2">
              <span className="material-symbols-outlined fill-icon">star</span>
              <span className="material-symbols-outlined fill-icon">star</span>
              <span className="material-symbols-outlined fill-icon">star</span>
              <span className="material-symbols-outlined fill-icon">star</span>
              <span className="material-symbols-outlined fill-icon">star_half</span>
            </div>
            <div className="text-sm font-bold uppercase tracking-widest text-on-surface-variant font-label">Trên 5.0 Điểm</div>
            <div className="mt-1 text-slate-400 text-xs">Dựa trên 2,450 đánh giá</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 w-full">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold text-on-surface">
                <span>Cleanliness</span>
                <span>4.9</span>
              </div>
              <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '98%' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold text-on-surface">
                <span>Location</span>
                <span>4.7</span>
              </div>
              <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '94%' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold text-on-surface">
                <span>Service</span>
                <span>5.0</span>
              </div>
              <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold text-on-surface">
                <span>Amenities</span>
                <span>4.8</span>
              </div>
              <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '96%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Review Cards Grid */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {/* Card 1 */}
          <div className="break-inside-avoid bg-surface-container-low p-8 rounded-xl flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <img className="w-12 h-12 rounded-full object-cover" alt="Portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1KeBWjQO1NcOne_TgRnBJi9u2AZQVgo4fGIQ1XG7LUDcLmocsf1wB9ncu99G7gTr_dl5RCswUaO4BAuxex2HBubR8c5K4IUWUG7bf65grzIzYyydz8FSFlpLdNSUfQUmYhvhqaM65IF9J7RrQTgwyYx6yhY20xR0UwfLnPxfbBWJlXChEYqQ0n6VX6r21SyBU3rGjiLyZLqOKgdTAhhZOE0n91ZgXfmTf68usJ2ZdhdCjXUsl8EwtSDYPuMD4nVD9_ZbmqoRlN8to" />
              <div>
                <h4 className="font-bold text-on-surface">Nguyễn Minh Anh</h4>
                <p className="text-xs text-on-surface-variant font-label">Tháng 3, 2026 • Deluxe Room</p>
              </div>
            </div>
            <div className="flex text-tertiary text-sm">
              <span className="material-symbols-outlined fill-icon">star</span>
              <span className="material-symbols-outlined fill-icon">star</span>
              <span className="material-symbols-outlined fill-icon">star</span>
              <span className="material-symbols-outlined fill-icon">star</span>
              <span className="material-symbols-outlined fill-icon">star</span>
            </div>
            <p className="text-on-surface-variant leading-relaxed">
              Trải nghiệm tuyệt vời! Khách sạn có không gian rất yên tĩnh và sang trọng. Nhân viên phục vụ cực kỳ chu đáo, đặc biệt là dịch vụ phòng luôn sạch sẽ mỗi ngày. Tôi chắc chắn sẽ quay lại.
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
              <button className="flex items-center gap-2 text-primary text-sm font-medium hover:opacity-80 transition-opacity">
                <span className="material-symbols-outlined text-lg">thumb_up</span>
                Hữu ích
              </button>
              <button className="text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-lg">share</span>
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="break-inside-avoid bg-surface-container-low p-8 rounded-xl flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <img className="w-12 h-12 rounded-full object-cover" alt="Portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoT2b-_m1TkeKp7lWqziFNY-UyLRLOzcdsn8zmqqrniI7AeucDUH3yLu3BhbEjka_9sHlWUXe5cVM_DUg4C83wyUew-jz_srubXprNpaqgX8WSWZwkaJPi6W1TuL3FTWoSn32BKBI8OpcZyYrnqrZg4Z5r2CCrg3OETwLNDSA5ULaakU7cYO_AHWGCEntA0FmhQBN7sif3600Qu_xFhWxdSa2ui5v-YbhtFhrbdlBwCnEwvzr3MiB81Z0ARok-ygwxFx-Bdx5w7Cq0" />
              <div>
                <h4 className="font-bold text-on-surface">Lê Hoàng Nam</h4>
                <p className="text-xs text-on-surface-variant font-label">Tháng 2, 2026 • Suite Ocean View</p>
              </div>
            </div>
            <div className="flex text-tertiary text-sm">
              <span className="material-symbols-outlined fill-icon">star</span>
              <span className="material-symbols-outlined fill-icon">star</span>
              <span className="material-symbols-outlined fill-icon">star</span>
              <span className="material-symbols-outlined fill-icon">star</span>
              <span className="material-symbols-outlined fill-icon">star</span>
            </div>
            <p className="text-on-surface-variant leading-relaxed">
              Vị trí khách sạn rất thuận tiện để di chuyển. View từ phòng Suite nhìn ra biển thực sự là một "tuyệt phẩm". Đồ ăn sáng đa dạng và ngon miệng. Một nơi nghỉ dưỡng đúng nghĩa.
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
              <button className="flex items-center gap-2 text-primary text-sm font-medium hover:opacity-80 transition-opacity">
                <span className="material-symbols-outlined text-lg">thumb_up</span>
                Hữu ích (12)
              </button>
              <button className="text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-lg">share</span>
              </button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="break-inside-avoid bg-surface-container-low p-8 rounded-xl flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <img className="w-12 h-12 rounded-full object-cover" alt="Portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrsInDVzuTyiIG3cNyIpaVyQzoB_wgjHXe7ZXfaOf9fwSJvIGcLkauoOgDkolnjGg4ffoxygabbbbY0dqAXiLwbaMyz6ZoMTZHhHOTYv0VrgLRKgrLeXxvxf7tJ5PZ3ZRFnY9KS9en3llZTuYQXc58DhiCGQkWbuKsJjD_qb13c65uCRAt7vCyqEI4uj0gLcgKdWDF-qcpC4i5LD_7u2lsMy2oINGIxwKKvvQ0FNErdGO7JX89qSJGPii6kupTorsQo0yy7bI2YxzP" />
              <div>
                <h4 className="font-bold text-on-surface">Trần Thị Thu</h4>
                <p className="text-xs text-on-surface-variant font-label">Tháng 1, 2026 • Family Room</p>
              </div>
            </div>
            <div className="flex text-tertiary text-sm">
              <span className="material-symbols-outlined fill-icon">star</span>
              <span className="material-symbols-outlined fill-icon">star</span>
              <span className="material-symbols-outlined fill-icon">star</span>
              <span className="material-symbols-outlined fill-icon">star</span>
              <span className="material-symbols-outlined fill-icon">star</span>
            </div>
            <p className="text-on-surface-variant leading-relaxed">
              Gia đình tôi đã có một kỳ nghỉ tết đáng nhớ tại đây. Các con tôi rất thích khu vực hồ bơi và khu vui chơi. Sự nồng hậu của đội ngũ nhân viên khiến chúng tôi cảm thấy như đang ở nhà.
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
              <button className="flex items-center gap-2 text-primary text-sm font-medium hover:opacity-80 transition-opacity">
                <span className="material-symbols-outlined text-lg">thumb_up</span>
                Hữu ích
              </button>
              <button className="text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-lg">share</span>
              </button>
            </div>
          </div>

          {/* Card 4 */}
          <div className="break-inside-avoid bg-surface-container-low p-8 rounded-xl flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <img className="w-12 h-12 rounded-full object-cover" alt="Portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuASR8a4lN6ooe7QgyuFpmVh2CYwLuoggzAZezXX5LnFRnYweDvhdTGqBq2__GuVJb-86RqKje0vCKdzO2-x6NA58Asjz2dEzycKPJVjIjdhohL2De3a78zo55n2G4UkfAhI02SJqvd-NglNRrrWh3Y1s996Z4XUCZyUP9aLlTi_QkN-JhwUD4eHZZGJZbto0mR11HGWrvPXuBSPE0qo0fNNVoHYm28YM9fu83NX5hmDvOp6ZghGj1Zo5j33xXMP0M8mT-nYSPgHgIlp" />
              <div>
                <h4 className="font-bold text-on-surface">Phạm Quốc Bảo</h4>
                <p className="text-xs text-on-surface-variant font-label">Tháng 3, 2026 • Standard King</p>
              </div>
            </div>
            <div className="flex text-tertiary text-sm">
              <span className="material-symbols-outlined fill-icon">star</span>
              <span className="material-symbols-outlined fill-icon">star</span>
              <span className="material-symbols-outlined fill-icon">star</span>
              <span className="material-symbols-outlined fill-icon">star</span>
              <span className="material-symbols-outlined fill-icon">star</span>
            </div>
            <p className="text-on-surface-variant leading-relaxed">
              Rất ấn tượng với thiết kế của khách sạn. Mọi góc nhỏ đều có thể chụp ảnh đẹp. Dịch vụ spa ở đây cũng rất chất lượng, giúp tôi thư giãn tuyệt đối sau chuyến bay dài.
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
              <button className="flex items-center gap-2 text-primary text-sm font-medium hover:opacity-80 transition-opacity">
                <span className="material-symbols-outlined text-lg">thumb_up</span>
                Hữu ích (5)
              </button>
              <button className="text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-lg">share</span>
              </button>
            </div>
          </div>

          {/* Card 5 */}
          <div className="break-inside-avoid bg-surface-container-low p-8 rounded-xl flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <img className="w-12 h-12 rounded-full object-cover" alt="Portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-iiepPIbFx9HMxcdgEMa-W_oMoPFGYcy1Dm3WiG-t4vT1sr4Nd3IHNIyQXEsgddidZjlUwLW3QRbdapP-nU5p3wgdGnSQ0RqWZ4hHpKHizRa-XF-vPkOgE2PZA3SBmG3sHcLeeOqwSPeVrxGKCaXcEyXByfBblt6udriM2BpFAn2Ob8b0bv66bRbb71hN7jSuTdyIjQlbZsFhZZAHPimIkKhu6j-9mY8UqUAhZKYhggHakgXUKiU1V40qOFjBVlBF3IVF8tI_05TS" />
              <div>
                <h4 className="font-bold text-on-surface">Đỗ Mỹ Linh</h4>
                <p className="text-xs text-on-surface-variant font-label">Tháng 12, 2025 • Honeymoon Suite</p>
              </div>
            </div>
            <div className="flex text-tertiary text-sm">
              <span className="material-symbols-outlined fill-icon">star</span>
              <span className="material-symbols-outlined fill-icon">star</span>
              <span className="material-symbols-outlined fill-icon">star</span>
              <span className="material-symbols-outlined fill-icon">star</span>
              <span className="material-symbols-outlined fill-icon">star</span>
            </div>
            <p className="text-on-surface-variant leading-relaxed">
              Khách sạn đã chuẩn bị bất ngờ cho vợ chồng tôi nhân dịp trăng mật. Sự tinh tế này thực sự ghi điểm lớn. Phòng ốc cực kỳ sang chảnh và riêng tư. Cảm ơn Hoang Minh Hotel rất nhiều!
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
              <button className="flex items-center gap-2 text-primary text-sm font-medium hover:opacity-80 transition-opacity">
                <span className="material-symbols-outlined text-lg">thumb_up</span>
                Hữu ích (21)
              </button>
              <button className="text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-lg">share</span>
              </button>
            </div>
          </div>

          {/* Card 6 */}
          <div className="break-inside-avoid bg-surface-container-low p-8 rounded-xl flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <img className="w-12 h-12 rounded-full object-cover" alt="Portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAroM0YhVO5eU6zd6UB_stdDbIrTlbyDmeTTc5jmejZhjSoVMqAwh1F2pFKaHrxxYJrozRXYythoYB_5y8RG0Zu6CkVcnW7ZvS5a9bK80DevVUm5Pb7-kHTVYbs3p8qUZf0LkWhLRTakpH0nLrefU3HwOhuA-dKjuF6SmFJWCDrS5YFhKzcwAkLE3SmeIPjVMwO2GwwFGHDbipkuocpJ2xMIp9U4Py3nSNNKtigOw4ALC6th86Hf8enkXaCM1964DwIo97ikkC7Yizh" />
              <div>
                <h4 className="font-bold text-on-surface">Vũ Quang Huy</h4>
                <p className="text-xs text-on-surface-variant font-label">Tháng 2, 2026 • Deluxe Twin</p>
              </div>
            </div>
            <div className="flex text-tertiary text-sm">
              <span className="material-symbols-outlined fill-icon">star</span>
              <span className="material-symbols-outlined fill-icon">star</span>
              <span className="material-symbols-outlined fill-icon">star</span>
              <span className="material-symbols-outlined fill-icon">star</span>
              <span className="material-symbols-outlined fill-icon">star_outline</span>
            </div>
            <p className="text-on-surface-variant leading-relaxed">
              Kỳ nghỉ rất hài lòng. Wifi ổn định giúp tôi có thể xử lý công việc từ xa hiệu quả. Các tiện ích khác đều đúng như mô tả trên website. Sẽ giới thiệu cho bạn bè.
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
              <button className="flex items-center gap-2 text-primary text-sm font-medium hover:opacity-80 transition-opacity">
                <span className="material-symbols-outlined text-lg">thumb_up</span>
                Hữu ích
              </button>
              <button className="text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-lg">share</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner Section */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <div className="bg-primary-container rounded-xl overflow-hidden relative p-12 lg:p-16">
          <div className="absolute inset-0 opacity-10">
            <div className="h-full w-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center md:text-left">
              <h3 className="text-3xl md:text-4xl font-bold font-headline text-on-primary-container mb-4">
                Trở thành khách hàng tiếp theo trải nghiệm dịch vụ tuyệt vời tại Hotel Hoang Minh!
              </h3>
            </div>
            {/* <button className="bg-primary text-on-primary px-10 py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 whitespace-nowrap">
              Đặt phòng ngay
            </button> */}
          </div>
        </div>
      </section>
    </>
  );
}
