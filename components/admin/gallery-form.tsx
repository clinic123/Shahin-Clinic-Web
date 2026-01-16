"use client";

import { Gallery } from "@/hooks/useGalleries";
import { GalleryFormData, galleryFormSchema } from "@/lib/validations/gallery";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { ImageUpload } from "../ui/image-upload";

interface GalleryFormProps {
  gallery?: Gallery;
  onSubmit: (data: GalleryFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function GalleryForm({
  gallery,
  onSubmit,
  onCancel,
  isLoading,
}: GalleryFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GalleryFormData>({
    resolver: zodResolver(galleryFormSchema as any),
    defaultValues: gallery
      ? {
          title: gallery.title,
          description: gallery.description,
          featuredImage: gallery.featuredImage,
          published: gallery.published,
        }
      : {
          published: true,
        },
  });

  const featuredImage = watch("featuredImage");

  const handleImageChange = async (imageUrl: string) => {
    setValue("featuredImage", imageUrl, { shouldValidate: true });
  };
  const handleImageRemove = async () => {
    setValue("featuredImage", "", { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Title *
        </label>
        <input
          type="text"
          id="title"
          {...register("title")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description *
        </label>
        <textarea
          id="description"
          rows={4}
          {...register("description")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="featuredImage"
          className="block text-sm font-medium text-gray-700"
        >
          Featured Image URL *
        </label>
        <div className="space-y-1">
          <ImageUpload
            currentImage={featuredImage}
            onImageChange={handleImageChange}
            onImageRemove={handleImageRemove}
            variant="square"
            size="lg"
            fallbackText="gallery"
            className="mb-4"
          />
        </div>
        {errors.featuredImage && (
          <p className="mt-1 text-sm text-red-600">
            {errors.featuredImage.message}
          </p>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="published"
          {...register("published")}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
          Published
        </label>
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          onClick={onCancel}
          variant={"secondary"}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Saving..."
            : gallery
            ? "Update Gallery"
            : "Create Gallery"}
        </Button>
      </div>
    </form>
  );
}
