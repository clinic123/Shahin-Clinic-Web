import { Prisma } from "@/prisma/generated/prisma/client";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit");
    const sort = searchParams.get("sort") || "newest";

    const orderBy = ((): Prisma.StudentOrderByWithRelationInput => {
      switch (sort) {
        case "oldest":
          return { createdAt: "asc" };
        case "newest":
        default:
          return { createdAt: "desc" };
      }
    })();

    const students = await prisma.student.findMany({
      orderBy,
      take: limit ? Number(limit) : undefined,
    });

    return NextResponse.json({ success: true, students }, { status: 200 });
  } catch (error) {
    console.error("Error fetching students:", error);
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

    // Check if user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const {
      name,
      description,
      image,
      facebookUrl,
      twitterUrl,
      youtubeUrl,
      linkedinUrl,
      instagramUrl,
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Create student
    const student = await prisma.student.create({
      data: {
        name,
        description: description || "",
        image: image || null,
        facebookUrl: facebookUrl || null,
        twitterUrl: twitterUrl || null,
        youtubeUrl: youtubeUrl || null,
        linkedinUrl: linkedinUrl || null,
        instagramUrl: instagramUrl || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        student,
        message: "Student created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

