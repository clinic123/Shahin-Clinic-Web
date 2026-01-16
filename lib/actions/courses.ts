"use server";

import { auth } from "@/lib/auth";
import { PrismaClient } from "@/prisma/generated/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";

const prisma = new PrismaClient();

interface CreateCourseInput {
  title: string;
  description: string;
  image: string;
  price: number;
  videoUrl?: string;
  shortDescription: string;
  category?: string;
}

interface UpdateCourseInput {
  title?: string;
  description?: string;
  image?: string;
  price?: number;
  videoUrl?: string;
  shortDescription?: string;
  category?: string;
  isActive?: boolean;
}

export async function createCourse(input: CreateCourseInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return {
        success: false,
        error: "Unauthorized - Admin access required",
        status: 401,
      };
    }

    // Validate required fields
    if (
      !input.title ||
      !input.description ||
      !input.image ||
      input.price === undefined ||
      !input.shortDescription
    ) {
      return {
        success: false,
        error: "Missing required fields",
        status: 400,
      };
    }

    // Create course
    const course = await prisma.course.create({
      data: {
        title: input.title,
        description: input.description,
        image: input.image,
        price: parseFloat(String(input.price)),
        videoUrl: input.videoUrl || null,
        shortDescription: input.shortDescription,
        category: input.category || null,
      },
    });

    // Revalidate
    revalidateTag("courses");
    revalidateTag(`course-${course.id}`);
    revalidatePath("/courses");
    revalidatePath(`/courses/${course.id}`); // Course detail page
    revalidatePath("/"); // Homepage where CourseList is displayed
    revalidatePath("/admin/courses");

    return {
      success: true,
      data: course,
      message: "Course created successfully",
    };
  } catch (error) {
    console.error("Error creating course:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create course",
      status: 500,
    };
  }
}

export async function updateCourse(courseId: string, input: UpdateCourseInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return {
        success: false,
        error: "Unauthorized - Admin access required",
        status: 401,
      };
    }

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      return {
        success: false,
        error: "Course not found",
        status: 404,
      };
    }

    // Prepare update data
    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.image !== undefined) updateData.image = input.image;
    if (input.price !== undefined)
      updateData.price = parseFloat(String(input.price));
    if (input.videoUrl !== undefined) updateData.videoUrl = input.videoUrl;
    if (input.shortDescription !== undefined)
      updateData.shortDescription = input.shortDescription;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    // Update course
    const course = await prisma.course.update({
      where: { id: courseId },
      data: updateData,
    });

    // Revalidate
    revalidateTag("courses");
    revalidateTag(`course-${courseId}`);
    revalidatePath("/courses");
    revalidatePath("/admin/courses");

    return {
      success: true,
      data: course,
      message: "Course updated successfully",
    };
  } catch (error) {
    console.error("Error updating course:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update course",
      status: 500,
    };
  }
}

export async function deleteCourse(courseId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return {
        success: false,
        error: "Unauthorized - Admin access required",
        status: 401,
      };
    }

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      return {
        success: false,
        error: "Course not found",
        status: 404,
      };
    }

    // Soft delete by setting isActive to false
    await prisma.course.update({
      where: { id: courseId },
      data: { isActive: false },
    });

    // Revalidate
    revalidateTag("courses");
    revalidateTag(`course-${courseId}`);
    revalidatePath("/courses");
    revalidatePath("/admin/courses");

    return {
      success: true,
      message: "Course deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting course:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete course",
      status: 500,
    };
  }
}

