import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";

import { NextRequest, NextResponse } from "next/server";

const revalidateBanners = () => {
  revalidateTag("banners");
  revalidatePath("/");
  revalidatePath("/admin/banners");
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get("published");

    const where = {
      ...(published !== null && { published: published === "true" }),
    };

    const banners = await prisma.banner.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(banners);
  } catch (error: any) {
    console.error("Error fetching banners:", error);
    return NextResponse.json(
      { message: "Failed to fetch banners", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      heading,
      description,
      image,
      button,
      buttonLink,
      published,
      order,
    } = await request.json();

    // Validate required fields
    if (!heading || !description || !image || !button) {
      return NextResponse.json(
        { error: "Heading, description, image, and button are required" },
        { status: 400 }
      );
    }

    // Get the maximum order to place new banner at the end
    const maxOrderBanner = await prisma.banner.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const bannerOrder =
      order !== undefined ? order : (maxOrderBanner?.order || 0) + 1;

    const banner = await prisma.banner.create({
      data: {
        heading,
        description,
        image,
        button,
        buttonLink: buttonLink || null,
        published: published || false,
        order: bannerOrder,
      },
    });

    revalidateBanners();

    return NextResponse.json(banner);
  } catch (error: any) {
    console.error("Error creating banner:", error);
    return NextResponse.json(
      { error: "Internal server error creating banner" },
      { status: 500 }
    );
  }
}
