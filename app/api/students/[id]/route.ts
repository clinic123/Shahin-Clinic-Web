import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

function removeUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  ) as Partial<T>;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id } = await params;

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const data = removeUndefined({
      name: body.name,
      description: body.description,
      image: body.image,
      facebookUrl: body.facebookUrl,
      twitterUrl: body.twitterUrl,
      youtubeUrl: body.youtubeUrl,
      linkedinUrl: body.linkedinUrl,
      instagramUrl: body.instagramUrl,
    });

    // Update the student record
    const student = await prisma.student.update({
      where: { id },
      data: data,
    });

    return NextResponse.json(
      {
        success: true,
        student,
        message: "Student updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const { id } = await context.params;

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Delete the student
    await prisma.student.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Student deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const student = await prisma.student.findUnique({
      where: { id },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      student,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


