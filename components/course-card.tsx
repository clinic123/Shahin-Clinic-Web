import { CourseType } from "@/types";
import Image from "next/image";
import Link from "next/link";
import CourseEnrollModal from "./courder-order-modal";
import { buttonVariants } from "./ui/button";

export const CourseCard = ({
  course,
  redirectAuth,
}: {
  course: CourseType;
  redirectAuth: string;
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="w-full  aspect-16/10 relative  overflow-hidden">
        <Image
          src={course.image}
          alt={course.title}
          fill
          priority
          className="object-contain transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 line-clamp-2">
            {course.title}
          </h3>
        </div>

        <div className="flex items-center justify-between">
          {course.category && (
            <p className=" px-2 py-1 m-0 bg-amber-100 text-gray-700 text-xs rounded-sm mb-4">
              {course.category}
            </p>
          )}
          <p className="text-2xl font-bold text-green-600">৳ {course.price}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <Link
            href={`/courses/${course.id}`}
            className={buttonVariants({
              variant: "secondary",
            })}
          >
            View Details
          </Link>
          <CourseEnrollModal
            redirectAuth={redirectAuth}
            selectedCourse={course}
          />
        </div>
      </div>
    </div>
  );
};
