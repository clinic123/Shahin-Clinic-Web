"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { BannerFormData } from "@/lib/validations/banner";
import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";

const revalidateBanners = () => {
  revalidateTag("banners");
  revalidatePath("/");
  revalidatePath("/admin/banners");
};

async function requireAdmin() {
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

  return { success: true as const };
}

export async function createBannerAction(input: BannerFormData) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.success) {
      return authResult;
    }

    const { heading, description, image, button, buttonLink, published, order } =
      input;

    if (!heading?.length || !description || !image || !button) {
      return {
        success: false as const,
        error:
          "Heading, description, image, and button fields are required for banners.",
        status: 400,
      };
    }

    const maxOrderBanner = await prisma.banner.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const banner = await prisma.banner.create({
      data: {
        heading,
        description,
        image,
        button,
        buttonLink: buttonLink || null,
        published: published ?? false,
        order:
          typeof order === "number" ? order : (maxOrderBanner?.order ?? -1) + 1,
      },
    });

    revalidateBanners();

    return {
      success: true as const,
      data: banner,
      message: "Banner created successfully",
    };
  } catch (error) {
    console.error("Error creating banner:", error);
    return {
      success: false as const,
      error: "Failed to create banner",
      status: 500,
    };
  }
}

export async function updateBannerAction(
  bannerId: string,
  input: BannerFormData
) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.success) {
      return authResult;
    }

    const existingBanner = await prisma.banner.findUnique({
      where: { id: bannerId },
    });

    if (!existingBanner) {
      return {
        success: false as const,
        error: "Banner not found",
        status: 404,
      };
    }

    const banner = await prisma.banner.update({
      where: { id: bannerId },
      data: {
        heading: input.heading ?? existingBanner.heading,
        description: input.description ?? existingBanner.description,
        image: input.image ?? existingBanner.image,
        button: input.button ?? existingBanner.button,
        buttonLink:
          input.buttonLink !== undefined
            ? input.buttonLink || null
            : existingBanner.buttonLink,
        published:
          typeof input.published === "boolean"
            ? input.published
            : existingBanner.published,
        order:
          typeof input.order === "number" ? input.order : existingBanner.order,
      },
    });

    revalidateBanners();

    return {
      success: true as const,
      data: banner,
      message: "Banner updated successfully",
    };
  } catch (error) {
    console.error("Error updating banner:", error);
    return {
      success: false as const,
      error: "Failed to update banner",
      status: 500,
    };
  }
}

export async function deleteBannerAction(bannerId: string) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.success) {
      return authResult;
    }

    const existingBanner = await prisma.banner.findUnique({
      where: { id: bannerId },
    });

    if (!existingBanner) {
      return {
        success: false as const,
        error: "Banner not found",
        status: 404,
      };
    }

    await prisma.banner.delete({
      where: { id: bannerId },
    });

    revalidateBanners();

    return {
      success: true as const,
      message: "Banner deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting banner:", error);
    return {
      success: false as const,
      error: "Failed to delete banner",
      status: 500,
    };
  }
}

export async function reorderBannersAction(
  banners: { id: string; order: number }[]
) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.success) {
      return authResult;
    }

    if (!Array.isArray(banners) || banners.length === 0) {
      return {
        success: false as const,
        error: "Banners array is required",
        status: 400,
      };
    }

    await prisma.$transaction(
      banners.map((banner) =>
        prisma.banner.update({
          where: { id: banner.id },
          data: { order: banner.order },
        })
      )
    );

    revalidateBanners();

    return {
      success: true as const,
      message: "Banners reordered successfully",
    };
  } catch (error) {
    console.error("Error reordering banners:", error);
    return {
      success: false as const,
      error: "Failed to reorder banners",
      status: 500,
    };
  }
}
