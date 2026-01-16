import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { role } = body;

    if (!role || !["admin", "user", "doctor"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'admin', 'user', or 'doctor'" },
        { status: 400 }
      );
    }

    // Update user role directly in database
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: role as "admin" | "user" | "doctor" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        banned: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "User role updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to update user role",
      },
      { status: 500 }
    );
  }
}

