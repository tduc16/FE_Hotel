import StatCard from "@/components/admin/StatCard";
import RecentBookingsTable from "@/components/admin/RecentBookingsTable";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-headline font-bold text-on-surface">Tổng quan hệ thống</h1>
        <p className="text-on-surface-variant mt-1">
          Theo dõi các chỉ số và hoạt động mới nhất của khách sạn.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng doanh thu"
          value="45.2M ₫"
          icon="payments"
          trend={{ value: "+12.5% so với tháng trước", isPositive: true }}
        />
        <StatCard
          title="Đặt phòng mới"
          value="125"
          icon="book_online"
          trend={{ value: "+5.2% so với tháng trước", isPositive: true }}
        />
        <StatCard
          title="Tỷ lệ lấp đầy"
          value="78%"
          icon="meeting_room"
          trend={{ value: "-2.1% so với tháng trước", isPositive: false }}
        />
        <StatCard
          title="Đánh giá trung bình"
          value="4.8"
          icon="star"
          trend={{ value: "+0.2 so với tháng trước", isPositive: true }}
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RecentBookingsTable />
        </div>
        
        {/* Quick Actions / Activity Feed */}
        <div className="space-y-6">
          <div className="bg-surface-container-lowest rounded-xl shadow-[0_2px_12px_rgba(24,28,31,0.04)] border border-surface-container-highest p-6">
            <h3 className="text-lg font-headline font-bold text-on-surface mb-4">Thao tác nhanh</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 rounded-lg border border-surface-container-highest hover:bg-surface-container transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </div>
                  <span className="font-medium text-sm text-on-surface">Thêm phòng mới</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">chevron_right</span>
              </button>
              
              <button className="w-full flex items-center justify-between p-3 rounded-lg border border-surface-container-highest hover:bg-surface-container transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">event_available</span>
                  </div>
                  <span className="font-medium text-sm text-on-surface">Tạo đặt phòng</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
