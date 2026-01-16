import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

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
    const period = searchParams.get("period") || "all"; // all, today, week, month, year

    let dateFilter: any = {};

    if (period !== "all") {
      const now = new Date();
      const startDate = new Date();

      switch (period) {
        case "today":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "year":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      dateFilter = {
        createdAt: {
          gte: startDate,
        },
      };
    }

    // Get overall statistics
    const [
      totalStats,
      statusStats,
      paymentStats,
      recentOrders,
      revenueByMonth,
    ] = await Promise.all([
      // Total statistics
      prisma.courseOrder.aggregate({
        _count: { _all: true },
        _sum: { totalAmount: true },
        where: dateFilter,
      }),

      // Statistics by status
      prisma.courseOrder.groupBy({
        by: ["status"],
        _count: { _all: true },
        _sum: { totalAmount: true },
        where: dateFilter,
      }),

      // Statistics by payment method
      prisma.courseOrder.groupBy({
        by: ["paymentMethod"],
        _count: { _all: true },
        _sum: { totalAmount: true },
        where: dateFilter,
      }),

      // Recent orders
      prisma.courseOrder.findMany({
        where: dateFilter,
        include: {
          course: {
            select: {
              title: true,
              category: true,
            },
          },
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),

      // Revenue by month (last 6 months)
      prisma.courseOrder.groupBy({
        by: ["createdAt"],
        _sum: {
          totalAmount: true,
        },
        where: {
          ...dateFilter,
          status: {
            in: ["CONFIRMED", "ACCESS_GRANTED", "COMPLETED"],
          },
          createdAt: {
            gte: new Date(
              new Date().getFullYear(),
              new Date().getMonth() - 5,
              1
            ),
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      }),
    ]);

    // Process monthly revenue data
    const monthlyRevenue = revenueByMonth.reduce((acc: any, item) => {
      const month = item.createdAt.toISOString().substring(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += item._sum.totalAmount || 0;
      return acc;
    }, {});

    const monthlyRevenueArray = Object.entries(monthlyRevenue).map(
      ([month, revenue]) => ({
        month,
        revenue,
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        total: {
          orders: totalStats._count._all,
          revenue: totalStats._sum.totalAmount || 0,
        },
        byStatus: statusStats.reduce((acc: any, stat) => {
          acc[stat.status] = {
            count: stat._count._all,
            revenue: stat._sum.totalAmount || 0,
          };
          return acc;
        }, {}),
        byPaymentMethod: paymentStats.reduce((acc: any, stat) => {
          acc[stat.paymentMethod] = {
            count: stat._count._all,
            revenue: stat._sum.totalAmount || 0,
          };
          return acc;
        }, {}),
        recentOrders,
        monthlyRevenue: monthlyRevenueArray,
        period,
      },
    });
  } catch (error) {
    console.error("Error fetching course order stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch statistics",
      },
      { status: 500 }
    );
  }
}
