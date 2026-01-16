import CourseList from "@/components/courses-list";
import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import CourseDetails from "./course-details";

interface CourseRecord {
  id: string;
  title: string;
  description: string;
  shortDescription: string | null;
  image: string;
  price: number;
  videoUrl: string | null;
  category: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

async function getCourseById(courseId: string): Promise<CourseRecord | null> {
  // Validate courseId
  if (!courseId || courseId.trim() === "") {
    return null;
  }

  // Use unstable_cache for better cache control with revalidation tags
  const getCachedCourse = unstable_cache(
    async () => {
      const course = await prisma.course.findUnique({
        where: {
          id: courseId.trim(),
          isActive: true,
        },
        select: {
          id: true,
          title: true,
          description: true,
          shortDescription: true,
          image: true,
          price: true,
          videoUrl: true,
          category: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return course;
    },
    [`course-${courseId}`],
    {
      tags: [`course-${courseId}`, "courses"],
      revalidate: 60, // Revalidate every 60 seconds to show updated courses
    }
  );

  return getCachedCourse();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const course = await getCourseById(id);

  if (!course) {
    return {
      title: "Course Not Found - Shaheen's Clinic",
      description: "The requested course could not be found.",
    };
  }

  return {
    title: `${course.title} - Homeopathy Course | Shaheen's Clinic`,
    description: course.shortDescription || course.description || `Enroll in ${course.title} course at Shaheen's Clinic.`,
    keywords: `${course.title}, homeopathy course, ${course.category || ""}, medical course, Shaheen's Clinic`.trim(),
  };
}

const CourseDetailsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  try {
    const course = await getCourseById(id);

    if (!course) {
      notFound();
    }

    return (
      <div className="bg-gray-100">
        <CourseDetails id={id} course={course} />
        <CourseList
          redirectAuth={`/login?redirect=/courses/${id}`}
          params="similar"
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching course:", error);
    notFound();
  }
};

export default CourseDetailsPage;
