"use client";

import { useDeleteCourse, useUpdateCourse } from "@/hooks/useCourses";
import { useSession } from "@/lib/auth-client";
import { CourseType } from "@/types";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button, buttonVariants } from "./ui/button";
const fetchCourses = async (): Promise<CourseType[]> => {
  const response = await fetch("/api/courses");
  if (!response.ok) {
    throw new Error("Failed to fetch courses");
  }
  const data = await response.json();
  return data.courses;
};

export default function AdminClientCoursesPage() {
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();
  const { data: session, isPending: isLoadingSession } = useSession();

  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: fetchCourses,
    enabled: !!session,
  });

  if (isLoadingSession) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Courses</h1>
        <Link href={"/admin/courses/create"} className={buttonVariants()}>
          Create New Course
        </Link>
      </div>

      {isLoading ? (
        <div>Loading courses...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses?.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-md p-6">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
              <h3 className="text-xl font-bold mb-2">{course.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {course.shortDescription}
              </p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-bold text-primary">
                  ৳{course.price}
                </span>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    course.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {course.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant={"destructive"}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
