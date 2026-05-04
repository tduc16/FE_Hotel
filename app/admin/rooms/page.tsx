"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import RoomsTable, { Room } from "@/components/admin/RoomsTable";
import CreateRoomModal from "@/components/admin/CreateRoomModal";

export default function RoomsAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    const token = authService.getToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchData();
  }, [router, searchTerm, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = authService.getToken();
      
      // Fetch rooms
      let url = `${baseUrl}/admin/rooms?`;
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;
      if (statusFilter) url += `status=${encodeURIComponent(statusFilter)}&`;

      const [roomsRes, categoriesRes] = await Promise.all([
        fetch(url, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${baseUrl}/admin/room-categories`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (roomsRes.status === 401 || categoriesRes.status === 401) {
        authService.logout();
        router.push("/admin/login");
        return;
      }

      const roomsData = await roomsRes.json();
      const categoriesData = await categoriesRes.json();

      if (roomsRes.ok) {
        setRooms(roomsData.data || []);
      } else {
        setError(roomsData.message || "Không thể tải danh sách phòng.");
      }

      if (categoriesRes.ok) {
        setCategories(categoriesData.data || []);
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phòng này?")) return;

    try {
      const token = authService.getToken();
      const res = await fetch(`${baseUrl}/admin/rooms/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || "Xóa thất bại");
      }
    } catch (err) {
      alert("Lỗi khi xóa");
    }
  };

  const handleChangeStatus = async (id: string, currentStatus: string) => {
    const statusCycle: Record<string, string> = {
      AVAILABLE: "OCCUPIED",
      OCCUPIED: "MAINTENANCE",
      MAINTENANCE: "AVAILABLE"
    };
    
    const nextStatus = statusCycle[currentStatus] || "AVAILABLE";

    try {
      const token = authService.getToken();
      const res = await fetch(`${baseUrl}/admin/rooms/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ status: nextStatus })
      });
      
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || "Cập nhật trạng thái thất bại");
      }
    } catch (err) {
      alert("Lỗi khi cập nhật trạng thái");
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setIsModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setEditingRoom(null);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-headline font-semibold text-on-surface">
          Quản lý phòng
        </h2>
        <button
          onClick={handleOpenCreateModal}
          className="bg-primary text-on-primary rounded-lg px-6 py-2.5 font-medium flex items-center transition-colors hover:bg-primary-container"
        >
          + Thêm phòng
        </button>
      </div>

      {error && (
        <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg border border-error/50 mb-6">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-surface-container-lowest p-4 rounded-xl shadow-[0_12px_40px_rgba(24,28,31,0.06)] mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input 
            type="text" 
            placeholder="Tìm kiếm số phòng..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-surface-container-highest rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
          />
        </div>
        <div className="sm:w-64">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-surface-container-highest rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface appearance-none"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="AVAILABLE">Trống</option>
            <option value="OCCUPIED">Đang sử dụng</option>
            <option value="MAINTENANCE">Bảo trì</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-on-surface-variant font-medium text-lg">Đang tải...</div>
        </div>
      ) : (
        <RoomsTable 
          rooms={rooms} 
          onDelete={handleDelete} 
          onEdit={handleEdit} 
          onChangeStatus={handleChangeStatus}
        />
      )}

      <CreateRoomModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
        categories={categories}
        token={authService.getToken()}
        baseUrl={baseUrl}
        editingRoom={editingRoom}
      />
    </div>
  );
}
