import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const revalidateGalleries = () => {
  revalidateTag("galleries");
  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin/galleries");
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") || "newest";
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;
    // PostOrderByWithRelationInput
    const orderBy = ((): Prisma.GalleryOrderByWithRelationInput => {
      switch (sort) {
        case "oldest":
          return { createdAt: "asc" };
        case "newest":
        default:
          return { createdAt: "desc" };
      }
    })();
    const where: Prisma.GalleryWhereInput = {
      // Search filter
      ...(search && {
        OR: [{ title: { contains: search, mode: "insensitive" } }],
      }),
      published: true,
    };

    const galleries = await prisma.gallery.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy,
      take: limit,
    });

    return NextResponse.json(galleries);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch gallery", error: error.message },
      { status: 500 }
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 401 });
    }

    const { title, description, featuredImage, published } =
      await request.json();

    // Validate required fields
    if (!title || !description || !featuredImage) {
      return NextResponse.json(
        { error: "Title and description featured image are required" },
        { status: 400 }
      );
    }

    // Convert HTML string to JSON object for Prisma
    const slug = title.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
    // Create post data
    const postData: any = {
      title,
      description,
      published: published || true,
      featuredImage,
    };

    const gallery = await prisma.gallery.create({
      data: postData,
    });
    revalidateGalleries();
    return NextResponse.json(gallery);
  } catch (error: any) {
    console.error("Detailed error creating gallery:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    return NextResponse.json(
      { error: "Internal server error creating post" },
      { status: 500 }
    );
  }
}
