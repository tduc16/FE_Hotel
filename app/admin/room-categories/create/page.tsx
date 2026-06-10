"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import ImageUploader, { ImageItem } from "@/components/admin/ImageUploader";

export default function CreateRoomCategoryPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [capacity, setCapacity] = useState("");
  const [amenities, setAmenities] = useState("");
  const [isActive, setIsActive] = useState<boolean>(true);

  // New Image states
  const [existingImages, setExistingImages] = useState<ImageItem[]>([]);
  const [newImages, setNewImages] = useState<ImageItem[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [thumbnailId, setThumbnailId] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Route protection
  useEffect(() => {
    const token = authService.getToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }

    setLoading(false);
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setError("Vui lòng nhập tên hạng phòng.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!basePrice || isNaN(Number(basePrice)) || Number(basePrice) <= 0) {
      setError("Vui lòng nhập giá cơ bản hợp lệ (lớn hơn 0).");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!capacity || isNaN(Number(capacity)) || Number(capacity) <= 0) {
      setError("Vui lòng nhập sức chứa hợp lệ (lớn hơn 0).");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (newImages.length === 0) {
      setError("Vui lòng tải lên ít nhất một hình ảnh.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!thumbnailId) {
      setError("Vui lòng chọn ảnh bìa (thumbnail) cho hạng phòng.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    setUploadProgress(10);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const token = authService.getToken();

      const payload: any = {
        name: name.trim(),
        base_price: Number(basePrice),
        capacity: Number(capacity),
        is_active: isActive
      };

      if (description.trim()) {
        payload.description = description.trim();
      }

      if (amenities.trim()) {
        const amenitiesList = amenities.split(',').map(item => item.trim()).filter(Boolean);
        payload.amenities = amenitiesList;
      }

      // Upload Helper
      const uploadFiles = async (files: File[]) => {
        const uploadData = new FormData();
        files.forEach(f => uploadData.append('images', f));

        const res = await fetch(`${baseUrl}/admin/room-categories/upload`, {
          method: 'POST',
          headers: { "Authorization": `Bearer ${token}` },
          body: uploadData
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Lỗi khi upload ảnh.");
        }
        const data = await res.json();
        return data.urls as string[];
      };

      // Find thumbnail and gallery files
      const selectedThumbnail = newImages.find(img => img.id === thumbnailId);
      if (selectedThumbnail && selectedThumbnail.file) {
        const urls = await uploadFiles([selectedThumbnail.file]);
        payload.thumbnail_url = urls[0];
      }
      setUploadProgress(40);

      const galleryFiles = newImages
        .filter(img => img.id !== thumbnailId && img.file)
        .map(img => img.file as File);

      if (galleryFiles.length > 0) {
        const galleryUrls = await uploadFiles(galleryFiles);
        payload.gallery_images = galleryUrls;
      }
      setUploadProgress(80);

      const res = await fetch(`${baseUrl}/admin/room-categories`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        let errorMessage = "Không thể tạo hạng phòng.";
        try {
          const responseData = await res.json();
          if (responseData.message) {
            errorMessage = Array.isArray(responseData.message) ? responseData.message.join(", ") : responseData.message;
          }
        } catch (e) { }
        throw new Error(errorMessage);
      }

      setUploadProgress(100);
      setSuccessMsg("Tạo hạng phòng thành công!");

      // Chuyển hướng sau 1.5s
      setTimeout(() => {
        router.push("/admin/room-categories");
      }, 1500);

    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi tạo hạng phòng.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setSubmitting(false); // Enable buttons only on error
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
        <p className="text-on-surface-variant font-medium animate-pulse tracking-wide">Đang tải dữ liệu...</p>
      </div>
    );
  }

  const inputClasses = "w-full bg-surface-container-highest text-on-surface rounded-xl px-4 py-3 border border-transparent focus:bg-surface-container-lowest focus:border-primary/50 focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all duration-200 shadow-sm";
  const labelClasses = "block text-sm font-semibold text-on-surface-variant mb-2 tracking-wide";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-32 relative">
      {/* Loading Overlay for Upload Progress */}
      {submitting && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface/80 backdrop-blur-sm">
          <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-2xl flex flex-col items-center w-full max-w-sm md:max-w-md border border-outline-variant/30 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-6"></div>
            <h3 className="text-xl font-bold text-on-surface mb-3">{uploadProgress === 100 ? "Đang xử lý..." : "Đang tải lên..."}</h3>
            <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden relative mb-2">
              <div
                className="absolute top-0 left-0 bottom-0 bg-primary transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-on-surface-variant font-semibold text-sm">{uploadProgress}% hoàn thành</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-on-surface">
            Thêm Hạng Phòng Mới
          </h2>
          <p className="text-on-surface-variant mt-1 text-sm font-medium">
            Điền thông tin chi tiết và tải lên hình ảnh cho hạng phòng
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/room-categories")}
          className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-on-surface-variant bg-surface-container hover:bg-surface-container-high rounded-xl transition-all shadow-sm border border-outline-variant/30 hover:-translate-x-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Quay lại danh sách
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Notifications */}
        {error && (
          <div className="bg-error/10 border border-error/20 text-error px-6 py-4 rounded-2xl flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-4">
            <svg className="w-6 h-6 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <div>
              <h3 className="font-bold">Lỗi tạo mới</h3>
              <p className="text-sm opacity-90 mt-1 font-medium">{error}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="bg-primary/10 border border-primary/20 text-primary px-6 py-4 rounded-2xl flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-4">
            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
            <h3 className="font-bold">{successMsg}</h3>
          </div>
        )}

        {/* Section: Basic Info */}
        <div className="bg-surface-container-lowest rounded-[24px] p-6 md:p-8 shadow-sm border border-outline-variant/30">
          <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2 border-b border-outline-variant/20 pb-4">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Thông tin chung
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="name" className={labelClasses}>Tên hạng phòng <span className="text-error">*</span></label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="off"
                className={inputClasses}
                placeholder="Ví dụ: Deluxe Ocean View Suite"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className={labelClasses}>Mô tả chi tiết</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={`${inputClasses} resize-none`}
                placeholder="Nhập mô tả hấp dẫn về hạng phòng này..."
              />
            </div>

            <div>
              <label htmlFor="basePrice" className={labelClasses}>Giá cơ bản (VNĐ) <span className="text-error">*</span></label>
              <div className="relative">
                <input
                  id="basePrice"
                  type="number"
                  min="1"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  className={`${inputClasses} pl-12`}
                  placeholder="1500000"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₫</span>
              </div>
            </div>

            <div>
              <label htmlFor="capacity" className={labelClasses}>Sức chứa tối đa <span className="text-error">*</span></label>
              <div className="relative">
                <input
                  id="capacity"
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className={`${inputClasses} pl-12`}
                  placeholder="2"
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </div>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="amenities" className={labelClasses}>Tiện ích (Các mục cách nhau bởi dấu phẩy)</label>
              <div className="relative">
                <input
                  id="amenities"
                  type="text"
                  value={amenities}
                  onChange={(e) => setAmenities(e.target.value)}
                  className={`${inputClasses} pl-12`}
                  placeholder="Ví dụ: WiFi, Ban công, View biển, Smart TV..."
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
              </div>
            </div>

            <div className="md:col-span-2 bg-surface-container-highest/30 p-5 rounded-2xl flex items-center justify-between border border-outline-variant/30">
              <div>
                <label htmlFor="isActiveToggle" className="block text-base font-bold text-on-surface">Trạng thái hoạt động</label>
                <p className="text-sm text-on-surface-variant mt-0.5">Cho phép khách hàng nhìn thấy và đặt hạng phòng này.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-surface-container-high peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary shadow-inner"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Section: Images */}
        <div className="bg-surface-container-lowest rounded-[24px] p-6 md:p-8 shadow-sm border border-outline-variant/30">
          <ImageUploader
            existingImages={existingImages}
            setExistingImages={setExistingImages}
            newImages={newImages}
            setNewImages={setNewImages}
            removedImages={removedImages}
            setRemovedImages={setRemovedImages}
            thumbnailId={thumbnailId}
            setThumbnailId={setThumbnailId}
          />
        </div>

        {/* Sticky Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface-container-lowest/90 backdrop-blur-xl border-t border-outline-variant/30 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40">
          <div className="max-w-5xl mx-auto flex justify-end items-center gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 rounded-xl font-bold text-on-surface-variant bg-surface-container hover:bg-surface-container-highest transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || !!successMsg || newImages.length === 0}
              className="px-8 py-3 rounded-xl font-bold text-on-primary bg-primary hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all flex items-center"
            >
              Tạo hạng phòng
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
