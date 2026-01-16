// app/admin/banners/page.tsx
"use client";

import { BannerForm } from "@/components/admin/banner-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Banner, useBanners } from "@/hooks/useBanners";
import {
  createBannerAction,
  deleteBannerAction,
  reorderBannersAction,
  updateBannerAction,
} from "@/lib/actions/banners";
import { BannerFormData } from "@/lib/validations/banner";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export default function BannersAdminPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const { data: banners, isLoading, error } = useBanners();
  const queryClient = useQueryClient();
  const [actionInProgress, setActionInProgress] = useState<
    null | "save" | "delete" | "reorder" | "publish"
  >(null);

  const refreshBanners = async () => {
    await queryClient.invalidateQueries({ queryKey: ["banners"] });
  };

  const handleCreate = () => {
    setEditingBanner(null);
    setIsFormOpen(true);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;

    try {
      setActionInProgress("delete");
      const result = await deleteBannerAction(id);
      if (!result.success) {
        throw new Error(result.error || "Failed to delete banner");
      }
      toast.success(result.message ?? "Banner deleted successfully");
      await refreshBanners();
    } catch (error) {
      console.error("Failed to delete banner:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete banner"
      );
    } finally {
      setActionInProgress(null);
    }
  };

  const handleSubmit = async (data: BannerFormData) => {
    try {
      setActionInProgress("save");
      if (editingBanner) {
        const result = await updateBannerAction(editingBanner.id, data);
        if (!result.success) {
          throw new Error(result.error || "Failed to update banner");
        }
        toast.success(result.message ?? "Banner updated successfully");
      } else {
        const result = await createBannerAction(data);
        if (!result.success) {
          throw new Error(result.error || "Failed to create banner");
        }
        toast.success(result.message ?? "Banner created successfully");
      }
      setIsFormOpen(false);
      setEditingBanner(null);
      await refreshBanners();
    } catch (error) {
      console.error("Failed to save banner:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save banner"
      );
    } finally {
      setActionInProgress(null);
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingBanner(null);
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || !banners) return;

    const items = Array.from(banners);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order based on new position
    const reorderedBanners = items.map((banner, index) => ({
      id: banner.id,
      order: index,
    }));

    try {
      setActionInProgress("reorder");
      const reorderResult = await reorderBannersAction(reorderedBanners);
      if (!reorderResult.success) {
        throw new Error(reorderResult.error || "Failed to reorder banners");
      }
      toast.success(reorderResult.message ?? "Banners reordered successfully");
      await refreshBanners();
    } catch (error) {
      console.error("Failed to reorder banners:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to reorder banners"
      );
    } finally {
      setActionInProgress(null);
    }
  };

  const togglePublish = async (banner: Banner) => {
    try {
      setActionInProgress("publish");
      const result = await updateBannerAction(banner.id, {
        heading: banner.heading,
        description: banner.description,
        image: banner.image,
        button: banner.button,
        published: !banner.published,
        order: banner.order,
      });
      if (!result.success) {
        throw new Error(result.error || "Failed to update banner");
      }
      toast.success("Banner updated");
      await refreshBanners();
    } catch (error) {
      console.error("Failed to update banner:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update banner"
      );
    } finally {
      setActionInProgress(null);
    }
  };

  const isSaving = actionInProgress === "save";
  const isDeleting = actionInProgress === "delete";

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Banners</h1>
          <p className="text-gray-600 mt-2">Drag and drop to reorder banners</p>
        </div>
        <Button onClick={handleCreate}>Create New Banner</Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            {editingBanner ? "Edit Banner" : "Create New Banner"}
          </DialogHeader>
          <BannerForm
            banner={editingBanner || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSaving}
          />
        </DialogContent>
      </Dialog>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {banners && banners.length > 0 ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="banners">
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="divide-y divide-gray-200"
                >
                  {banners.map((banner, index) => (
                    <Draggable
                      key={banner.id}
                      draggableId={banner.id}
                      index={index}
                    >
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="bg-white"
                        >
                          <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                            <div className="flex items-center flex-1">
                              {/* Drag Handle */}
                              <div
                                {...provided.dragHandleProps}
                                className="mr-4 cursor-move text-gray-400 hover:text-gray-600"
                              >
                                <svg
                                  className="w-6 h-6"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 8h16M4 16h16"
                                  />
                                </svg>
                              </div>

                              {/* Banner Image */}
                              <img
                                src={banner.image}
                                alt={banner.heading[0]}
                                className="h-20 w-32 object-cover rounded"
                              />

                              {/* Banner Content */}
                              <div className="ml-4 flex-1">
                                <div className="flex items-center space-x-2">
                                  <h3 className="text-lg font-medium text-gray-900">
                                    {banner.heading.join(" ")}
                                  </h3>
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      banner.published
                                        ? "bg-green-100 text-green-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {banner.published ? "Published" : "Draft"}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    Order: {banner.order}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                                  {banner.description}
                                </p>
                                <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                                  <span>Button: {banner.button}</span>
                                  <span>
                                    Created:{" "}
                                    {new Date(
                                      banner.createdAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2 ml-4">
                              <Button
                                onClick={() => togglePublish(banner)}
                                variant="outline"
                                size="sm"
                                disabled={
                                  isSaving || actionInProgress === "publish"
                                }
                              >
                                {banner.published ? "Unpublish" : "Publish"}
                              </Button>
                              <Button
                                onClick={() => handleEdit(banner)}
                                variant="outline"
                                size="sm"
                              >
                                Edit
                              </Button>
                              <Button
                                onClick={() => handleDelete(banner.id)}
                                variant="destructive"
                                size="sm"
                                disabled={isDeleting}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No banners found.</p>
            <Button onClick={handleCreate} className="mt-4">
              Create your first banner
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      {banners && banners.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">
              Total Banners
            </h3>
            <p className="text-3xl font-bold text-blue-600">{banners.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Published</h3>
            <p className="text-3xl font-bold text-green-600">
              {banners.filter((b) => b.published).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Drafts</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {banners.filter((b) => !b.published).length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
