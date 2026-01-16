"use client";

import { GalleryForm } from "@/components/admin/gallery-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Gallery, useGalleries } from "@/hooks/useGalleries";
import {
  createGalleryAction,
  deleteGalleryAction,
  updateGalleryAction,
} from "@/lib/actions/galleries";
import Image from "next/image";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { GalleryFormData } from "@/lib/validations/gallery";

export default function GalleriesAdminPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState<Gallery | null>(null);
  const { data: galleries, isLoading, error } = useGalleries();
  const queryClient = useQueryClient();
  const [actionInProgress, setActionInProgress] = useState<
    null | "save" | "delete"
  >(null);

  const refreshGalleries = async () => {
    await queryClient.invalidateQueries({ queryKey: ["galleries"] });
  };

  const handleCreate = () => {
    setEditingGallery(null);
    setIsFormOpen(true);
  };

  const handleEdit = (gallery: Gallery) => {
    setEditingGallery(gallery);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this gallery?")) {
      return;
    }

    try {
      setActionInProgress("delete");
      const result = await deleteGalleryAction(id);
      if (!result.success) {
        throw new Error(result.error || "Failed to delete gallery");
      }
      toast.success(result.message ?? "Gallery deleted successfully");
      await refreshGalleries();
    } catch (error) {
      console.error("Failed to delete gallery:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete gallery"
      );
    } finally {
      setActionInProgress(null);
    }
  };

  const handleSubmit = async (data: GalleryFormData) => {
    try {
      setActionInProgress("save");
      if (editingGallery) {
        const result = await updateGalleryAction(editingGallery.id, data);
        if (!result.success) {
          throw new Error(result.error || "Failed to update gallery");
        }
        toast.success(result.message ?? "Gallery updated successfully");
      } else {
        const result = await createGalleryAction(data);
        if (!result.success) {
          throw new Error(result.error || "Failed to create gallery");
        }
        toast.success(result.message ?? "Gallery created successfully");
      }
      setIsFormOpen(false);
      setEditingGallery(null);
      await refreshGalleries();
    } catch (error) {
      console.error("Failed to save gallery:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save gallery"
      );
    } finally {
      setActionInProgress(null);
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingGallery(null);
  };

  const allGalleries =
    galleries?.pages.flatMap((page) => page.galleries || page) || [];

  if (isLoading)
    return <div className="flex justify-center p-8">Loading...</div>;
  if (error)
    return (
      <div className="flex justify-center p-8 text-red-600">
        Error: {error.message}
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Galleries</h1>
        <Button onClick={handleCreate}>Create New Gallery</Button>
      </div>

      <Dialog onOpenChange={setIsFormOpen} open={isFormOpen}>
        <DialogHeader>
          <DialogTitle>
            {editingGallery ? "Edit Gallery" : "Create New Gallery"}
          </DialogTitle>
        </DialogHeader>
        <DialogContent>
          <GalleryForm
            gallery={editingGallery || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={actionInProgress === "save"}
          />
        </DialogContent>
      </Dialog>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {allGalleries?.map((gallery) => (
            <li key={gallery.id}>
              <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                <div className="flex items-center">
                  <Image
                    src={gallery.featuredImage}
                    alt={gallery.title}
                    className="h-16 w-16 object-cover rounded"
                    width={64}
                    height={64}
                  />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {gallery.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {gallery.description}
                    </p>
                    <div className="flex items-center mt-1 space-x-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          gallery.published
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {gallery.published ? "Published" : "Draft"}
                      </span>
                      <span className="text-xs text-gray-500">
                        Created:{" "}
                        {new Date(gallery.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => handleEdit(gallery)}>Edit</Button>
                  <Button
                    onClick={() => handleDelete(gallery.id)}
                    disabled={actionInProgress === "delete"}
                    variant={"destructive"}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {allGalleries?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No galleries found.</p>
            <Button onClick={handleCreate} className="mt-4">
              Create your first gallery
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
