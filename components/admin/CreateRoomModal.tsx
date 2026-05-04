import React, { useState, useEffect } from "react";

interface Category {
  id: string;
  name: string;
  is_active: boolean;
}

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
  token: string | null;
  baseUrl: string;
  editingRoom: any | null; // Pass a room object to edit, null for create
}

export default function CreateRoomModal({ isOpen, onClose, onSuccess, categories, token, baseUrl, editingRoom }: CreateRoomModalProps) {
  const [roomNumber, setRoomNumber] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("AVAILABLE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (editingRoom) {
        setRoomNumber(editingRoom.room_number);
        setCategoryId(editingRoom.category?.id || "");
        setStatus(editingRoom.status || "AVAILABLE");
      } else {
        setRoomNumber("");
        setCategoryId("");
        setStatus("AVAILABLE");
      }
      setError("");
    }
  }, [isOpen, editingRoom]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!roomNumber.trim()) {
      setError("Vui lòng nhập số phòng.");
      return;
    }
    if (!categoryId) {
      setError("Vui lòng chọn hạng phòng.");
      return;
    }

    setLoading(true);

    try {
      const url = editingRoom 
        ? `${baseUrl}/admin/rooms/${editingRoom.id}`
        : `${baseUrl}/admin/rooms`;
      
      const method = editingRoom ? "PATCH" : "POST";

      const payload: any = {
        room_number: roomNumber,
        category_id: categoryId,
      };

      if (editingRoom) {
        payload.status = status;
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        setError(data.message || "Có lỗi xảy ra khi lưu phòng.");
      }
    } catch (err) {
      setError("Lỗi kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-container-highest/80 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl shadow-[0_12px_40px_rgba(24,28,31,0.12)] w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-container-highest flex justify-between items-center bg-surface-container-lowest">
          <h3 className="text-xl font-headline font-semibold text-on-surface">
            {editingRoom ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
          </h3>
          <button 
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-error-container text-on-error-container text-sm px-4 py-3 rounded-lg border border-error/50 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Số phòng *
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="VD: 101, 201A..."
                className="w-full px-4 py-2 bg-surface-container-lowest border border-surface-container-highest rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Hạng phòng *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2 bg-surface-container-lowest border border-surface-container-highest rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface appearance-none"
              >
                <option value="">-- Chọn hạng phòng --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} disabled={!cat.is_active}>
                    {cat.name} {!cat.is_active ? "(Tạm ngưng)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {editingRoom && (
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Trạng thái
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 bg-surface-container-lowest border border-surface-container-highest rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface appearance-none"
                >
                  <option value="AVAILABLE">Trống</option>
                  <option value="OCCUPIED">Đang sử dụng</option>
                  <option value="MAINTENANCE">Bảo trì</option>
                </select>
              </div>
            )}

            <div className="pt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-on-surface-variant hover:text-on-surface font-medium transition-colors"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container px-6 py-2 rounded-lg font-medium shadow-sm transition-colors disabled:opacity-70 flex items-center justify-center min-w-[120px]"
              >
                {loading ? "Đang lưu..." : "Lưu lại"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
