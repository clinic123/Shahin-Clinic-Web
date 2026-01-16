import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";

import { NextRequest, NextResponse } from "next/server";

const revalidateBanners = () => {
  revalidateTag("banners");
  revalidatePath("/");
  revalidatePath("/admin/banners");
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Banner id is required" },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json({ banner });
  } catch (error) {
    console.error("Error fetching banner:", error);
    return NextResponse.json(
      { error: "Error fetching banner" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Check if banner exists
    const existingBanner = await prisma.banner.findUnique({
      where: { id },
    });

    if (!existingBanner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        heading,
        description,
        image,
        button,
        buttonLink: buttonLink ?? existingBanner.buttonLink,
        published,
        order: order !== undefined ? order : existingBanner.order,
      },
    });

    revalidateBanners();

    return NextResponse.json(banner);
  } catch (error) {
    console.error("Error updating banner:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if banner exists
    const banner = await prisma.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    await prisma.banner.delete({
      where: { id },
    });

    revalidateBanners();

    return NextResponse.json({
      message: "Banner deleted successfully",
      banner,
    });
  } catch (error) {
    console.error("Error deleting banner:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
