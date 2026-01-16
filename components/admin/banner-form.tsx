"use client";

import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { Banner } from "@/hooks/useBanners";
import { BannerFormData, bannerFormSchema } from "@/lib/validations/banner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface BannerFormProps {
  banner?: Banner;
  onSubmit: (data: BannerFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function BannerForm({
  banner,
  onSubmit,
  onCancel,
  isLoading,
}: BannerFormProps) {
  const [headingLines, setHeadingLines] = useState<string[]>(
    banner?.heading || [""]
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BannerFormData>({
    resolver: zodResolver(bannerFormSchema as any),
    defaultValues: banner
      ? {
          heading: banner.heading,
          description: banner.description,
          image: banner.image,
          button: banner.button,
          buttonLink: banner.buttonLink || "",
          published: banner.published,
          order: banner.order,
        }
      : {
          published: true,
          order: 0,
          heading: [""],
          buttonLink: "",
        },
  });

  const image = watch("image");

  const handleImageChange = async (imageUrl: string) => {
    setValue("image", imageUrl, { shouldValidate: true });
  };

  const handleImageRemove = async () => {
    setValue("image", "", { shouldValidate: true });
  };

  const addHeadingLine = () => {
    const newLines = [...headingLines, ""];
    setHeadingLines(newLines);
    setValue("heading", newLines);
  };

  const removeHeadingLine = (index: number) => {
    if (headingLines.length > 1) {
      const newLines = headingLines.filter((_, i) => i !== index);
      setHeadingLines(newLines);
      setValue("heading", newLines);
    }
  };

  const updateHeadingLine = (index: number, value: string) => {
    const newLines = headingLines.map((line, i) =>
      i === index ? value : line
    );
    setHeadingLines(newLines);
    setValue("heading", newLines, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Heading Lines */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Heading Lines *
        </label>
        {headingLines.map((line, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={line}
              onChange={(e) => updateHeadingLine(index, e.target.value)}
              placeholder={`Heading line ${index + 1}`}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {headingLines.length > 1 && (
              <Button
                type="button"
                onClick={() => removeHeadingLine(index)}
                variant="outline"
                size="sm"
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          onClick={addHeadingLine}
          variant="outline"
          size="sm"
        >
          Add Heading Line
        </Button>
        {errors.heading && (
          <p className="mt-1 text-sm text-red-600">{errors.heading.message}</p>
        )}
      </div>

      {/* Description */}
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

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Banner Image *
        </label>
        <ImageUpload
          currentImage={image}
          onImageChange={handleImageChange}
          onImageRemove={() => handleImageRemove()}
          variant="square"
          size="lg"
          fallbackText="Banner"
          maxSize={10}
          className="mb-4"
        />
        <input type="hidden" {...register("image")} />
        {errors.image && (
          <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
        )}
      </div>

      {/* Button Text */}
      <div>
        <label
          htmlFor="button"
          className="block text-sm font-medium text-gray-700"
        >
          Button Text *
        </label>
        <input
          type="text"
          id="button"
          {...register("button")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.button && (
          <p className="mt-1 text-sm text-red-600">{errors.button.message}</p>
        )}
      </div>

      {/* Button Link */}
      <div>
        <label
          htmlFor="buttonLink"
          className="block text-sm font-medium text-gray-700"
        >
          Button Link (optional)
        </label>
        <input
          type="url"
          id="buttonLink"
          placeholder="https://example.com"
          {...register("buttonLink")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.buttonLink && (
          <p className="mt-1 text-sm text-red-600">
            {errors.buttonLink.message}
          </p>
        )}
      </div>

      {/* Order */}
      <div>
        <label
          htmlFor="order"
          className="block text-sm font-medium text-gray-700"
        >
          Display Order
        </label>
        <input
          type="number"
          id="order"
          {...register("order", { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.order && (
          <p className="mt-1 text-sm text-red-600">{errors.order.message}</p>
        )}
      </div>

      {/* Published */}
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

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : banner ? "Update Banner" : "Create Banner"}
        </Button>
      </div>
    </form>
  );
}
