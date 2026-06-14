"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import hotelServiceApi from "@/services/hotel-service.service";
import { HotelService } from "@/types/services";
import toast from "react-hot-toast";

// Icon list cho user chọn (hoặc tự động gán dựa trên slug)
const ICON_OPTIONS = [
  { label: "Room Service", value: "room_service" },
  { label: "Nhà hàng / Food", value: "restaurant" },
  { label: "Hồ bơi", value: "pool" },
  { label: "Spa", value: "spa" },
  { label: "Gym / Thể thao", value: "fitness_center" },
  { label: "Hội nghị", value: "groups" },
  { label: "Wifi", value: "wifi" },
  { label: "Quầy bar", value: "local_bar" },
  { label: "Đưa đón", value: "airport_shuttle" },
];

export default function AdminServicesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<HotelService[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all"); // 'all', 'active', 'inactive'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<HotelService | null>(null);
  const [formName, setFormName] = useState("");
  const [formShortDesc, setFormShortDesc] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formIcon, setFormIcon] = useState("room_service");
  const [formOpenTime, setFormOpenTime] = useState("06:00");
  const [formCloseTime, setFormCloseTime] = useState("22:00");
  const [formLocation, setFormLocation] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const token = authService.getToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchServices();
  }, [router, page, statusFilter]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const isActive =
        statusFilter === "active"
          ? true
          : statusFilter === "inactive"
          ? false
          : undefined;

      const res = await hotelServiceApi.getAdminServices({
        search: search.trim() || undefined,
        isActive,
        page,
        limit,
      });

      setServices(res.data);
      setTotal(res.total);
    } catch (err: any) {
      if (err.message === "UNAUTHORIZED") {
        authService.logout();
        router.push("/admin/login");
      } else {
        toast.error("Không thể tải danh sách dịch vụ");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchServices();
  };

  const handleOpenCreateModal = () => {
    setEditingService(null);
    setFormName("");
    setFormShortDesc("");
    setFormDesc("");
    setFormImageUrl("");
    setFormIcon("room_service");
    setFormOpenTime("06:00");
    setFormCloseTime("22:00");
    setFormLocation("");
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service: HotelService) => {
    setEditingService(service);
    setFormName(service.name || "");
    setFormShortDesc(service.shortDescription || "");
    setFormDesc(service.description || "");
    setFormImageUrl(service.imageUrl || "");
    setFormIcon(service.icon || "room_service");
    setFormOpenTime(service.openTime || "06:00");
    setFormCloseTime(service.closeTime || "22:00");
    setFormLocation(service.location || "");
    setFormIsActive(service.isActive);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("images", file);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      const token = authService.getToken();
      const res = await fetch(`${apiUrl}/admin/room-categories/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.urls && data.urls.length > 0) {
        setFormImageUrl(data.urls[0]);
        toast.success("Tải ảnh lên thành công");
      } else {
        toast.error(data.message || "Tải ảnh lên thất bại");
      }
    } catch (err) {
      toast.error("Lỗi khi kết nối server upload");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Tên dịch vụ không được để trống");
      return;
    }

    const payload = {
      name: formName,
      shortDescription: formShortDesc,
      description: formDesc,
      imageUrl: formImageUrl,
      icon: formIcon,
      openTime: formOpenTime,
      closeTime: formCloseTime,
      location: formLocation,
      isActive: formIsActive,
    };

    try {
      if (editingService) {
        await hotelServiceApi.updateService(editingService.id, payload);
        toast.success("Cập nhật dịch vụ thành công");
      } else {
        await hotelServiceApi.createService(payload);
        toast.success("Tạo dịch vụ thành công");
      }
      setIsModalOpen(false);
      fetchServices();
    } catch (err: any) {
      toast.error(err.message || "Không thể lưu dịch vụ");
    }
  };

  const handleToggleStatus = async (service: HotelService) => {
    const msg = service.isActive
      ? `Bạn có muốn tạm dừng dịch vụ '${service.name}'?`
      : `Bạn có muốn kích hoạt lại dịch vụ '${service.name}'?`;

    if (!confirm(msg)) return;

    try {
      await hotelServiceApi.updateService(service.id, {
        isActive: !service.isActive,
      });
      toast.success("Cập nhật trạng thái thành công");
      fetchServices();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi cập nhật trạng thái");
    }
  };

  const handleDeleteService = async (service: HotelService) => {
    if (!confirm(`Bạn có chắc chắn muốn ngưng hoạt động (xóa mềm) dịch vụ '${service.name}'?`)) return;

    try {
      await hotelServiceApi.deleteService(service.id);
      toast.success("Đã ngưng hoạt động dịch vụ");
      fetchServices();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi xóa dịch vụ");
    }
  };

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
  const buildImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${BACKEND_URL}${url.startsWith("/") ? url : "/" + url}`;
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold text-on-surface">
            Quản lý Dịch vụ Khách sạn
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Quản lý các dịch vụ như Nhà hàng, Hồ bơi, Spa, Gym...
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-primary text-on-primary hover:bg-primary/90 rounded-xl px-6 py-3 font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-lg self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Thêm dịch vụ mới
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10 mb-6 flex flex-col md:flex-row gap-4 justify-between items-stretch">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-3 max-w-lg">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-3 flex items-center text-on-surface-variant/60">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm dịch vụ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
          <button
            type="submit"
            className="bg-surface-container-high hover:bg-surface-container-highest px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          >
            Tìm
          </button>
        </form>

        <div className="flex items-center gap-3">
          <label className="text-xs uppercase tracking-wider font-bold text-on-surface-variant">Trạng thái:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-surface-container-low border-none rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
          >
            <option value="all">Tất cả</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Tạm ngưng</option>
          </select>
        </div>
      </div>

      {/* List / Table */}
      {loading && services.length === 0 ? (
        <div className="py-20 text-center text-on-surface-variant font-medium">
          Đang tải dữ liệu...
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-highest/20 border-b border-surface-container-highest">
                  <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-on-surface-variant w-1/4">Dịch vụ</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-on-surface-variant">Vị trí</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-on-surface-variant">Giờ hoạt động</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-on-surface-variant">Trạng thái</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider font-semibold text-on-surface-variant text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-highest">
                {services.length > 0 ? (
                  services.map((service) => (
                    <tr key={service.id} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-container flex-shrink-0">
                            {service.imageUrl ? (
                              <img
                                src={buildImageUrl(service.imageUrl)}
                                alt={service.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-primary-container/20 text-primary">
                                <span className="material-symbols-outlined text-2xl">{service.icon || "room_service"}</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-on-surface text-base flex items-center gap-2">
                              <span className="material-symbols-outlined text-[18px] text-primary-container-low">{service.icon}</span>
                              {service.name}
                            </div>
                            <div className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">{service.shortDescription}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">
                        {service.location || "Chưa thiết lập"}
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">
                        {service.openTime && service.closeTime ? (
                          <span className="inline-flex items-center gap-1.5 bg-surface-container-high/40 px-2.5 py-1 rounded-md">
                            <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                            {service.openTime} - {service.closeTime}
                          </span>
                        ) : (
                          "Cả ngày"
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold select-none ${
                            service.isActive
                              ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                              : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                          }`}
                        >
                          {service.isActive ? "Hoạt động" : "Tạm ngưng"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button
                          onClick={() => handleOpenEditModal(service)}
                          className="text-primary hover:text-primary-container text-sm font-semibold transition-colors"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleToggleStatus(service)}
                          className={`${
                            service.isActive ? "text-amber-600 hover:text-amber-700" : "text-green-600 hover:text-green-700"
                          } text-sm font-semibold transition-colors`}
                        >
                          {service.isActive ? "Ngưng" : "Kích hoạt"}
                        </button>
                        <button
                          onClick={() => handleDeleteService(service)}
                          className="text-error hover:text-error/80 text-sm font-semibold transition-colors"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant text-sm font-medium">
                      Không tìm thấy dịch vụ nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-surface-container-highest flex justify-between items-center bg-surface-container-low/10">
              <span className="text-xs font-bold text-on-surface-variant">
                Trang {page} / {totalPages} (Tổng {total} dịch vụ)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3.5 py-1.5 bg-surface-container-low hover:bg-surface-container-high rounded-lg text-xs font-semibold disabled:opacity-50 transition-all"
                >
                  Trước
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3.5 py-1.5 bg-surface-container-low hover:bg-surface-container-high rounded-lg text-xs font-semibold disabled:opacity-50 transition-all"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-2xl shadow-2xl border border-outline-variant/10 overflow-hidden my-8">
            <div className="px-6 py-4 bg-surface-container border-b border-surface-container-highest flex justify-between items-center">
              <h3 className="font-headline font-bold text-lg text-on-surface">
                {editingService ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface material-symbols-outlined"
              >
                close
              </button>
            </div>

            <form onSubmit={handleSaveService} className="p-6 space-y-5 max-h-[calc(100vh-160px)] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1 md:col-span-2">
                  <label className="block text-xs uppercase tracking-wider font-bold text-on-surface-variant">Tên dịch vụ *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-surface-container border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="Ví dụ: Nhà hàng Hoang Minh Dining"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs uppercase tracking-wider font-bold text-on-surface-variant">Icon</label>
                  <select
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    className="w-full bg-surface-container border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs uppercase tracking-wider font-bold text-on-surface-variant">Vị trí</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full bg-surface-container border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="Ví dụ: Tầng thượng (Rooftop)"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs uppercase tracking-wider font-bold text-on-surface-variant">Giờ mở cửa</label>
                  <input
                    type="time"
                    value={formOpenTime}
                    onChange={(e) => setFormOpenTime(e.target.value)}
                    className="w-full bg-surface-container border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs uppercase tracking-wider font-bold text-on-surface-variant">Giờ đóng cửa</label>
                  <input
                    type="time"
                    value={formCloseTime}
                    onChange={(e) => setFormCloseTime(e.target.value)}
                    className="w-full bg-surface-container border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="block text-xs uppercase tracking-wider font-bold text-on-surface-variant">Mô tả ngắn</label>
                  <input
                    type="text"
                    value={formShortDesc}
                    onChange={(e) => setFormShortDesc(e.target.value)}
                    className="w-full bg-surface-container border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="Mô tả tóm tắt dịch vụ (hiển thị ở danh sách)"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="block text-xs uppercase tracking-wider font-bold text-on-surface-variant">Mô tả chi tiết</label>
                  <textarea
                    rows={4}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full bg-surface-container border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                    placeholder="Mô tả đầy đủ về dịch vụ, tiện nghi, ẩm thực, liệu trình..."
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-xs uppercase tracking-wider font-bold text-on-surface-variant">Ảnh dịch vụ</label>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-full sm:w-1/2 flex items-center justify-center border-2 border-dashed border-outline-variant/30 rounded-2xl p-4 bg-surface-container/20 aspect-video relative overflow-hidden group">
                      {formImageUrl ? (
                        <>
                          <img
                            src={buildImageUrl(formImageUrl)}
                            alt="Service preview"
                            className="w-full h-full object-cover rounded-xl"
                          />
                          <button
                            type="button"
                            onClick={() => setFormImageUrl("")}
                            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </>
                      ) : (
                        <div className="text-center">
                          <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">image</span>
                          <span className="block text-xs text-on-surface-variant/50 mt-1">Chưa có ảnh</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 w-full space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        id="image-file-input"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="image-file-input"
                        className="w-full py-3 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-xl font-semibold text-sm transition-all text-center inline-block cursor-pointer"
                      >
                        {uploading ? "Đang tải ảnh..." : "Chọn tệp ảnh"}
                      </label>
                      <input
                        type="text"
                        placeholder="Hoặc nhập liên kết ảnh trực tiếp"
                        value={formImageUrl}
                        onChange={(e) => setFormImageUrl(e.target.value)}
                        className="w-full bg-surface-container border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 md:col-span-2">
                  <input
                    type="checkbox"
                    id="isActiveCheckbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary bg-surface-container border-none"
                  />
                  <label htmlFor="isActiveCheckbox" className="text-sm font-semibold text-on-surface select-none cursor-pointer">
                    Dịch vụ đang hoạt động
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-surface-container-highest flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold rounded-xl text-sm transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-on-primary hover:bg-primary/95 font-semibold rounded-xl text-sm transition-all shadow-md"
                >
                  {editingService ? "Lưu thay đổi" : "Tạo dịch vụ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
