"use client";

import React from "react";

// Mock data until API is implemented
const MOCK_BOOKINGS = [
  { id: "BK0124", guest: "Nguyễn Văn A", room: "101", checkIn: "24/10/2026", status: "confirmed", amount: "1,200,000 ₫" },
  { id: "BK0125", guest: "Trần Thị B", room: "205", checkIn: "25/10/2026", status: "pending", amount: "800,000 ₫" },
  { id: "BK0126", guest: "Lê Văn C", room: "302", checkIn: "25/10/2026", status: "cancelled", amount: "1,500,000 ₫" },
  { id: "BK0127", guest: "Phạm Thị D", room: "102", checkIn: "26/10/2026", status: "confirmed", amount: "1,200,000 ₫" },
];

export default function RecentBookingsTable() {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-[0_2px_12px_rgba(24,28,31,0.04)] border border-surface-container-highest overflow-hidden">
      <div className="px-6 py-5 border-b border-surface-container-highest flex justify-between items-center">
        <h3 className="text-lg font-headline font-bold text-on-surface">Đặt phòng gần đây</h3>
        <button className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
          Xem tất cả
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-lowest text-on-surface-variant text-sm border-b border-surface-container-highest">
              <th className="py-4 px-6 font-medium">Mã Đặt</th>
              <th className="py-4 px-6 font-medium">Khách hàng</th>
              <th className="py-4 px-6 font-medium">Phòng</th>
              <th className="py-4 px-6 font-medium">Nhận phòng</th>
              <th className="py-4 px-6 font-medium">Trạng thái</th>
              <th className="py-4 px-6 font-medium text-right">Tổng tiền</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-surface-container-highest">
            {MOCK_BOOKINGS.map((booking) => (
              <tr key={booking.id} className="hover:bg-surface-container-lowest transition-colors">
                <td className="py-4 px-6 font-medium text-on-surface">{booking.id}</td>
                <td className="py-4 px-6 text-on-surface">{booking.guest}</td>
                <td className="py-4 px-6 text-on-surface-variant">{booking.room}</td>
                <td className="py-4 px-6 text-on-surface-variant">{booking.checkIn}</td>
                <td className="py-4 px-6">
                  {booking.status === "confirmed" && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Đã xác nhận
                    </span>
                  )}
                  {booking.status === "pending" && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                      Chờ xử lý
                    </span>
                  )}
                  {booking.status === "cancelled" && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                      Đã hủy
                    </span>
                  )}
                </td>
                <td className="py-4 px-6 text-right font-medium text-on-surface">{booking.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
