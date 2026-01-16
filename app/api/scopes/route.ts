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

    const orderBy: any = (() => {
      switch (sort) {
        case "oldest":
          return { createdAt: "asc" };
        case "newest":
        default:
          return { createdAt: "desc" };
      }
    })();

    if (department) filters.department = department;
    if (status) filters.status = status;

    const scopes = await prisma.scope.findMany({
      orderBy,
      take: limit ? Number(limit) : undefined,
    });

    return NextResponse.json({ success: true, scopes }, { status: 200 });
  } catch (error) {
    console.error("Error fetching scopes:", error);
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

    // Create scope profile
    const scope = await prisma.scope.create({
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
        scope,
        message: "Scope created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating scope:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
