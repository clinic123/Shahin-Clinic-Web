import Appointment from "@/components/AppointmentBook";
import BlogsListWrapper from "@/components/blog/BlogsListWrapper";
import CourseList from "@/components/courses-list";
import DynamicGallery from "@/components/home-gallery";
import { AboutSection } from "@/components/home/AboutSection";
import BookSection from "@/components/home/BookSection";
import DoctorSection from "@/components/home/DoctorSection";
import Hero from "@/components/home/Hero";
import LanguageSelector from "@/components/home/LanguageSelector";
import Team from "@/components/home/TeamSection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shaheen's Clinic - Classical Homeopathy & Holistic Healing",
  description:
    "Welcome to Shaheen's Clinic - A leading center for classical homeopathic treatment, offering personalized care for chronic diseases, comprehensive medical education, and holistic healing services in Bangladesh and worldwide.",
  keywords:
    "homeopathy, classical homeopathy, Shaheen's Clinic, holistic healing, chronic disease treatment, homeopathic medicine, Bangladesh, Dr. Shaheen Mahmud",
  openGraph: {
    title: "Shaheen's Clinic - Classical Homeopathy & Holistic Healing",
    description:
      "Leading center for classical homeopathic treatment and holistic healing in Bangladesh",
    type: "website",
  },
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    search?: string;
    limit?: string;
  }>;
}) {
  const params = await searchParams;
  const category = params.category;
  const sort = params.sort;
  const search = params.search;
  const limit = params.limit;

  return (
    <div>
      <Hero />
      <div className="py-6">
        {/* <GalleryList params="home" /> */}
        <DynamicGallery params="home" />
      </div>
      <DoctorSection />
      <Team sort={sort} search={search} params="homepage" limit={limit} />

      <BlogsListWrapper
        category={category}
        sort={sort}
        search={search}
        params="homepage"
      />
      <Appointment />
      {/* <Gallery /> */}
      <BookSection />
      <CourseList redirectAuth="/login?redirect=/" params="home" />
      <AboutSection />
      <LanguageSelector />
      {/* <NoticeButton /> */}
    </div>
  );
}
