"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { getBlogPostBySlug, updateBlogPost } from "@/lib/actions/blogs";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ImageUpload } from "../ui/image-upload";

// Zod schema for form validation
const updateBlogSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  shortDescription: z.string().max(400, "Description is too long").optional(),
  content: z.string().min(1, "Content is required"),
  categorySlug: z.string().optional(),
  tagNames: z.string().optional(),
  published: z.boolean().default(false),
  featuredImage: z.string().url("Must be a valid URL"),
});

type UpdateBlogFormData = z.infer<typeof updateBlogSchema>;

interface UpdateBlogFormProps {
  slug: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  content: string;
  categorySlug?: string;
  tags?: Array<{ tag: { name: string } }>;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  featuredImage: string;
}

export function UpdateBlogForm({ slug }: UpdateBlogFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Decode the slug to handle URL encoding, with error handling
  const decodedSlug = React.useMemo(() => {
    if (!slug) return "";
    try {
      const trimmed = slug.trim();
      // Try decoding, but if it fails (already decoded), use the original
      try {
        return decodeURIComponent(trimmed);
      } catch {
        return trimmed;
      }
    } catch {
      return slug.trim();
    }
  }, [slug]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<UpdateBlogFormData>({
    resolver: zodResolver(updateBlogSchema as any),
    defaultValues: {
      title: "",
      shortDescription: "",
      content: "",
      categorySlug: "",
      tagNames: "",
      published: false,
      featuredImage: "",
    },
  });

  // Watch content for the editor
  const content = watch("content");

  const handleEditorChange = (content: string) => {
    setValue("content", content, { shouldValidate: true });
  };

  const featuredImage = watch("featuredImage");

  const handleImageChange = async (imageUrl: string) => {
    setValue("featuredImage", imageUrl, { shouldValidate: true });
  };
  const handleImageRemove = async () => {
    setValue("featuredImage", "", { shouldValidate: true });
  };

  useEffect(() => {
    let isMounted = true;
    let isPending = false;

    const fetchPost = async () => {
      if (!decodedSlug || isPending) return;
      
      isPending = true;
      setLoading(true);
      setError(null);

      try {
        // Log for debugging
        console.log("Fetching post with slug:", decodedSlug);
        
        // Pass allowUnpublished=true for admin edit pages
        const result = await getBlogPostBySlug(decodedSlug, true);
        
        // Only update state if component is still mounted
        if (!isMounted) return;
        
        if (result.success && result.data) {
          const post = result.data as BlogPost;

          reset({
            title: post.title,
            shortDescription: post.shortDescription || "",
            content: post.content,
            categorySlug: post.categorySlug || "",
            tagNames: post.tags?.map((t) => t.tag.name).join(", ") || "",
            published: post.published,
            featuredImage: post.featuredImage || "",
          });
        } else {
          console.error("Failed to fetch post:", result.error, "Slug:", decodedSlug);
          setError(result.error || "Failed to fetch post");
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Fetch post error:", err, "Slug:", decodedSlug);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        if (isMounted) {
        setLoading(false);
          isPending = false;
        }
      }
    };

    fetchPost();

    return () => {
      isMounted = false;
      isPending = false;
    };
  }, [slug, decodedSlug]); // Added decodedSlug to dependencies

  const onSubmit = async (data: UpdateBlogFormData) => {
    try {
      const result = await updateBlogPost(slug, {
        title: data.title,
        shortDescription: data.shortDescription,
        content: data.content,
        categorySlug: data.categorySlug || undefined,
        tagNames:
          data.tagNames
            ?.split(",")
            .map((tag) => tag.trim())
            .filter(Boolean) || [],
        published: data.published,
      });

      if (result.success) {
        toast.success("Success", {
          description: result.message || "Blog post updated successfully",
        });
        router.push("/blogs");
      } else {
        toast.error("Error", {
          description: result.error || "Failed to update blog post",
        });
      }
    } catch (error) {
      console.error("Update post error:", error);
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
        {error}
      </div>
    );
  }

  return (
    <Card className="w-full max-w-7xl">
      <CardHeader>
        <CardTitle>Edit Blog Post</CardTitle>
        <CardDescription>Update your blog post content</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter blog post title"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <RichTextEditor
              value={watch("shortDescription") || ""}
              onChange={(val: string) => setValue("shortDescription", val)}
              placeholder="Brief description of your post (appears in listings)"
            />
            {errors.shortDescription && (
              <p className="text-sm text-red-600">
                {errors.shortDescription.message}
              </p>
            )}
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
            {errors.shortDescription && (
              <p className="text-sm text-red-600">
                {errors.shortDescription.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <RichTextEditor
              value={content}
              onChange={handleEditorChange}
              placeholder="Enter blog post content..."
            />
            {errors.content && (
              <p className="text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categorySlug">Category</Label>
              <Input
                id="categorySlug"
                placeholder="e.g., technology, design"
                {...register("categorySlug")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagNames">Tags (comma-separated)</Label>
              <Input
                id="tagNames"
                placeholder="e.g., react, nextjs, web"
                {...register("tagNames")}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              {...register("published")}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="published" className="cursor-pointer">
              Publish
            </Label>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Updating..." : "Update Post"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
