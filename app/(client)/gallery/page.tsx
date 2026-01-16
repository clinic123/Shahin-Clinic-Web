import DynamicGallery from "@/components/home-gallery";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery - Shaheen's Clinic | Photos & Media",
  description: "Browse our gallery featuring clinic photos, events, certificates, and media from Shaheen's Clinic. Get a glimpse of our facility and activities.",
  keywords: "Shaheen's Clinic gallery, clinic photos, medical facility, homeopathy clinic images",
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sort?: string;
    limit?: string;
  }>;
}

export default async function GalleryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return (
    <section>
      <DynamicGallery
        params="gallery"
        page={params.page}
        search={params.search}
        sort={params.sort}
        limit={params.limit}
      />
    </section>
  );
}
