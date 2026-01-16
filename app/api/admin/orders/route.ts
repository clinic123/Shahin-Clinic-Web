// app/api/admin/orders/route.ts
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

// GET all orders with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    const where: any = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search, mode: "insensitive" } },
        { paymentTransactionId: { contains: search, mode: "insensitive" } },
        { id: { contains: search, mode: "insensitive" } },
      ];
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              book: {
                select: {
                  id: true,
                  title: true,
                  author: true,
                  image: true,
                  price: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST create new order (admin)
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      userId,
      items,
      totalAmount,
      paymentMethod,
      paymentTransactionId,
      paymentMobile,
      shippingAddress,
      customerPhone,
      customerName,
      customerEmail,
      status = "pending",
    } = body;

    // Validate required fields
    if (
      !items ||
      !items.length ||
      !totalAmount ||
      !shippingAddress ||
      !customerName ||
      !customerEmail
    ) {
      return NextResponse.json(
        { success: false, error: "Required fields are missing" },
        { status: 400 }
      );
    }

    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount,
        paymentMethod: paymentMethod || "manual",
        paymentTransactionId: paymentTransactionId || `MANUAL_${Date.now()}`,
        paymentMobile: paymentMobile || "N/A",
        shippingAddress,
        customerEmail,
        customerPhone,
        customerName,
        status,
        items: {
          create: items.map((item: any) => ({
            bookId: item.bookId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            book: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        data: order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}
