"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { dashboardService } from "@/services/dashboard.service";

interface SummaryCardProps {
  title: string;
  value: string | number;
  growth: number;
  icon: string;
  colorClass: string;
}

function StatCard({ title, value, growth, icon, colorClass }: SummaryCardProps) {
  const isPositive = growth >= 0;
  const growthText = isPositive ? `+${growth}%` : `${growth}%`;

  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10 flex items-center justify-between transition-all hover:shadow-md">
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{title}</span>
        <h3 className="text-3xl font-extrabold text-on-surface tracking-tight">{value}</h3>
        <div className="flex items-center gap-1 text-xs font-bold">
          <span
            className={`material-symbols-outlined text-[16px] ${
              isPositive ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {isPositive ? "trending_up" : "trending_down"}
          </span>
          <span className={isPositive ? "text-emerald-500" : "text-rose-500"}>{growthText}</span>
          <span className="text-on-surface-variant font-medium">so với tháng trước</span>
        </div>
      </div>
      <div className={`p-4 rounded-xl ${colorClass}`}>
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("30days");
  
  // State Tooltip cho SVG Line Chart
  const [activePoint, setActivePoint] = useState<{ x: number; y: number; label: string; value: number } | null>(null);

  const fetchDashboard = useCallback(async (currentFilter: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await dashboardService.getDashboardData(currentFilter);
      setData(result);
    } catch (err: any) {
      console.error("Dashboard load failed:", err);
      if (err.message === "UNAUTHORIZED") {
        toast.error("Phiên đăng nhập admin đã hết hạn");
        localStorage.removeItem("admin_access_token");
        localStorage.removeItem("admin_info");
        router.push("/admin/login");
      } else {
        setError(err.message || "Không thể tải dữ liệu thống kê khách sạn.");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDashboard(filter);
  }, [filter, fetchDashboard]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const getMembershipBadge = (level: string) => {
    const badges: { [key: string]: string } = {
      PLATINUM: "bg-purple-100 text-purple-800 border-purple-200",
      GOLD: "bg-amber-100 text-amber-800 border-amber-200",
      SILVER: "bg-slate-200 text-slate-800 border-slate-300",
      STANDARD: "bg-blue-100 text-blue-800 border-blue-200",
    };
    return badges[level] || badges.STANDARD;
  };

  const getBookingStatusBadge = (status: string) => {
    const badges: { [key: string]: string } = {
      CONFIRMED: "bg-emerald-100 text-emerald-800",
      CHECKED_IN: "bg-blue-100 text-blue-800",
      CHECKED_OUT: "bg-gray-100 text-gray-800",
      PENDING: "bg-amber-100 text-amber-800",
      CANCELLED: "bg-rose-100 text-rose-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 bg-surface-container-high w-1/4 rounded"></div>
        {/* KPI Skeleton Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-surface-container-lowest rounded-2xl border border-outline-variant/10"></div>
          ))}
        </div>
        {/* Main Body Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="h-80 bg-surface-container-lowest rounded-2xl border border-outline-variant/10"></div>
            <div className="h-80 bg-surface-container-lowest rounded-2xl border border-outline-variant/10"></div>
          </div>
          <div className="space-y-8">
            <div className="h-80 bg-surface-container-lowest rounded-2xl border border-outline-variant/10"></div>
            <div className="h-80 bg-surface-container-lowest rounded-2xl border border-outline-variant/10"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center">
        <div className="bg-error-container/20 p-8 rounded-2xl border border-error/20">
          <span className="material-symbols-outlined text-error text-5xl mb-4">error</span>
          <h2 className="text-xl font-bold text-on-surface mb-2">Lỗi tải dữ liệu</h2>
          <p className="text-on-surface-variant mb-6">{error}</p>
          <button
            onClick={() => fetchDashboard(filter)}
            className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold hover:brightness-110 transition-all inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">refresh</span>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // --- LOGIC VẼ BIỂU ĐỒ SVG LINE CHART (REVENUE TREND) ---
  const chartData = data?.revenueChart || [];
  const maxRevenue = Math.max(...chartData.map((d: any) => d.revenue), 1000000);
  const chartWidth = 500;
  const chartHeight = 180;
  const paddingX = 40;
  const paddingY = 20;

  // Tính toán tọa độ (x, y) cho từng điểm dữ liệu
  const points = chartData.map((d: any, i: number) => {
    const x = paddingX + (i / (chartData.length - 1 || 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - (d.revenue / maxRevenue) * (chartHeight - paddingY * 2);
    return { x, y, label: d.label, value: d.revenue };
  });

  // Tạo chuỗi path d cho thẻ SVG
  const linePath = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p: any) => `L ${p.x} ${p.y}`).join(" ")
    : "";

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
    : "";

  // --- LOGIC VẼ BIỂU ĐỒ SVG DONUT CHART (ROOM STATUS) ---
  const rStatus = data?.roomStatus || { available: 0, occupied: 0, cleaning: 0, maintenance: 0 };
  const roomTotal = rStatus.available + rStatus.occupied + rStatus.cleaning + rStatus.maintenance;
  
  const donutData = [
    { label: "Trống", value: rStatus.available, color: "stroke-emerald-500", fill: "text-emerald-500" },
    { label: "Có khách", value: rStatus.occupied, color: "stroke-indigo-500", fill: "text-indigo-500" },
    { label: "Đang dọn dẹp", value: rStatus.cleaning, color: "stroke-amber-500", fill: "text-amber-500" },
    { label: "Bảo trì", value: rStatus.maintenance, color: "stroke-rose-500", fill: "text-rose-500" },
  ];

  let accumulatedPercent = 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">Tổng quan khách sạn</h1>
          <p className="text-on-surface-variant mt-1">
            Hệ thống giám sát vận hành và phân tích kinh doanh thời gian thực.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/rooms"
            className="px-4 py-2 border border-outline-variant/30 text-on-surface-variant text-sm font-bold rounded-lg hover:bg-surface-container transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">meeting_room</span>
            Quản lý phòng
          </Link>
          <Link
            href="/admin/bookings"
            className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:brightness-110 transition-all flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">book_online</span>
            Tạo đặt phòng
          </Link>
        </div>
      </div>

      {/* Section 1: KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng doanh thu"
          value={formatCurrency(data?.summary?.totalRevenue || 0)}
          growth={data?.summary?.revenueGrowth || 0}
          icon="payments"
          colorClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Đặt phòng"
          value={data?.summary?.totalBookings || 0}
          growth={data?.summary?.bookingGrowth || 0}
          icon="book_online"
          colorClass="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          title="Tỷ lệ lấp đầy"
          value={`${data?.summary?.occupancyRate || 0}%`}
          growth={data?.summary?.occupancyGrowth || 0}
          icon="meeting_room"
          colorClass="bg-purple-50 text-purple-600"
        />
        <StatCard
          title="Khách hàng mới"
          value={data?.summary?.newCustomers || 0}
          growth={data?.summary?.customerGrowth || 0}
          icon="group"
          colorClass="bg-blue-50 text-blue-600"
        />
      </div>

      {/* Section 2: Today's Operations */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10">
        <h3 className="text-lg font-bold text-on-surface mb-6 uppercase tracking-wider text-primary">Vận hành hôm nay</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined">login</span>
            </div>
            <div>
              <div className="text-2xl font-black text-on-surface">{data?.todayStats?.checkInsToday || 0}</div>
              <div className="text-xs text-on-surface-variant font-medium">Lượt Check-in hôm nay</div>
            </div>
          </div>
          
          <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
              <span className="material-symbols-outlined">logout</span>
            </div>
            <div>
              <div className="text-2xl font-black text-on-surface">{data?.todayStats?.checkOutsToday || 0}</div>
              <div className="text-xs text-on-surface-variant font-medium">Lượt Check-out hôm nay</div>
            </div>
          </div>

          <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <span className="material-symbols-outlined">edit_calendar</span>
            </div>
            <div>
              <div className="text-2xl font-black text-on-surface">{data?.todayStats?.bookingsToday || 0}</div>
              <div className="text-xs text-on-surface-variant font-medium">Booking tạo hôm nay</div>
            </div>
          </div>

          <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-lg font-black text-on-surface truncate">{formatCurrency(data?.todayStats?.revenueToday || 0)}</div>
              <div className="text-xs text-on-surface-variant font-medium">Thu về hôm nay</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Section 3: Revenue Trend & Recent Bookings */}
        <div className="lg:col-span-2 space-y-8">
          {/* Revenue Trend Line Chart */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10 relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-on-surface uppercase tracking-wider text-primary">Xu hướng doanh thu</h3>
              <div className="flex bg-surface-container-high rounded-lg p-1 text-xs font-bold">
                {["7days", "30days", "12months"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilter(t)}
                    className={`px-3 py-1.5 rounded-md transition-all ${
                      filter === t 
                        ? "bg-surface-container-lowest text-primary shadow-sm" 
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {t === "7days" ? "7 ngày" : t === "30days" ? "30 ngày" : "12 tháng"}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Interactive Area/Line Chart */}
            <div className="relative w-full h-[180px] bg-surface-container-lowest rounded-xl">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-on-surface-variant">
                  Không có dữ liệu biểu đồ.
                </div>
              ) : (
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Lưới ngang mờ */}
                  {Array.from({ length: 4 }).map((_, idx) => {
                    const y = paddingY + (idx / 3) * (chartHeight - paddingY * 2);
                    return (
                      <line
                        key={idx}
                        x1={paddingX}
                        y1={y}
                        x2={chartWidth - paddingX}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeDasharray="4 4"
                      />
                    );
                  })}

                  {/* Gradient Area */}
                  <path d={areaPath} fill="url(#chartGradient)" />

                  {/* Line */}
                  <path d={linePath} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Trục X label */}
                  {points.map((p: any, idx: number) => {
                    // Chỉ hiển thị nhãn cách quãng để không bị đè chữ
                    const interval = Math.max(Math.ceil(points.length / 6), 1);
                    if (idx % interval !== 0 && idx !== points.length - 1) return null;
                    return (
                      <text
                        key={idx}
                        x={p.x}
                        y={chartHeight - 4}
                        textAnchor="middle"
                        fill="#64748b"
                        className="text-[9px] font-bold"
                      >
                        {p.label}
                      </text>
                    );
                  })}

                  {/* Các điểm tròn dữ liệu */}
                  {points.map((p: any, idx: number) => (
                    <circle
                      key={idx}
                      cx={p.x}
                      cy={p.y}
                      r="4"
                      className="fill-white stroke-indigo-600 stroke-2 cursor-pointer hover:r-6 hover:stroke-indigo-800 transition-all"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setActivePoint({
                          x: p.x,
                          y: p.y,
                          label: p.label,
                          value: p.value,
                        });
                      }}
                      onMouseLeave={() => setActivePoint(null)}
                    />
                  ))}
                </svg>
              )}

              {/* Tooltip khi Hover vào Point */}
              {activePoint && (
                <div
                  className="absolute z-10 bg-slate-900/95 text-white p-3 rounded-lg text-xs shadow-xl pointer-events-none"
                  style={{
                    left: `${(activePoint.x / chartWidth) * 100}%`,
                    top: `${(activePoint.y / chartHeight) * 100 - 32}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div className="font-extrabold">{activePoint.label}</div>
                  <div className="font-semibold text-indigo-300 mt-1">{formatCurrency(activePoint.value)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Recent Bookings Table */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-on-surface uppercase tracking-wider text-primary">Đặt phòng gần đây</h3>
              <Link href="/admin/bookings" className="text-primary text-xs font-extrabold hover:underline">
                Xem tất cả
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-surface-container-high text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    <th className="pb-3">Mã đơn</th>
                    <th className="pb-3">Khách hàng</th>
                    <th className="pb-3">Hạng phòng</th>
                    <th className="pb-3">Tổng cộng</th>
                    <th className="pb-3">Trạng thái</th>
                    <th className="pb-3">Ngày đặt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high">
                  {data?.recentBookings?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-on-surface-variant">
                        Không phát hiện đơn đặt phòng gần đây.
                      </td>
                    </tr>
                  ) : (
                    data?.recentBookings?.map((booking: any) => (
                      <tr key={booking.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-3 font-bold text-on-surface">{booking.booking_code}</td>
                        <td className="py-3 font-semibold text-on-surface">{booking.customer_name}</td>
                        <td className="py-3 text-on-surface-variant font-medium">{booking.roomCategory?.name || "N/A"}</td>
                        <td className="py-3 font-bold text-primary">{formatCurrency(booking.total_amount)}</td>
                        <td className="py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getBookingStatusBadge(booking.booking_status)}`}>
                            {booking.booking_status}
                          </span>
                        </td>
                        <td className="py-3 text-on-surface-variant text-xs font-medium">
                          {new Date(booking.created_at).toLocaleDateString("vi-VN")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Room Status (Donut Chart) & Top Rankings */}
        <div className="space-y-8">
          {/* Section 4: Room Status Donut Chart */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10">
            <h3 className="font-bold text-on-surface uppercase tracking-wider mb-6 text-primary">Trạng thái phòng</h3>
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Donut Chart SVG */}
              <div className="relative w-36 h-36 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
                  
                  {roomTotal > 0 && donutData.map((d: any) => {
                    const percent = (d.value / roomTotal) * 100;
                    if (percent === 0) return null;
                    const strokeDasharray = `${percent} ${100 - percent}`;
                    const strokeDashoffset = 100 - accumulatedPercent;
                    accumulatedPercent += percent;

                    return (
                      <circle
                        key={d.label}
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        className={`${d.color}`}
                        strokeWidth="3.5"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                      />
                    );
                  })}
                </svg>
                {/* Text ở tâm Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-on-surface">{roomTotal}</span>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Tổng phòng</span>
                </div>
              </div>

              {/* Legends */}
              <div className="flex-1 space-y-3 w-full">
                {donutData.map((d: any) => (
                  <div key={d.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 font-medium text-on-surface-variant">
                      <span className={`w-3 h-3 rounded-full ${d.fill.replace("text-", "bg-")}`}></span>
                      <span>{d.label}</span>
                    </div>
                    <span className="font-bold text-on-surface">{d.value} phòng</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 8: Admin Alerts */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10">
            <h3 className="font-bold text-on-surface uppercase tracking-wider mb-4 text-primary">Cảnh báo hệ thống</h3>
            <div className="space-y-3">
              {data?.alerts?.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined">check_circle</span>
                  <span className="font-medium">Mọi hoạt động vận hành đều ổn định.</span>
                </div>
              ) : (
                data?.alerts?.map((alert: string, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-sm flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-rose-600 mt-0.5 text-[18px]">warning</span>
                    <span className="font-medium leading-relaxed">{alert}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Section 6: Top Rooms Category */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10">
          <h3 className="font-bold text-on-surface uppercase tracking-wider mb-6 text-primary">Hạng phòng bán chạy</h3>
          
          <div className="space-y-5">
            {data?.topRooms?.length === 0 ? (
              <div className="text-center py-8 text-sm text-on-surface-variant">Chưa có dữ liệu đặt phòng.</div>
            ) : (
              data?.topRooms?.map((room: any, idx: number) => {
                const maxCount = Math.max(...data.topRooms.map((r: any) => r.bookingCount), 1);
                const percent = (room.bookingCount / maxCount) * 100;
                
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-on-surface">{room.roomName}</span>
                      <span className="font-semibold text-on-surface-variant">{room.bookingCount} lượt đặt</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Section 7: Top Customers */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10">
          <h3 className="font-bold text-on-surface uppercase tracking-wider mb-6 text-primary">Khách hàng chi tiêu cao</h3>
          
          <div className="divide-y divide-surface-container-high">
            {data?.topCustomers?.length === 0 ? (
              <div className="text-center py-8 text-sm text-on-surface-variant">Chưa có dữ liệu khách hàng.</div>
            ) : (
              data?.topCustomers?.map((cust: any, idx: number) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <div className="font-bold text-on-surface truncate">{cust.customerName}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider ${getMembershipBadge(cust.membershipLevel)}`}>
                        {cust.membershipLevel}
                      </span>
                      <span className="text-xs font-semibold text-on-surface-variant">{cust.bookingCount} đặt phòng</span>
                    </div>
                  </div>
                  <div className="text-right font-extrabold text-primary shrink-0">
                    {formatCurrency(cust.totalSpent)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section 9: Booking Calendar (Occupancy Calendar 30 Days Future) */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-on-surface uppercase tracking-wider text-primary">Công suất 30 ngày tới</h3>
            <div className="flex gap-3 text-[10px] font-extrabold text-on-surface-variant">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-100 border border-emerald-300"></span>&lt;30%</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-100 border border-amber-300"></span>30-70%</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-100 border border-rose-300"></span>&gt;70%</span>
            </div>
          </div>

          {/* Grid hiển thị 30 ngày */}
          <div className="grid grid-cols-6 gap-2">
            {data?.bookingCalendar?.map((day: any, idx: number) => {
              const d = new Date(day.date);
              const dayNum = d.getDate();
              const monthNum = d.getMonth() + 1;
              const percent = day.occupancyPercent;

              // Xác định màu nền dựa vào tỷ lệ lấp đầy
              let bgClass = "bg-emerald-50 border-emerald-200 text-emerald-800";
              if (percent >= 30 && percent <= 70) {
                bgClass = "bg-amber-50 border-amber-200 text-amber-800";
              } else if (percent > 70) {
                bgClass = "bg-rose-50 border-rose-200 text-rose-800";
              }

              return (
                <div
                  key={idx}
                  className={`border p-2 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all hover:scale-105 ${bgClass}`}
                  title={`Ngày ${day.date}: lấp đầy ${percent}%`}
                >
                  <span className="text-[10px] font-black">{dayNum}/{monthNum}</span>
                  <span className="text-xs font-black">{percent}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
