// app/my-courses/page.tsx
"use client";

import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaVideo } from "react-icons/fa6";

interface CourseOrder {
  id: string;
  status: string;
  totalAmount: number;
  accessGranted: boolean;
  accessCode?: string;
  createdAt: string;
  videoLink?: string;
  course: {
    id: string;
    title: string;
    description: string;
    shortDescription: string;
    image: string;
    price: number;
    videoUrl?: string;
  };
}

const fetchMyCourseOrders = async (): Promise<{
  success: boolean;
  data: CourseOrder[];
}> => {
  const response = await fetch("/api/courses/order");
  if (!response.ok) {
    throw new Error("Failed to fetch course orders");
  }
  return response.json();
};

export default function MyCoursesPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<CourseOrder | null>(
    null
  );
  const [openCourseDetails, setOpenCourseDetails] = useState(false);

  const {
    data: courseOrdersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["my-course-orders"],
    queryFn: fetchMyCourseOrders,
    enabled: !!session,
  });

  if (isPending || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push("login?redirect=/my-courses");
    return null;
  }

  const courseOrders = courseOrdersData?.data || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACCESS_GRANTED":
        return "bg-green-100 text-green-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACCESS_GRANTED":
        return "Access Granted";
      case "CONFIRMED":
        return "Payment Confirmed";
      case "PENDING":
        return "Pending Review";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <p className="text-gray-600 mt-2">
          Manage your course enrollments and access
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">Error loading courses: {error.message}</p>
        </div>
      )}

      {courseOrders.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <svg
              className="w-24 h-24 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h2 className="text-2xl font-semibold mb-4">No Courses Yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't enrolled in any courses yet.
            </p>
            <button
              onClick={() => router.push("/courses")}
              className="bg-[var(--primary)] text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition font-semibold"
            >
              Browse Courses
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courseOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
            >
              <div className="w-full h-auto aspect-video  overflow-hidden">
                <Image
                  src={order.course.image}
                  alt={order.course.title}
                  width={265}
                  height={147}
                  className=" w-full h-auto aspect-video object-cover "
                />
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusText(order.status)}
                  </span>
                  <span className="text-lg font-bold text-primary">
                    ৳{order.totalAmount}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-2 text-gray-900">
                  {order.course.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {order.course.shortDescription}
                </p>

                <div className="space-y-3">
                  <div className="text-sm text-gray-500">
                    <p>
                      Enrolled on:{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {order.accessGranted && order.accessCode && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-green-800 text-sm font-semibold mb-1">
                        Access Granted ✅
                      </p>

                      <a
                        href={order.videoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="s">Watch Video</Button>
                      </a>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {order.accessGranted && order.videoLink ? (
                      <a
                        href={order.course.videoUrl}
                        target="_blank"
                        className={cn(
                          buttonVariants(),
                          "flex-1 cursor-pointer"
                        )}
                        onClick={(e) => e.preventDefault()}
                      >
                        <FaVideo />
                        Start Learning
                      </a>
                    ) : (
                      <button
                        disabled
                        className="flex-1 bg-gray-300 text-gray-500 py-2 px-4 rounded text-center cursor-not-allowed font-medium"
                      >
                        {order.status === "PENDING"
                          ? "Pending Access"
                          : "Access Pending"}
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedCourse(order);
                        setOpenCourseDetails(true);
                      }}
                      className="bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200 transition font-medium"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Course Details Modal */}
      {selectedCourse && (
        <Dialog open={openCourseDetails} onOpenChange={setOpenCourseDetails}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Course Details</DialogTitle>
            </DialogHeader>
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div>
                <div className="space-y-6">
                  <div className="w-full h-auto aspect-video  overflow-hidden">
                    <Image
                      src={selectedCourse.course.image}
                      alt={selectedCourse.course.title}
                      width={265}
                      height={147}
                      className=" w-full h-auto aspect-video object-cover "
                    />
                  </div>
                  <div className="flex items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">
                        {selectedCourse.course.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {selectedCourse.course.shortDescription}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-semibold">Status</p>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              selectedCourse.status
                            )}`}
                          >
                            {getStatusText(selectedCourse.status)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">Price</p>
                          <p>৳{selectedCourse.totalAmount}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Enrollment Date</p>
                          <p>
                            {new Date(
                              selectedCourse.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold">Order ID</p>
                          <p className="font-mono text-xs">
                            {selectedCourse.id.slice(-8).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedCourse.accessGranted &&
                    selectedCourse.accessCode && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-800 mb-2">
                          Course Access Information
                        </h4>
                        <div className="space-y-2">
                          <p className="text-green-700">
                            <strong>Access Code:</strong>{" "}
                            <code className="font-mono bg-green-100 px-2 py-1 rounded text-lg font-bold">
                              {selectedCourse.accessCode}
                            </code>
                          </p>
                          {selectedCourse.course.videoUrl && (
                            <p className="text-green-700">
                              <strong>Video Link:</strong>{" "}
                              <a
                                href={selectedCourse.course.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:no-underline"
                              >
                                Click here to access
                              </a>
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                  {!selectedCourse.accessGranted && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">
                        Access Pending
                      </h4>
                      <p className="text-yellow-700">
                        Your course access is being processed. You will receive
                        an email with your access details once approved. This
                        usually takes 1-2 business days.
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end pt-4 border-t">
                    <Button
                      variant={"secondary"}
                      onClick={() => setSelectedCourse(null)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
