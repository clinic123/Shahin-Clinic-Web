"use client";
import CourseEnrollModal from "@/components/courder-order-modal";
import LoadingUi from "@/components/loading";
import TiptapViewer from "@/components/TiptapRenderer";
import { Badge } from "@/components/ui/badge";
import { HeroVideoDialog } from "@/components/ui/hero-video-dialog";
import { useCourse } from "@/hooks/useCourses";
import { CourseType } from "@/types";

interface CourseDetailsProps {
  id?: string;
  course?: CourseType | null;
}

const CourseDetails = ({ id, course: serverCourse }: CourseDetailsProps) => {
  // Use server-side course data if available, otherwise fetch client-side
  const { data: clientCourse, isLoading, error } = useCourse(
    id as any,
    {
      enabled: !serverCourse && !!id, // Only fetch if no server course provided
    }
  );

  const courseData = serverCourse || clientCourse?.data;

  if (!serverCourse && isLoading) {
    return <LoadingUi />;
  }

  if (!serverCourse && error) {
    return (
      <div className="container py-6 lg:py-10">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600">
            Failed to fetch course
          </h2>
          <p className="text-gray-600 mt-2">
            {error instanceof Error ? error.message : "Please try again later"}
          </p>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="container py-6 lg:py-10">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Course not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 lg:py-10">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
        <div className="lg:basis-[55%] basis-full space-y-4">
          <Badge className="bg-green-600 px-4 py-0.5 rounded-full">
            <span>লাইভ কোর্স</span>
          </Badge>
          <h1 className="text-2xl font-semibold">{courseData.title}</h1>
          <p className="text-sm xl:text-base font-normal tracking-wider text-neutral-700">
            {courseData.shortDescription}
          </p>
          <TiptapViewer content={courseData.description} />
          <div className="inline-flex items-center gap-4">
            <CourseEnrollModal
              redirectAuth={`/login?redirect=/courses/${id}`}
              selectedCourse={courseData as CourseType}
            />
            <h3 className="text-3xl font-bold">
              ৳{courseData.price.toLocaleString()}
            </h3>
          </div>
        </div>
        <div className="basis-full relative lg:basis-[40%]">
          <HeroVideoDialog
            className="block aspect-video"
            animationStyle="from-center"
            videoSrc={
              courseData.videoUrl ||
              "https://www.youtube.com/embed/1-0vQiTP1qM"
            }
            thumbnailSrc={courseData.image || "/course.png"}
            thumbnailAlt={courseData.title}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
