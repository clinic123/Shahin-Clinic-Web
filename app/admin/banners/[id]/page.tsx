// app/admin/banners/[id]/page.tsx
"use client";

import { BannerForm } from "@/components/admin/banner-form";
import { Button } from "@/components/ui/button";
import { useBanner, useUpdateBanner } from "@/hooks/useBanners";
import { useParams, useRouter } from "next/navigation";

export default function EditBannerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: banner, isLoading, error } = useBanner(id);
  const updateBanner = useUpdateBanner();

  const handleSubmit = async (formData: any) => {
    try {
      await updateBanner.mutateAsync({ id, data: formData });
      router.push("/admin/banners");
    } catch (error) {
      console.error("Failed to update banner:", error);
      alert("Failed to update banner");
    }
  };

  const handleCancel = () => {
    router.push("/admin/banners");
  };

  if (isLoading)
    return <div className="flex justify-center p-8">Loading...</div>;
  if (error)
    return (
      <div className="flex justify-center p-8 text-red-600">
        Error: {error.message}
      </div>
    );
  if (!banner)
    return <div className="flex justify-center p-8">Banner not found</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button onClick={handleCancel} variant="outline" className="mb-4">
          ← Back to Banners
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Banner</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <BannerForm
          banner={banner}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={updateBanner.isPending}
        />
      </div>
    </div>
  );
}
