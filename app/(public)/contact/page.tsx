export default function Contact() {
  return (
    <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
      {/* Hero Section Title */}
      <div className="mb-16 md:ml-32">
        <span className="label-md text-primary font-bold tracking-[0.2em] uppercase text-xs mb-4 block">Get in touch</span>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-on-surface max-w-2xl leading-[1.1]">
          Trò chuyện cùng chúng tôi
        </h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Contact Form */}
        <div className="lg:col-span-7 bg-surface-container-low p-8 md:p-12 rounded-xl">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">Họ và tên</label>
                <input className="w-full px-4 py-3 bg-surface-container-highest border-none rounded focus:ring-2 focus:ring-primary/20 transition-all outline-none" placeholder="Nguyễn Văn A" type="text" />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">Email</label>
                <input className="w-full px-4 py-3 bg-surface-container-highest border-none rounded focus:ring-2 focus:ring-primary/20 transition-all outline-none" placeholder="example@email.com" type="email" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">Số điện thoại</label>
              <input className="w-full px-4 py-3 bg-surface-container-highest border-none rounded focus:ring-2 focus:ring-primary/20 transition-all outline-none" placeholder="+84 000 000 000" type="tel" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">Nội dung tin nhắn</label>
              <textarea className="w-full px-4 py-3 bg-surface-container-highest border-none rounded focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none" placeholder="Bạn cần chúng tôi hỗ trợ điều gì?" rows={5}></textarea>
            </div>
            <button className="w-full md:w-auto px-12 py-4 bg-primary-container text-on-primary-container font-bold rounded-lg hover:brightness-110 transition-all scale-95 active:scale-90 shadow-lg shadow-primary-container/20" type="button">
              Gửi yêu cầu
            </button>
          </form>
        </div>
        {/* Right Column: Info & Map */}
        <div className="lg:col-span-5 space-y-8">
          <div className="grid grid-cols-1 gap-4">
            {/* Address Card */}
            <div className="bg-surface-container-lowest p-6 rounded-lg flex items-start gap-4 transition-transform hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined">location_on</span>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Địa chỉ</h4>
                <p className="text-on-surface font-medium">123 Đường Tầm, Quận 1, TP. HCM</p>
              </div>
            </div>
            {/* Phone Card */}
            <div className="bg-surface-container-lowest p-6 rounded-lg flex items-start gap-4 transition-transform hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined">call</span>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Hotline</h4>
                <p className="text-on-surface font-medium">+84 123 456 789</p>
              </div>
            </div>
            {/* Email Card */}
            <div className="bg-surface-container-lowest p-6 rounded-lg flex items-start gap-4 transition-transform hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined">mail</span>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Email</h4>
                <p className="text-on-surface font-medium">info@hoangminh.com</p>
              </div>
            </div>
          </div>
          {/* Google Maps Placeholder */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm group">
            <img alt="Bản đồ vị trí khách sạn" className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnYAcat1XxTgYx806oZSwsrrLVCTgBbiPYVvyyAo5tbjzwXRipYDgkN4b_-N8tU04t5QlZiIKNsozf6tMpaYdhKP29pQfqbA6bRg8cfvTRhpG6RljhPU3dbqp0t_psL4NA8EAtYPT5eZSZWcZTCHk2jp1fPAomzk8JE-X9-glJMg6xanW6u9ikKUep6FrA-PEQjQTutjbBaI0uaFZXCPMf-p0j9fPUqhXJKQ-dbwa_hGUCFwnboJ0Hx1eWgl4vhhMuACe3zRZm7035" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
              <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-2 shadow-xl">
                <span className="material-symbols-outlined text-primary">map</span>
                <span className="text-sm font-bold text-on-surface">Mở Bản đồ</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="mt-32 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-on-surface mb-2">Câu hỏi thường gặp</h2>
          <div className="h-1 w-20 bg-primary mx-auto rounded-full"></div>
        </div>
        <div className="space-y-4">
          {/* Accordion Item 1 */}
          <details className="group bg-surface-container-low rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden" open>
            <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-surface-container transition-colors">
              <h3 className="font-bold text-on-surface">Giờ nhận phòng và trả phòng là khi nào?</h3>
              <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180">expand_more</span>
            </summary>
            <div className="px-6 pb-6 text-on-surface-variant leading-relaxed">
              Thời gian nhận phòng tiêu chuẩn là từ 14:00 và thời gian trả phòng là trước 12:00 trưa. Nếu quý khách có nhu cầu nhận phòng sớm hoặc trả phòng muộn, vui lòng liên hệ trước với chúng tôi để được hỗ trợ tốt nhất tùy theo tình trạng phòng trống.
            </div>
          </details>
          {/* Accordion Item 2 */}
          <details className="group bg-surface-container-low rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-surface-container transition-colors">
              <h3 className="font-bold text-on-surface">Khách sạn có dịch vụ đưa đón sân bay không?</h3>
              <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180">expand_more</span>
            </summary>
            <div className="px-6 pb-6 text-on-surface-variant leading-relaxed">
              Có, chúng tôi cung cấp dịch vụ đưa đón sân bay 24/7 với đa dạng các dòng xe từ 4 đến 16 chỗ. Quý khách vui lòng cung cấp thông tin chuyến bay ít nhất 24 giờ trước khi đến để chúng tôi sắp xếp chu đáo.
            </div>
          </details>
          {/* Accordion Item 3 */}
          <details className="group bg-surface-container-low rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-surface-container transition-colors">
              <h3 className="font-bold text-on-surface">Chính sách hủy phòng như thế nào?</h3>
              <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180">expand_more</span>
            </summary>
            <div className="px-6 pb-6 text-on-surface-variant leading-relaxed">
              Chính sách hủy phòng phụ thuộc vào loại giá phòng quý khách đã đặt. Thông thường, quý khách có thể hủy miễn phí trước 48 giờ tính từ ngày nhận phòng. Các yêu cầu hủy sau thời gian này có thể phát sinh phí tương đương với giá đêm đầu tiên.
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
