import { getServerSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

// GET all books with filtering, search, and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const author = searchParams.get("author");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStock = searchParams.get("inStock");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build where condition
    const where: any = {
      isActive: true,
    };

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
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch books",
      },
      { status: 500 }
    );
  }
}

// POST create new book (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    // Check if user is admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Admin access required",
        },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON body",
        },
        { status: 400 }
      );
    }

    const {
      title,
      author,
      description,
      image,
      price,
      stock = 0,
      rokomariLinkForDirectBuy,
      amazonLink,
    } = body;

    // Validate required fields
    if (!title || !author || !description || !image || !price) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: title, author, description, image, price",
        },
        { status: 400 }
      );
    }

    // Validate price and stock
    if (price < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Price cannot be negative",
        },
        { status: 400 }
      );
    }

    if (stock < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Stock cannot be negative",
        },
        { status: 400 }
      );
    }

    // Check if book with same title and author already exists
    const existingBook = await prisma.book.findFirst({
      where: {
        title,
        author,
        isActive: true,
      },
    });

    if (existingBook) {
      return NextResponse.json(
        {
          success: false,
          error: "A book with this title and author already exists",
        },
        { status: 409 }
      );
    }

    // Create book
    const book = await prisma.book.create({
      data: {
        title,
        author,
        description,
        image,
        price: parseFloat(price),
        stock: parseInt(stock),
        rokomariLinkForDirectBuy: rokomariLinkForDirectBuy || null,
        amazonLink: amazonLink || null,
      },
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
    });

    return NextResponse.json(
      {
        success: true,
        message: "Book created successfully",
        data: book,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating book:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
