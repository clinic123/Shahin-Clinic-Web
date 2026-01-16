import { auth } from "@/lib/auth";
import { createTransporter } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

// GET all course orders with filters and pagination (Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Admin access required",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const paymentMethod = searchParams.get("paymentMethod");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const skip = (page - 1) * limit;

    let where: any = {};

    // Status filter
    if (status && status !== "all") {
      where.status = status;
    }

    // Payment method filter
    if (paymentMethod && paymentMethod !== "all") {
      where.paymentMethod = paymentMethod;
    }

    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Search filter
    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { course: { title: { contains: search, mode: "insensitive" } } },
        { paymentTransactionId: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
        { accessCode: { contains: search, mode: "insensitive" } },
      ];
    }

    const [courseOrders, totalCount] = await Promise.all([
      prisma.courseOrder.findMany({
        where,
        include: {
          course: {
            select: {
              id: true,
              title: true,
              description: true,
              image: true,
              price: true,
              videoUrl: true,
              category: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phoneNumber: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.courseOrder.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Get statistics
    const stats = await prisma.courseOrder.groupBy({
      by: ["status"],
      _count: {
        _all: true,
      },
      _sum: {
        totalAmount: true,
      },
    });

    const totalRevenue = await prisma.courseOrder.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        status: {
          in: ["CONFIRMED", "ACCESS_GRANTED", "COMPLETED"],
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: courseOrders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      stats: {
        byStatus: stats,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        totalOrders: totalCount,
      },
      filters: {
        status,
        search,
        paymentMethod,
        startDate,
        endDate,
      },
    });
  } catch (error) {
    console.error("Error fetching course orders:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch course orders",
      },
      { status: 500 }
    );
  }
}

// PATCH bulk update course orders (Admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

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

    const { orderIds, status, sendEmail = true } = body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Order IDs are required",
        },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          error: "Status is required",
        },
        { status: 400 }
      );
    }

    // Update orders
    const updatedOrders = await prisma.courseOrder.updateMany({
      where: {
        id: { in: orderIds },
      },
      data: {
        status,
        ...(status === "ACCESS_GRANTED" && { accessGranted: true }),
      },
    });

    // Send emails if requested
    if (sendEmail && status === "ACCESS_GRANTED") {
      const ordersWithDetails = await prisma.courseOrder.findMany({
        where: {
          id: { in: orderIds },
        },
        include: {
          course: true,
          user: true,
        },
      });

      for (const order of ordersWithDetails) {
        await sendCourseAccessEmail(order, order.course, order.user);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updatedOrders.count} orders`,
      data: updatedOrders,
    });
  } catch (error) {
    console.error("Error updating course orders:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update course orders",
      },
      { status: 500 }
    );
  }
}

// Email function for course access
const sendCourseAccessEmail = async (
  courseOrder: any,
  course: any,
  user: any
) => {
  try {
    const transporter = createTransporter();

    const emailContent = {
      subject: `Course Access Granted - ${course.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Course Access Granted!</h2>
          <p>Dear ${user.name},</p>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">Your Course Access Details:</h3>
            <p><strong>Course:</strong> ${course.title}</p>
            <p><strong>Access Code:</strong> <code style="background: #1e293b; color: white; padding: 8px 12px; border-radius: 4px; font-size: 18px; font-weight: bold; letter-spacing: 2px;">${
              courseOrder.accessCode
            }</code></p>
            ${
              course.videoUrl
                ? `
            <p><strong>Video Link:</strong> <a href="${course.videoUrl}" style="color: #2563eb; text-decoration: underline;">Click here to access your course</a></p>
            `
                : ""
            }
          </div>

          <div style="background: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #d97706; margin-top: 0;">How to Access Your Course:</h4>
            <ol style="color: #64748b; line-height: 1.6;">
              <li>Save your access code: <strong>${
                courseOrder.accessCode
              }</strong></li>
              ${
                course.videoUrl
                  ? `<li>Click on the video link above to start learning</li>`
                  : ""
              }
              <li>Use the access code if prompted when accessing course materials</li>
              <li>If you face any issues, contact our support team with your access code</li>
            </ol>
          </div>

          <p style="color: #64748b;">
            Happy learning! We hope you enjoy the course and gain valuable knowledge.
          </p>
        </div>
      `,
    };

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log("Course access email sent successfully");
  } catch (emailError) {
    console.error("Error sending course access email:", emailError);
  }
};
