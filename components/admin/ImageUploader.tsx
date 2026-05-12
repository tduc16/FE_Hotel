import React, { useRef, useState, DragEvent, useEffect, useMemo } from "react";

export interface ImageItem {
  id: string;
  isExisting: boolean;
  url: string;
  file?: File;
}

interface ImageUploaderProps {
  existingImages: ImageItem[];
  setExistingImages: React.Dispatch<React.SetStateAction<ImageItem[]>>;
  newImages: ImageItem[];
  setNewImages: React.Dispatch<React.SetStateAction<ImageItem[]>>;
  removedImages: string[];
  setRemovedImages: React.Dispatch<React.SetStateAction<string[]>>;
  thumbnailId: string;
  setThumbnailId: React.Dispatch<React.SetStateAction<string>>;
}

export default function ImageUploader({
  existingImages,
  setExistingImages,
  newImages,
  setNewImages,
  removedImages,
  setRemovedImages,
  thumbnailId,
  setThumbnailId,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // useMemo để tránh tạo mảng mới mỗi render → useEffect không bị chạy loop
  const allImages = useMemo(
    () => [...existingImages, ...newImages],
    [existingImages, newImages]
  );
  const thumbnailImage = allImages.find((img) => img.id === thumbnailId);

  useEffect(() => {
    // Nếu chưa có thumbnail mà đã có ảnh → chọn ảnh đầu tiên
    if (!thumbnailId && allImages.length > 0) {
      setThumbnailId(allImages[0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingImages.length, newImages.length, thumbnailId]);

  /**
   * Chuyển url tương đối / localhost / absolute thành URL đầy đủ trỏ đúng backend.
   * Backend phục vụ static file tại http://localhost:3001/uploads/...
   * KHÔNG có prefix /api (ServeStaticModule bypass globalPrefix).
   */
  const getFullUrl = (url: string): string => {
    if (!url) return "https://placehold.co/600x400?text=No+Image";
    if (url.startsWith("blob:")) return url; // ảnh mới chọn – dùng blob URL

    // Chuẩn hoá dấu \ → /  (Windows path từ DB)
    let path = url.replace(/\\/g, "/");

    // Nếu là URL tuyệt đối
    if (path.startsWith("http")) {
      try {
        const parsed = new URL(path);
        // URL ngoài (S3, CDN…) → giữ nguyên
        if (parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1") {
          return path;
        }
        // localhost URL → chỉ lấy pathname để build lại với đúng origin
        path = parsed.pathname;
      } catch {
        // URL không hợp lệ → thử render thẳng
        return path;
      }
    }

    // Lúc này path phải là dạng "/uploads/..." hoặc "uploads/..."
    // Đảm bảo có leading slash
    if (!path.startsWith("/")) {
      path = `/${path}`;
    }

    // Backend origin (không có /api)
    // Ưu tiên: NEXT_PUBLIC_BACKEND_URL → strip /api từ NEXT_PUBLIC_API_URL → hardcode
    const backendOrigin = (
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ||
      "http://localhost:3001"
    ).replace(/\/$/, "");

    const fullUrl = `${backendOrigin}${path}`;

    // DEBUG: log lần đầu để kiểm tra URL đang build
    console.debug("[ImageUploader] getFullUrl:", { rawUrl: url, path, backendOrigin, fullUrl });

    return fullUrl;
  };

  const handleFileChange = (files: FileList | null) => {
    if (!files) return;

    const addedImages: ImageItem[] = [];

    Array.from(files).forEach((file) => {
      // Validate type
      if (!file.type.startsWith("image/")) {
        alert(`File ${file.name} không phải là hình ảnh hợp lệ`);
        return;
      }
      // Validate size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} vượt quá dung lượng 5MB`);
        return;
      }

      addedImages.push({
        id: Math.random().toString(36).substring(2, 9) + Date.now().toString(),
        isExisting: false,
        url: URL.createObjectURL(file),
        file,
      });
    });

    if (addedImages.length > 0) {
      setNewImages((prev) => [...prev, ...addedImages]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = (imageToRemove: ImageItem) => {
    if (imageToRemove.isExisting) {
      setExistingImages((prev) => prev.filter((img) => img.id !== imageToRemove.id));
      setRemovedImages((prev) => {
        // We must push the raw original url, but wait, the backend might expect the raw URL.
        // It's safer to just push the `url` we stored.
        if (!prev.includes(imageToRemove.url)) {
          return [...prev, imageToRemove.url];
        }
        return prev;
      });
    } else {
      setNewImages((prev) => prev.filter((img) => img.id !== imageToRemove.id));
      URL.revokeObjectURL(imageToRemove.url); // Cleanup memory
    }

    if (thumbnailId === imageToRemove.id) {
      const remaining = allImages.filter((img) => img.id !== imageToRemove.id);
      setThumbnailId(remaining.length > 0 ? remaining[0].id : "");
    }
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 mb-2">
        <div>
          <label className="block text-lg font-bold tracking-tight text-on-surface">
            Hình ảnh phòng <span className="text-error">*</span>
          </label>
          <p className="text-sm text-on-surface-variant mt-1">
            Kéo thả hoặc nhấn vào ô dưới để tải ảnh lên. Hỗ trợ JPG, PNG, WEBP (Tối đa 5MB).
          </p>
        </div>
        <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-lg whitespace-nowrap">
          {allImages.length} Hình ảnh
        </span>
      </div>

      {/* Large Thumbnail Preview */}
      {thumbnailImage ? (
        <div className="relative w-full aspect-video md:aspect-[21/9] rounded-[24px] overflow-hidden shadow-sm border border-outline-variant/30 group bg-surface-container-lowest">
          <img
            src={getFullUrl(thumbnailImage.url)}
            alt="Thumbnail"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/1200x600?text=Image+Not+Found";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 pointer-events-none"></div>
          
          <div className="absolute bottom-5 left-5 flex items-center space-x-3 pointer-events-none">
            <span className="bg-primary text-on-primary text-xs font-bold px-4 py-2 rounded-xl shadow-lg border border-primary/50">
              ẢNH BÌA (THUMBNAIL)
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm("Bạn có chắc chắn muốn xóa ảnh bìa này?")) {
                handleRemove(thumbnailImage);
              }
            }}
            className="absolute top-5 right-5 bg-error/90 backdrop-blur-md text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-error hover:scale-110 shadow-xl border border-white/10"
            title="Xóa ảnh bìa"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      ) : (
        <div className="w-full aspect-video md:aspect-[21/9] rounded-[24px] border-2 border-dashed border-outline-variant flex flex-col items-center justify-center bg-surface-container-lowest text-on-surface-variant transition-colors">
          <div className="bg-surface p-4 rounded-full shadow-sm mb-4">
             <svg className="w-8 h-8 text-on-surface-variant/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
             </svg>
          </div>
          <p className="font-medium text-base">Chưa có hình ảnh nào</p>
          <p className="text-sm opacity-70 mt-1">Vui lòng tải lên ít nhất một ảnh để làm ảnh bìa</p>
        </div>
      )}

      {/* Grid: Upload Dropzone + Gallery */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Upload Dropzone */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group overflow-hidden
            ${
              isDragging
                ? "border-2 border-primary bg-primary/10 scale-[1.02] shadow-md"
                : "border-2 border-dashed border-outline-variant hover:border-primary/60 hover:bg-surface-container-high bg-surface-container-lowest"
            }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg, image/png, image/webp"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files)}
          />
          <div className="bg-surface p-3 rounded-xl shadow-sm mb-3 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300 text-primary border border-outline-variant/30">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
            </svg>
          </div>
          <p className="text-on-surface font-semibold text-sm">Thêm ảnh mới</p>
          <p className="text-on-surface-variant text-xs mt-1">Click hoặc kéo thả</p>
        </div>

        {/* Gallery Grid */}
        {allImages.map((item) => {
          if (item.id === thumbnailId) return null; // Already shown as hero

          return (
            <div
              key={item.id}
              className="relative aspect-square rounded-2xl overflow-hidden border border-outline-variant/20 group bg-surface-container shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <img
                src={getFullUrl(item.url)}
                alt="Gallery preview"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://placehold.co/400x400?text=Error";
                }}
              />
              
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 backdrop-blur-[2px]">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm("Bạn có chắc chắn muốn xóa ảnh này?")) {
                        handleRemove(item);
                      }
                    }}
                    className="bg-error/90 hover:bg-error text-white p-2 rounded-full transition-colors shadow-md transform hover:scale-110"
                    title="Xóa ảnh"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setThumbnailId(item.id);
                  }}
                  className="w-full bg-white/95 hover:bg-primary text-on-surface hover:text-on-primary text-xs font-bold py-2.5 rounded-xl transition-all shadow-lg transform active:scale-95"
                >
                  Đặt làm ảnh bìa
                </button>
              </div>

              {/* Badge for new unsaved images */}
              {!item.isExisting && (
                <div className="absolute top-3 left-3 bg-tertiary text-on-tertiary text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm pointer-events-none uppercase tracking-wider border border-white/20">
                  Mới
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

