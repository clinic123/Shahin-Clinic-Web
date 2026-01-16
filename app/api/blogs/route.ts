import { Prisma } from "@/prisma/generated/prisma/client";
import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") || "newest";
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const limit = searchParams.get("limit");
    const published = searchParams.get("published");

    const orderBy = ((): Prisma.PostOrderByWithRelationInput => {
      switch (sort) {
        case "title_asc":
          return { title: "asc" };
        case "title_desc":
          return { title: "desc" };
        case "published_at_asc":
          return { publishedAt: "asc" };
        case "published_at_desc":
          return { publishedAt: "desc" };
        case "oldest":
          return { createdAt: "asc" };
        case "newest":
        default:
          return { createdAt: "desc" };
      }
    })();
    const where: Prisma.PostWhereInput = {
      // Category filter
      ...(category && {
        category: {
          slug: category,
        },
      }),
      // Search filter
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
          { shortDescription: { contains: search, mode: "insensitive" } },
          { excerpt: { contains: search, mode: "insensitive" } },
        ],
      }),
      // Published filter (if provided)
      published: true,
    };

    const posts = await prisma.post.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,

      include: {
        author: true,
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy,
      take: limit ? Number(limit) : undefined,
    });

    return NextResponse.json(posts);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch posts", error: error.message },
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

    const {
      title,
      content,
      excerpt,
      published,
      categorySlug,
      tagNames,
      shortDescription,
      featuredImage,
    } = await request.json();

    // Validate required fields
    if (!title || !content || !featuredImage) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Convert HTML string to JSON object for Prisma
    const slug = title.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
    // Create post data
    const postData: any = {
      title,
      content,
      slug,
      excerpt: excerpt || `Excerpt for ${title}`,
      published: published || false,
      publishedAt: published ? new Date() : null,
      authorId: session.user.id,
      shortDescription,
      categorySlug,
      featuredImage,
    };

    if (tagNames && tagNames.length > 0) {
      postData.tags = {
        create: tagNames.map((tagName: string) => ({
          tag: {
            connectOrCreate: {
              where: { name: tagName },
              create: {
                name: tagName,
                slug: tagName.toLowerCase().replace(/\s+/g, "-"),
              },
            },
          },
        })),
      };
    }

    const post = await prisma.post.create({
      data: postData,
      include: {
        author: { select: { name: true } },
        category: {
          include: {},
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    revalidateTag("blogs");
    revalidatePath("/blogs");
    revalidatePath("/admin/blogs");
    revalidatePath("/");
    return NextResponse.json(post);
  } catch (error: any) {
    console.error("Detailed error creating post:", {
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
