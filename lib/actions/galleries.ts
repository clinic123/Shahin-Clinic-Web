"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { GalleryFormData } from "@/lib/validations/gallery";
import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";

const revalidateGalleries = () => {
  revalidateTag("galleries");
  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin/galleries");
};

async function ensureAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return {
      success: false as const,
      error: "Unauthorized - Admin access required",
      status: 401,
    };
  }

  return { success: true as const, session };
}

export async function createGalleryAction(input: GalleryFormData) {
  try {
    const authResult = await ensureAdmin();
    if (!authResult.success) return authResult;

    const { title, description, featuredImage, published } = input;

    if (!title || !description || !featuredImage) {
      return {
        success: false as const,
        error: "Title, description and featured image are required.",
        status: 400,
      };
    }

    const gallery = await prisma.gallery.create({
      data: {
        title,
        description,
        featuredImage,
        published: published ?? false,
        publishedAt: published ? new Date() : null,
      },
    });

    revalidateGalleries();

    return {
      success: true as const,
      data: gallery,
      message: "Gallery created successfully",
    };
  } catch (error) {
    console.error("Error creating gallery:", error);
    return {
      success: false as const,
      error: "Failed to create gallery",
      status: 500,
    };
  }
}

export async function updateGalleryAction(
  galleryId: string,
  input: GalleryFormData
) {
  try {
    const authResult = await ensureAdmin();
    if (!authResult.success) return authResult;

    const existing = await prisma.gallery.findUnique({
      where: { id: galleryId },
    });

    if (!existing) {
      return {
        success: false as const,
        error: "Gallery not found",
        status: 404,
      };
    }

    const gallery = await prisma.gallery.update({
      where: { id: galleryId },
      data: {
        title: input.title ?? existing.title,
        description: input.description ?? existing.description,
        featuredImage: input.featuredImage ?? existing.featuredImage,
        published:
          typeof input.published === "boolean"
            ? input.published
            : existing.published,
        publishedAt:
          typeof input.published === "boolean"
            ? input.published
              ? new Date()
              : null
            : existing.publishedAt,
      },
    });

    revalidateGalleries();

    return {
      success: true as const,
      data: gallery,
      message: "Gallery updated successfully",
    };
  } catch (error) {
    console.error("Error updating gallery:", error);
    return {
      success: false as const,
      error: "Failed to update gallery",
      status: 500,
    };
  }
}

export async function deleteGalleryAction(galleryId: string) {
  try {
    const authResult = await ensureAdmin();
    if (!authResult.success) return authResult;

    const existing = await prisma.gallery.findUnique({
      where: { id: galleryId },
    });

    if (!existing) {
      return {
        success: false as const,
        error: "Gallery not found",
        status: 404,
      };
    }

    await prisma.gallery.delete({
      where: { id: galleryId },
    });

    revalidateGalleries();

    return {
      success: true as const,
      message: "Gallery deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting gallery:", error);
    return {
      success: false as const,
      error: "Failed to delete gallery",
      status: 500,
    };
  }
}

