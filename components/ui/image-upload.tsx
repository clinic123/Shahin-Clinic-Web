"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, Camera, CheckCircle, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface ImageUploadProps {
  currentImage?: string | null;
  onImageChange: (imageUrl: string) => Promise<void>;
  onImageRemove: () => Promise<void>;
  maxSize?: number; // in MB
  uploadEndpoint?: string;
  className?: string;
  fallbackText?: string;
  size?: "sm" | "md" | "lg";
  variant?: "avatar" | "square" | "image-box"; // new prop
}

export function ImageUpload({
  currentImage,
  onImageChange,
  onImageRemove,
  maxSize = 5,
  uploadEndpoint = "/api/upload",
  className = "",
  fallbackText = "User",
  size = "md",
  variant = "avatar",
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
  };

  const buttonSize = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  // Determine the border radius based on variant
  const shapeClass = variant === "avatar" ? "rounded-full" : "rounded";

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file", {
        icon: <AlertCircle className="h-4 w-4" />,
      });
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Image size must be less than ${maxSize}MB`, {
        icon: <AlertCircle className="h-4 w-4" />,
      });
      return;
    }

    setLoading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(uploadEndpoint, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      // Call the parent component's handler
      await onImageChange(result.secure_url);

      toast.success("Image updated successfully!", {
        icon: <CheckCircle className="h-4 w-4" />,
      });

      // Clear preview after successful upload
      setPreviewImage(null);
    } catch (error: any) {
      console.error("Image upload error:", error);
      toast.error(error.message || "Failed to upload image", {
        icon: <AlertCircle className="h-4 w-4" />,
      });
      setPreviewImage(null);
    } finally {
      setLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = async () => {
    setLoading(true);
    try {
      await onImageRemove();
      toast.success("Image removed successfully!", {
        icon: <CheckCircle className="h-4 w-4" />,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to remove image", {
        icon: <AlertCircle className="h-4 w-4" />,
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayImage = previewImage || currentImage;

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <div className="relative group">
        {/* Main container for image */}
        <div
          className={`
            ${sizeClasses[size]} 
            ${shapeClass}
            border-4 border-white shadow-lg
            flex items-center justify-center
            bg-gray-100
            overflow-hidden
          `}
        >
          {displayImage ? (
            <img
              src={displayImage}
              alt="Uploaded image"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className={`
                ${shapeClass}
                w-full h-full
                bg-blue-100 text-blue-600
                flex items-center justify-center
                ${
                  size === "sm"
                    ? "text-sm"
                    : size === "md"
                    ? "text-lg"
                    : "text-xl"
                }
              `}
            >
              {getInitials(fallbackText)}
            </div>
          )}
        </div>

        {/* Image Upload Overlay */}
        <div
          className={`
            absolute inset-0 
            flex items-center justify-center 
            bg-black bg-opacity-50 
            ${shapeClass}
            opacity-0 group-hover:opacity-100 transition-opacity
          `}
        >
          <Camera className="h-6 w-6 text-white" />
        </div>

        {/* Upload Button */}
        <Button
          size="icon"
          className={`absolute -bottom-2 -right-2 rounded-full ${buttonSize[size]}`}
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          type="button"
        >
          {loading ? (
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Camera className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"}`} />
          )}
        </Button>

        {/* Remove Image Button (only show if user has an image) */}
        {currentImage && !previewImage && (
          <Button
            size="icon"
            className={`absolute -bottom-2 -left-2 rounded-full ${buttonSize[size]}`}
            variant="destructive"
            onClick={handleRemoveImage}
            disabled={loading}
            type="button"
          >
            <X className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"}`} />
          </Button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Upload Instructions */}
      <div className="text-xs text-gray-500 text-center">
        <p>Click the camera icon to upload a new image</p>
        <p>Max size: {maxSize}MB • Supported: JPG, PNG, WebP</p>
      </div>
    </div>
  );
}
