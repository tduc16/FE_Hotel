import React, { useRef, useState, DragEvent } from "react";

interface ImageUploaderProps {
  images: File[];
  setImages: React.Dispatch<React.SetStateAction<File[]>>;
  previewUrls: string[];
  setPreviewUrls: React.Dispatch<React.SetStateAction<string[]>>;
  thumbnailIndex: number;
  setThumbnailIndex: React.Dispatch<React.SetStateAction<number>>;
}

export default function ImageUploader({
  images,
  setImages,
  previewUrls,
  setPreviewUrls,
  thumbnailIndex,
  setThumbnailIndex,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // For drag and drop reordering
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleFileChange = (files: FileList | null) => {
    if (!files) return;

    const newFiles: File[] = [];
    const newUrls: string[] = [];

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} vượt quá dung lượng 5MB`);
        return;
      }
      newFiles.push(file);
      newUrls.push(URL.createObjectURL(file));
    });

    setImages((prev) => [...prev, ...newFiles]);
    setPreviewUrls((prev) => [...prev, ...newUrls]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, i) => i !== indexToRemove));
    setPreviewUrls((prev) => {
      const newUrls = [...prev];
      URL.revokeObjectURL(newUrls[indexToRemove]); // Cleanup
      return newUrls.filter((_, i) => i !== indexToRemove);
    });

    if (thumbnailIndex === indexToRemove) {
      setThumbnailIndex(0);
    } else if (thumbnailIndex > indexToRemove) {
      setThumbnailIndex((prev) => prev - 1);
    }
  };

  // Drag and Drop (upload)
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

  // Drag and Drop (reorder)
  const onReorderDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const onReorderDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    // Reorder logic on hover for immediate feedback
    const newImages = [...images];
    const newUrls = [...previewUrls];

    const draggedImage = newImages[draggedIndex];
    const draggedUrl = newUrls[draggedIndex];

    newImages.splice(draggedIndex, 1);
    newUrls.splice(draggedIndex, 1);

    newImages.splice(index, 0, draggedImage);
    newUrls.splice(index, 0, draggedUrl);

    setImages(newImages);
    setPreviewUrls(newUrls);

    // Update thumbnail index to match the new position
    if (thumbnailIndex === draggedIndex) {
      setThumbnailIndex(index);
    } else if (
      thumbnailIndex > draggedIndex &&
      thumbnailIndex <= index
    ) {
      setThumbnailIndex(thumbnailIndex - 1);
    } else if (
      thumbnailIndex < draggedIndex &&
      thumbnailIndex >= index
    ) {
      setThumbnailIndex(thumbnailIndex + 1);
    }

    setDraggedIndex(index);
  };

  const onReorderDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      <label className="block text-xs uppercase tracking-[0.05em] font-label text-on-surface-variant mb-2 font-medium">
        Hình ảnh (Tối đa 5MB)
      </label>

      {/* Upload Dropzone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200
          ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-outline-variant hover:border-primary/50 hover:bg-surface-container"
          }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files)}
        />
        <svg
          className="w-10 h-10 text-on-surface-variant mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          ></path>
        </svg>
        <p className="text-on-surface font-medium text-center">
          Kéo thả ảnh vào đây, hoặc click để chọn ảnh
        </p>
        <p className="text-on-surface-variant text-sm mt-1 text-center">
          Hỗ trợ JPG, PNG, WEBP
        </p>
      </div>

      {/* Preview Grid */}
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
          {previewUrls.map((url, index) => (
            <div
              key={url}
              draggable
              onDragStart={(e) => onReorderDragStart(e, index)}
              onDragOver={(e) => onReorderDragOver(e, index)}
              onDrop={onReorderDrop}
              onDragEnd={() => setDraggedIndex(null)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-grab active:cursor-grabbing group
                ${
                  index === thumbnailIndex
                    ? "border-primary shadow-sm"
                    : "border-transparent"
                }
                ${draggedIndex === index ? "opacity-50" : "opacity-100"}
              `}
            >
              {/* Image */}
              <img
                src={url}
                alt={`Preview ${index}`}
                className="w-full h-full object-cover"
                onClick={() => setThumbnailIndex(index)}
              />

              {/* Thumbnail Badge */}
              {index === thumbnailIndex && (
                <div className="absolute top-2 left-2 bg-primary text-on-primary text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10 pointer-events-none uppercase tracking-wider">
                  Thumbnail
                </div>
              )}

              {/* Delete Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(index);
                }}
                className="absolute top-2 right-2 bg-error/90 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-error"
                title="Xóa ảnh"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>

              {/* Set as thumbnail overlay (if not thumbnail) */}
              {index !== thumbnailIndex && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setThumbnailIndex(index);
                  }}
                  className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center py-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  Set làm thumbnail
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
