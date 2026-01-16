"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteCaseStudy } from "@/hooks/useCaseStudies";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function DeleteCaseStudyDialog({
  slug,
  title,
  open,
  onOpenChange,
}: {
  slug: string;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const deleteCaseStudy = useDeleteCaseStudy();

  const handleDelete = async () => {
    try {
      await deleteCaseStudy.mutateAsync(slug);
      toast.success("Case study deleted successfully");
      router.refresh();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete case study");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Case Study</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{title}&quot;? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteCaseStudy.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteCaseStudy.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

