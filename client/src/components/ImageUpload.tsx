import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { compressImage } from "@/lib/image-compress";

interface ImageUploadProps {
  onImageSelect: (imageData: string, mimeType: string) => void;
  selectedImage: string | null; // base64 data URL for preview
  disabled?: boolean;
}

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB – we compress before upload

export function ImageUpload({
  onImageSelect,
  selectedImage,
  disabled = false,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Invalid file type", {
        description: "Please upload a PNG, JPEG, or WEBP image.",
      });
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large", {
        description: "Please upload an image smaller than 50MB.",
      });
      return false;
    }

    return true;
  };

  const processFile = async (file: File) => {
    if (!validateFile(file)) {
      return;
    }

    try {
      const { base64, mimeType } = await compressImage(file);
      onImageSelect(base64, mimeType);
    } catch {
      toast.error("Upload failed", {
        description: "Failed to process the image. Please try again.",
      });
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) {
      return;
    }

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleChangePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClick();
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "relative rounded-xl border-2 border-dashed transition-all duration-200",
          "flex items-center justify-center overflow-hidden",
          "min-h-[300px] cursor-pointer group",
          disabled && "opacity-50 cursor-not-allowed",
          !selectedImage && !isDragging && "border-gray-300 hover:border-purple-400",
          !selectedImage && isDragging && "border-purple-500 bg-purple-50",
          selectedImage && "border-transparent"
        )}
      >
        {!selectedImage ? (
          <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
            <div
              className={cn(
                "mb-4 rounded-full p-4 transition-colors",
                isDragging
                  ? "bg-gradient-to-br from-purple-500 to-pink-500"
                  : "bg-gradient-to-br from-purple-400 to-pink-400"
              )}
            >
              <Upload
                className={cn(
                  "h-8 w-8 transition-colors",
                  isDragging ? "text-white" : "text-white"
                )}
              />
            </div>

            <div className="space-y-2">
              <p className="text-base font-medium text-gray-700">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-gray-500">
                PNG, JPEG, WEBP
              </p>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full min-h-[300px]">
            <img
              src={selectedImage}
              alt="Selected"
              className="w-full h-full object-contain"
            />

            {!disabled && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                <Button
                  onClick={handleChangePhoto}
                  variant="secondary"
                  className={cn(
                    "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                    "bg-white hover:bg-white/90 text-gray-900 font-medium",
                    "shadow-lg"
                  )}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Change Photo
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
