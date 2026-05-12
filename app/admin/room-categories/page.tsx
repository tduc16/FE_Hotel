"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth.service";

export default function RoomCategoriesAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Route protection and data fetching
  useEffect(() => {
    const token = authService.getToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }
    
    fetchCategories();
  }, [router]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const token = authService.getToken();
      const res = await fetch(`${apiUrl}/admin/room-categories`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      if (res.ok) {
        setCategories(data.data || []);
      } else {
        setError(data.message || "Không thể tải danh sách hạng phòng.");
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    if (!confirm(`Bạn có chắc chắn muốn ${currentStatus ? 'tạm ngưng' : 'kích hoạt'} hạng phòng này?`)) {
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const token = authService.getToken();
      const res = await fetch(`${apiUrl}/admin/room-categories/${id}/toggle-status`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        fetchCategories(); // Reload the list
      } else {
        const data = await res.json();
        alert(data.message || "Không thể thay đổi trạng thái.");
      }
    } catch (err) {
      alert("Có lỗi xảy ra khi thay đổi trạng thái.");
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-on-surface-variant">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-headline font-semibold text-on-surface">
            Quản lý Hạng Phòng
          </h2>
          <Link
            href="/admin/room-categories/create"
            className="bg-primary text-on-primary rounded-lg px-6 py-2.5 font-medium flex items-center transition-colors hover:bg-primary-container"
          >
            + Thêm mới
          </Link>
        </div>
        
        {error && (
          <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg border border-error/50 mb-6">
            {error}
          </div>
        )}

        <div className="bg-surface-container-lowest rounded-xl shadow-[0_12px_40px_rgba(24,28,31,0.06)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-highest/30 border-b border-surface-container-highest">
                  <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-on-surface-variant">Tên</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-on-surface-variant">Giá cơ bản</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-on-surface-variant">Sức chứa</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-on-surface-variant">Trạng thái</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-on-surface-variant text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-highest">
                {categories.length > 0 ? categories.map((category) => (
                  <tr key={category.id} className="hover:bg-surface-container-lowest/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {category.thumbnail_url && (
                          <img
                            src={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}${category.thumbnail_url.startsWith('http') ? new URL(category.thumbnail_url).pathname : category.thumbnail_url}`}
                            alt={category.name}
                            className="w-12 h-12 object-cover rounded-md mr-4"
                          />
                        )}
                        <div className="font-medium text-on-surface">{category.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      {new Intl.NumberFormat('vi-VN').format(category.base_price)}đ
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      {category.capacity} khách
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        category.is_active 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-surface-container-highest text-on-surface-variant'
                      }`}>
                        {category.is_active ? 'Đang hoạt động' : 'Tạm ngưng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <Link
                        href={`/admin/room-categories/${category.id}/edit`}
                        className="text-primary hover:text-primary-container text-sm font-medium transition-colors"
                      >
                        Sửa
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(category.id, category.is_active)}
                        className={`${category.is_active ? 'text-error hover:text-error/80' : 'text-primary hover:text-primary-container'} text-sm font-medium transition-colors`}
                      >
                        {category.is_active ? 'Khóa' : 'Mở khóa'}
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                      Chưa có hạng phòng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  );
}
