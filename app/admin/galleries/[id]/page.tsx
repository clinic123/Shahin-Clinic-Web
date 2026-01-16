"use client";

import { GalleryForm } from "@/components/admin/gallery-form";
import { useGallery, useUpdateGallery } from "@/hooks/useGalleries";
import { useParams, useRouter } from "next/navigation";

export default function EditGalleryPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data, isLoading, error } = useGallery(id);
  const updateGallery = useUpdateGallery();

  const handleSubmit = async (formData: any) => {
    try {
      await updateGallery.mutateAsync({ id, data: formData });
      router.push("/admin/galleries");
    } catch (error) {
      console.error("Failed to update gallery:", error);
    }
  };

  const handleCancel = () => {
    router.push("/admin/galleries");
  };

  if (isLoading)
    return <div className="flex justify-center p-8">Loading...</div>;
  if (error)
    return (
      <div className="flex justify-center p-8 text-red-600">
        Error: {error.message}
      </div>
    );
  if (!data)
    return <div className="flex justify-center p-8">Gallery not found</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <button
          onClick={handleCancel}
          className="text-blue-600 hover:text-blue-900 font-medium mb-4"
        >
          ← Back to Galleries
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Gallery</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <GalleryForm
          gallery={data.gallery}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={updateGallery.isPending}
        />
      </div>
    </div>
  );
}
