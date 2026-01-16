import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET all books with admin filters (including inactive)
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Admin access required",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const author = searchParams.get("author");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStock = searchParams.get("inStock");
    const isActive = searchParams.get("isActive");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build where condition for admin
    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { author: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Author filter
    if (author) {
      where.author = { contains: author, mode: "insensitive" };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Stock filter
    if (inStock === "true") {
      where.stock = { gt: 0 };
    } else if (inStock === "false") {
      where.stock = 0;
    }

    // Active status filter
    if (isActive === "true") {
      where.isActive = true;
    } else if (isActive === "false") {
      where.isActive = false;
    }

    // Build orderBy
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [books, totalCount] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          title: true,
          author: true,
          description: true,
          image: true,
          price: true,
          stock: true,
          rokomariLinkForDirectBuy: true,
          amazonLink: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.book.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: books,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      filters: {
        search,
        author,
        minPrice,
        maxPrice,
        inStock,
        isActive,
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    console.error("Error fetching admin books:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch books",
      },
      { status: 500 }
    );
  }
}
