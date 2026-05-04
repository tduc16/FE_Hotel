import React from "react";
import RoomStatusBadge from "./RoomStatusBadge";

export interface Room {
  id: string;
  room_number: string;
  status: string;
  created_at: string;
  category?: {
    id: string;
    name: string;
  };
}

interface RoomsTableProps {
  rooms: Room[];
  onDelete: (id: string) => void;
  onEdit: (room: Room) => void;
  onChangeStatus: (id: string, currentStatus: string) => void;
}

export default function RoomsTable({ rooms, onDelete, onEdit, onChangeStatus }: RoomsTableProps) {
  if (rooms.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-xl shadow-[0_12px_40px_rgba(24,28,31,0.06)] p-8 text-center text-on-surface-variant">
        Chưa có phòng nào trong hệ thống.
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-[0_12px_40px_rgba(24,28,31,0.06)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-highest/30 border-b border-surface-container-highest">
              <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-on-surface-variant">Số phòng</th>
              <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-on-surface-variant">Hạng phòng</th>
              <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-on-surface-variant">Ngày tạo</th>
              <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-on-surface-variant">Trạng thái</th>
              <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-on-surface-variant text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-highest">
            {rooms.map((room) => (
              <tr key={room.id} className="hover:bg-surface-container-lowest/80 transition-colors">
                <td className="px-6 py-4 font-medium text-on-surface">
                  {room.room_number}
                </td>
                <td className="px-6 py-4 text-on-surface-variant">
                  {room.category ? room.category.name : "—"}
                </td>
                <td className="px-6 py-4 text-on-surface-variant">
                  {new Date(room.created_at).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-6 py-4">
                  <RoomStatusBadge status={room.status} />
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button
                    onClick={() => onChangeStatus(room.id, room.status)}
                    className="text-on-surface-variant hover:text-on-surface text-sm font-medium transition-colors"
                  >
                    Đổi trạng thái
                  </button>
                  <button
                    onClick={() => onEdit(room)}
                    className="text-primary hover:text-primary-container text-sm font-medium transition-colors"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => onDelete(room.id)}
                    className="text-error hover:text-error/80 text-sm font-medium transition-colors"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
