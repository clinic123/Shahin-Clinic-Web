import { Prisma } from "@/prisma/generated/prisma/client";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department");
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");
    const filters: any = {};
    const sort = searchParams.get("sort") || "newest";

    const orderBy = ((): Prisma.PostOrderByWithRelationInput => {
      switch (sort) {
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

    if (department) filters.department = department;
    if (status) filters.status = status;

    const doctors = await prisma.doctor.findMany({
      orderBy,
      take: limit ? Number(limit) : undefined,
    });

    return NextResponse.json({ success: true, doctors }, { status: 200 });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const {
      specialization,
      department,
      phone,
      bio,
      experience,
      education,
      consultationFee,
      availableDays,
      status,
    } = body;

    // Validate required fields
    if (
      !specialization ||
      !department ||
      !phone ||
      !experience ||
      !education ||
      !consultationFee ||
      !availableDays
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create doctor profile
    const doctor = await prisma.doctor.create({
      data: {
        name: session.user.name,
        specialization,
        department,
        email: session.user.email,
        phone,
        bio: bio || "",
        experience: parseInt(experience),
        education,
        consultationFee: parseFloat(consultationFee),
        availableDays: availableDays || [],
        status: status || "ACTIVE",
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        doctor,
        message: "Doctor created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating doctor:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
