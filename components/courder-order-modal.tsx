"use client";

import { useState } from "react";

import { useSession } from "@/lib/auth-client";
import { CourseType } from "@/types";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, buttonVariants } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

const createCourseOrder = async (orderData: any) => {
  const response = await fetch("/api/courses/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to enroll in course");
  }

  return response.json();
};

export default function CourseEnrollModal({
  selectedCourse,
  redirectAuth,
}: {
  selectedCourse: CourseType;
  redirectAuth: string;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [formData, setFormData] = useState({
    paymentMethod: "BKASH",
    paymentTransactionId: "",
    paymentMobile: "",
    customerPhone: "",
  });

  const enrollMutation = useMutation({
    mutationFn: createCourseOrder,
    onSuccess: (data) => {
      toast.success(
        "Course enrollment successful! You will receive access details via email."
      );
      setShowPaymentModal(false);
      setFormData({
        paymentMethod: "BKASH",
        paymentTransactionId: "",
        paymentMobile: "",
        customerPhone: "",
      });

      // Redirect to orders page or show success message
      router.push("/my-courses");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    enrollMutation.mutate({
      courseId: selectedCourse.id,
      ...formData,
    });
  };

  if (isPending) {
    return <p>Loading</p>;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Enroll Now</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle> Enroll Course</DialogTitle>
        </DialogHeader>
        {session ? (
          <div>
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold">Course: {selectedCourse.title}</p>
              <p className="text-lg font-bold text-[var(--primary)] mt-1">
                Price: ৳{selectedCourse.price}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                You will receive course access details via email after payment
                verification.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Payment Method *
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentMethod: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="BKASH">bKash</option>
                  <option value="NAGAD">Nagad</option>
                  <option value="ROCKET">Rocket</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Payment Mobile Number *
                </label>
                <input
                  type="text"
                  value={formData.paymentMobile}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentMobile: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="01XXXXXXXXX"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Transaction ID *
                </label>
                <input
                  type="text"
                  value={formData.paymentTransactionId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentTransactionId: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter transaction ID"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Your Phone Number *
                </label>
                <input
                  type="text"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, customerPhone: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Your contact number"
                  required
                />
              </div>

              {/* Payment Instructions */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2 text-sm">
                  Payment Instructions:
                </h3>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>
                    • Send ৳{selectedCourse.price} to{" "}
                    {formData.paymentMethod === "BKASH"
                      ? "bKash"
                      : formData.paymentMethod === "NAGAD"
                      ? "Nagad"
                      : "Rocket"}{" "}
                    merchant number: <strong className="text-blue-900">01741540117</strong>
                  </li>
                  <li>• Use your phone number as reference</li>
                  <li>• Enter the exact transaction ID above</li>
                  <li>• Keep the payment screenshot for verification</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <DialogClose asChild>
                  <Button className="flex-1" variant={"secondary"}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={enrollMutation.isPending}
                  className="flex-1 "
                >
                  {enrollMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    "Confirm Enrollment"
                  )}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <Link className={buttonVariants()} href={redirectAuth}>
              Please login to order
            </Link>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
