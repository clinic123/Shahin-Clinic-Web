import { Prisma } from "@/prisma/generated/prisma/client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = cookies().toString();
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role === "user") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") || "newest";
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const doctorName = searchParams.get("doctorName");
    const department = searchParams.get("department");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const limit = searchParams.get("limit");
    const page = searchParams.get("page") || "1";

    // Build orderBy - exactly like blog API
    const orderBy = ((): Prisma.AppointmentOrderByWithRelationInput => {
      switch (sort) {
        case "patient_asc":
          return { patientName: "asc" };
        case "patient_desc":
          return { patientName: "desc" };
        case "doctor_asc":
          return { doctorName: "asc" };
        case "doctor_desc":
          return { doctorName: "desc" };
        case "date_asc":
          return { appointmentDate: "asc" };
        case "date_desc":
          return { appointmentDate: "desc" };
        case "oldest":
          return { createdAt: "asc" };
        case "newest":
        default:
          return { createdAt: "desc" };
      }
    })();

    // Build where conditions - exactly like blog API pattern
    const where: Prisma.AppointmentWhereInput = {
      // Status filter (like blog's category filter)
      ...(status &&
        status !== "all" && {
          status: status as any,
        }),
      // Doctor name filter
      ...(doctorName && {
        doctorName: { contains: doctorName, mode: "insensitive" },
      }),
      // Department filter
      ...(department && {
        department: { contains: department, mode: "insensitive" },
      }),
      // Date range filter (like blog's date filters)
      ...((dateFrom || dateTo) && {
        appointmentDate: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo && {
            lte: new Date(new Date(dateTo).setHours(23, 59, 59, 999)),
          }),
        },
      }),
      // Search filter - exactly like blog's search
      ...(search && {
        OR: [
          { patientName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { mobile: { contains: search, mode: "insensitive" } },
          { symptoms: { contains: search, mode: "insensitive" } },
          { paymentTransactionId: { contains: search, mode: "insensitive" } },
          { doctorName: { contains: search, mode: "insensitive" } },
          { department: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    // Calculate pagination
    const take = limit ? Number(limit) : undefined;
    const skip = take ? (Number(page) - 1) * take : undefined;

    // Fetch data - exactly like blog API pattern
    const appointments = await prisma.appointment.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy,
      skip,
      take,
    });

    // Get total count for pagination
    const totalCount = await prisma.appointment.count({
      where: Object.keys(where).length > 0 ? where : undefined,
    });

    // Return response in same format as blog API
    return NextResponse.json(appointments, {
      headers: {
        "X-Total-Count": totalCount.toString(),
        "X-Current-Page": page,
        "X-Per-Page": take?.toString() || "10",
      },
    });
  } catch (error: any) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { message: "Failed to fetch appointments", error: error.message },
      { status: 500 }
    );
  }
}
