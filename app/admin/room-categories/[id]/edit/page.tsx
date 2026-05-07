"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import ImageUploader, { ImageItem } from "@/components/admin/ImageUploader";

export default function EditRoomCategoryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const id = params.id;
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [capacity, setCapacity] = useState("");
  const [amenities, setAmenities] = useState("");
  const [isActive, setIsActive] = useState<boolean>(true);
  
  const [images, setImages] = useState<ImageItem[]>([]);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);
  const [removedGalleryImages, setRemovedGalleryImages] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Route protection and fetching
  useEffect(() => {
    const token = authService.getToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }
    
    fetchCategoryDetail();
  }, [router, id]);

  const fetchCategoryDetail = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const token = authService.getToken();
      
      const res = await fetch(`${baseUrl}/admin/room-categories`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Không thể tải dữ liệu.");
      }
      
      const categories = data.data || [];
      const category = categories.find((c: any) => c.id === id);
      
      if (!category) {
        setError("Không tìm thấy hạng phòng này.");
        setLoading(false);
        return;
      }
      
      setName(category.name || "");
      setDescription(category.description || "");
      setBasePrice(category.base_price ? category.base_price.toString() : "");
      setCapacity(category.capacity ? category.capacity.toString() : "");
      setAmenities(Array.isArray(category.amenities) ? category.amenities.join(", ") : "");
      setIsActive(category.is_active ?? true);
      
      // Load existing images
      const initialImages: ImageItem[] = [];
      if (category.thumbnail_url) {
        initialImages.push({
          id: Math.random().toString(36).substring(7),
          isExisting: true,
          url: category.thumbnail_url
        });
      }
      
      if (category.gallery && Array.isArray(category.gallery)) {
        category.gallery.forEach((url: string) => {
          if (url !== category.thumbnail_url) {
            initialImages.push({
              id: Math.random().toString(36).substring(7),
              isExisting: true,
              url
            });
          }
        });
      }
      
      setImages(initialImages);
      setThumbnailIndex(0);

      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu hạng phòng.");
      setLoading(false);
    }
  };

  const handleRemoveExisting = (url: string) => {
    setRemovedGalleryImages((prev) => {
      if (!prev.includes(url)) {
        return [...prev, url];
      }
      return prev;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    
    if (!name.trim()) {
      setError("Vui lòng nhập tên hạng phòng.");
      return;
    }
    
    if (!basePrice || isNaN(Number(basePrice)) || Number(basePrice) <= 0) {
      setError("Vui lòng nhập giá cơ bản hợp lệ (lớn hơn 0).");
      return;
    }

    if (!capacity || isNaN(Number(capacity)) || Number(capacity) <= 0) {
      setError("Vui lòng nhập sức chứa hợp lệ (lớn hơn 0).");
      return;
    }

    if (images.length === 0) {
      setError("Vui lòng giữ lại hoặc tải lên ít nhất một hình ảnh.");
      return;
    }
    
    setSubmitting(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const token = authService.getToken();
      
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('base_price', basePrice);
      formData.append('capacity', capacity);
      formData.append('is_active', isActive.toString());

      if (description.trim()) {
        formData.append('description', description.trim());
      }

      if (amenities.trim()) {
        const amenitiesList = amenities.split(',').map(item => item.trim()).filter(Boolean);
        amenitiesList.forEach(item => formData.append('amenities', item));
      }

      // Reorder images so thumbnail is first
      const orderedImages = [...images];
      if (thumbnailIndex > 0 && thumbnailIndex < orderedImages.length) {
        const thumbnail = orderedImages.splice(thumbnailIndex, 1)[0];
        orderedImages.unshift(thumbnail);
      }

      let hasExistingGallery = false;

      orderedImages.forEach(item => {
        if (item.isExisting) {
          formData.append('existing_gallery', item.url);
          hasExistingGallery = true;
        } else if (item.file) {
          formData.append('images', item.file);
        }
      });
      
      // If no existing gallery remains but backend requires the array, NestJS might interpret it as omitted.
      // NestJS might not reset gallery if we don't send existing_gallery. 
      // But we send removed_gallery_images, which is explicit.
      removedGalleryImages.forEach(url => {
        formData.append('removed_gallery_images', url);
      });

      // Edge case: NestJS might ignore empty arrays in multipart. 
      // To ensure all are removed if orderedImages has NO isExisting, we might need a dummy or the backend handles it via removed_gallery_images.
      
      const res = await fetch(`${baseUrl}/admin/room-categories/${id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });
      
      const responseData = await res.json();
      
      if (!res.ok) {
        let errorMessage = "Không thể cập nhật hạng phòng.";
        if (responseData.message) {
            errorMessage = Array.isArray(responseData.message) ? responseData.message.join(", ") : responseData.message;
        }
        throw new Error(errorMessage);
      }
      
      setSuccessMsg("Cập nhật hạng phòng thành công!");
      
      setTimeout(() => {
        router.push("/admin/room-categories");
      }, 1500);
      
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi cập nhật hạng phòng.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
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
            Chỉnh Sửa Hạng Phòng
          </h2>
          <button
            onClick={() => router.push("/admin/room-categories")}
            className="text-primary hover:text-primary-container font-medium transition-colors"
          >
            &larr; Quay lại danh sách
          </button>
        </div>
        
        <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_12px_40px_rgba(24,28,31,0.06)] max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {successMsg && (
              <div className="bg-primary-fixed/20 border border-primary text-primary px-4 py-3 rounded-lg flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                {successMsg}
              </div>
            )}
            
            {error && (
              <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg border border-error/50 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-xs uppercase tracking-[0.05em] font-label text-on-surface-variant mb-2 font-medium">Tên hạng phòng</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="off"
                className="w-full bg-surface-container-highest text-on-surface rounded-lg px-4 py-3 placeholder:text-outline-variant focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all"
                placeholder="Ví dụ: Deluxe Suite"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-xs uppercase tracking-[0.05em] font-label text-on-surface-variant mb-2 font-medium">Mô tả</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-surface-container-highest text-on-surface rounded-lg px-4 py-3 placeholder:text-outline-variant focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all resize-none"
                placeholder="Mô tả chi tiết về hạng phòng..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="basePrice" className="block text-xs uppercase tracking-[0.05em] font-label text-on-surface-variant mb-2 font-medium">Giá cơ bản (VNĐ)</label>
                <input
                  id="basePrice"
                  type="number"
                  min="1"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  className="w-full bg-surface-container-highest text-on-surface rounded-lg px-4 py-3 placeholder:text-outline-variant focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all"
                  placeholder="Ví dụ: 1500000"
                />
              </div>

              <div>
                <label htmlFor="capacity" className="block text-xs uppercase tracking-[0.05em] font-label text-on-surface-variant mb-2 font-medium">Sức chứa</label>
                <input
                  id="capacity"
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full bg-surface-container-highest text-on-surface rounded-lg px-4 py-3 placeholder:text-outline-variant focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all"
                  placeholder="Số lượng khách (VD: 2)"
                />
              </div>
            </div>

            <ImageUploader
              images={images}
              setImages={setImages}
              thumbnailIndex={thumbnailIndex}
              setThumbnailIndex={setThumbnailIndex}
              onRemoveExisting={handleRemoveExisting}
            />

            <div>
              <label htmlFor="amenities" className="block text-xs uppercase tracking-[0.05em] font-label text-on-surface-variant mb-2 font-medium">Tiện ích (Các mục tiện ích cách nhau bởi dấu phẩy)</label>
              <input
                id="amenities"
                type="text"
                value={amenities}
                onChange={(e) => setAmenities(e.target.value)}
                className="w-full bg-surface-container-highest text-on-surface rounded-lg px-4 py-3 placeholder:text-outline-variant focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all"
                placeholder="Ví dụ: WiFi, Ban công, Biển, Bồn tắm..."
              />
            </div>

            <div>
              <label htmlFor="isActive" className="block text-xs uppercase tracking-[0.05em] font-label text-on-surface-variant mb-2 font-medium">Trạng thái</label>
              <select
                id="isActive"
                value={isActive ? "true" : "false"}
                onChange={(e) => setIsActive(e.target.value === "true")}
                className="w-full bg-surface-container-highest text-on-surface rounded-lg px-4 py-3 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all"
              >
                <option value="true">Đang hoạt động</option>
                <option value="false">Tạm ngưng</option>
              </select>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting || !!successMsg}
                className="w-full sm:w-auto bg-primary text-on-primary rounded-lg px-8 py-3 font-medium transition-colors hover:bg-primary-container disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </>
                ) : (
                  "Lưu thay đổi"
                )}
              </button>
            </div>
          </form>
        </div>
    </div>
  );
}
