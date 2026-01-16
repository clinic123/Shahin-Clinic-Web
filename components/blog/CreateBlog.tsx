"use client";

import RichTextEditor from "@/components/ui/rich-text-editor";
import { useCategories } from "@/hooks/useCategories";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { ImageUpload } from "../ui/image-upload";

const CreatePostForm = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  published: z.boolean().default(false),
  categorySlug: z.string().min(1, "Category is required"),
  tagNames: z.string().optional(),
  shortDescription: z.string().min(1).max(350).optional(),
  featuredImage: z.string().url("Must be a valid URL"),
});

type CreatePostForm = z.infer<typeof CreatePostForm>;

export default function CreateBlogPage({
  params,
}: {
  params: "blogs" | "admin";
}) {
  const router = useRouter();
  const { categoriesQuery, createCategoryMutation } = useCategories();
  const [newCategory, setNewCategory] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<CreatePostForm>({
    defaultValues: {
      title: "",
      published: true,
      content: "",
      categorySlug: "",
      tagNames: "",
      shortDescription: "",
      featuredImage: "",
    },
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: CreatePostForm) => {
      const newData = {
        ...data,
        tagNames:
          data.tagNames
            ?.split(",")
            .map((tag) => tag.trim())
            .filter(Boolean) || [],
        featuredImage,
      };

      const response = await fetch(`/api/blogs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create post");
      }
      return response.json();
    },
    onSuccess: () =>
      router.push(params === "blogs" ? "/blogs" : "/admin/blogs"),
    onError: (err: Error) => alert(err.message),
  });

  const content = watch("content");

  const featuredImage = watch("featuredImage");

  const handleImageChange = async (imageUrl: string) => {
    setValue("featuredImage", imageUrl, { shouldValidate: true });
  };
  const handleImageRemove = async () => {
    setValue("featuredImage", "", { shouldValidate: true });
  };

  const onSubmit = (data: CreatePostForm) => {
    createPostMutation.mutate(data);
  };

  async function handleAddCategory() {
    if (!newCategory.trim()) return;
    await createCategoryMutation.mutateAsync(newCategory);
    setNewCategory("");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create Post</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            {...register("title", { required: "Title is required" })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Short Description */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Short Description
          </label>
          <textarea
            {...register("shortDescription")}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Brief description of the post..."
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="tagNames">Tags (comma-separated)</label>
          <input
            id="tagNames"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            {...register("tagNames")}
            placeholder="e.g., doctor, consulting, care"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium mb-2">
            Features Image
          </label>
          <ImageUpload
            onImageChange={handleImageChange}
            onImageRemove={handleImageRemove}
            currentImage={featuredImage}
            variant="image-box"
          />
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Category *</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Add new category..."
              className="flex-1 border rounded px-3 py-2"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              disabled={createCategoryMutation.isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {createCategoryMutation.isPending ? "Adding..." : "Add"}
            </button>
          </div>

          {categoriesQuery.isLoading ? (
            <p>Loading categories...</p>
          ) : (
            <select
              {...register("categorySlug", { required: "Select a category" })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select category</option>
              {categoriesQuery.data?.map((cat: any) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}
          {errors.categorySlug && (
            <p className="text-red-500 text-sm mt-1">
              {errors.categorySlug.message as string}
            </p>
          )}
        </div>

        {/* Published */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              {...register("published")}
              className="mr-2"
            />
            Published
          </label>
        </div>

        {/* Content Editor */}
        <div>
          <label className="block text-sm font-medium mb-2">Content *</label>
          <RichTextEditor
            value={content}
            onChange={(val: string) => setValue("content", val)}
            placeholder="Enter blog post content..."
          />
          {errors.content && (
            <p className="text-red-500 text-sm mt-1">
              {errors.content.message}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting || createPostMutation.isPending}
            className="bg-primary text-white px-6 py-2 rounded-md disabled:opacity-50"
          >
            {isSubmitting || createPostMutation.isPending
              ? "Creating..."
              : "Create Post"}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border rounded-md"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
