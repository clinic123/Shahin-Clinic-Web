"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteBlogPost } from "@/lib/actions/blogs";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";
interface DeleteBlogDialogProps {
  slug: string;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteBlogDialog({
  slug,
  title,
  open,
  onOpenChange,
}: DeleteBlogDialogProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      const result = await deleteBlogPost(slug);

      if (result.success) {
        toast.success("Success", {
          description: result.message || "Blog post deleted successfully",
        });
        onOpenChange(false);
        router.push("/blogs");
      } else {
        toast.error("Error", {
          description: result.error || "Failed to delete blog post",
        });
      }
    } catch (error) {
      console.error("[v0] Delete post error:", error);
      toast.error("error", {
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold">{title}</span>? This action cannot
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-3 justify-end">
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
