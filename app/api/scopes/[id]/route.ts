//scope/[id]route.ts

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

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

    // Debug logging
    console.log("Scope update request:", {
      id,
      bodyKeys: Object.keys(body),
      body,
    });

    // Check if scope exists
    const existingScope = await prisma.scope.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            accounts: true,
          },
        },
      },
    });

    if (!existingScope) {
      return NextResponse.json({ error: "Scope not found" }, { status: 404 });
    }

    // Check permissions: admin can update any scope, scope can only update themselves
    if (
      session.user.role !== "admin" &&
      existingScope.userId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "Forbidden - You can only update your own profile" },
        { status: 403 }
      );
    }

    // Handle password update separately if provided
    if (body.password && existingScope.user) {
      const bcrypt = (await import("bcryptjs")).default;
      const hashedPassword = await bcrypt.hash(body.password, 10);
      const account = existingScope.user.accounts.find(
        (acc) => acc.providerId === "credential"
      );
      if (account) {
        await prisma.account.update({
          where: { id: account.id },
          data: { password: hashedPassword },
        });
      }
    }

    // Prepare update data (excluding password as it's handled separately)
    const updateData: any = {};
    if (body.name !== undefined && body.name !== null && body.name !== "")
      updateData.name = body.name;
    if (
      body.specialization !== undefined &&
      body.specialization !== null &&
      body.specialization !== ""
    )
      updateData.specialization = body.specialization;
    if (
      body.department !== undefined &&
      body.department !== null &&
      body.department !== ""
    )
      updateData.department = body.department;
    if (body.phone !== undefined && body.phone !== null && body.phone !== "")
      updateData.phone = body.phone;
    if (body.bio !== undefined && body.bio !== null)
      updateData.bio = body.bio || null;
    if (body.experience !== undefined && body.experience !== null)
      updateData.experience = parseInt(String(body.experience));
    if (body.education !== undefined && body.education !== null)
      updateData.education = body.education;
    if (body.consultationFee !== undefined && body.consultationFee !== null)
      updateData.consultationFee = parseFloat(String(body.consultationFee));
    if (body.availableDays !== undefined && body.availableDays !== null)
      updateData.availableDays = body.availableDays;
    if (body.status !== undefined && body.status !== null)
      updateData.status = body.status;
    if (body.profileImage !== undefined && body.profileImage !== null)
      updateData.profileImage = body.profileImage || null;
    if (body.facebookUrl !== undefined && body.facebookUrl !== null)
      updateData.facebookUrl = body.facebookUrl || null;
    if (body.twitterUrl !== undefined && body.twitterUrl !== null)
      updateData.twitterUrl = body.twitterUrl || null;
    if (body.youtubeUrl !== undefined && body.youtubeUrl !== null)
      updateData.youtubeUrl = body.youtubeUrl || null;
    if (body.linkedinUrl !== undefined && body.linkedinUrl !== null)
      updateData.linkedinUrl = body.linkedinUrl || null;
    if (body.instagramUrl !== undefined && body.instagramUrl !== null)
      updateData.instagramUrl = body.instagramUrl || null;

    // Check if there's anything to update (excluding password which is handled separately)
    if (Object.keys(updateData).length === 0 && !body.password) {
      return NextResponse.json(
        {
          success: false,
          error: "No fields to update",
          message: "Please provide at least one field to update",
        },
        { status: 400 }
      );
    }

    // Update the scope record only if there's data to update
    const scope =
      Object.keys(updateData).length > 0
        ? await prisma.scope.update({
            where: { id },
            data: updateData,
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                  image: true,
                },
              },
            },
          })
        : {
            ...existingScope,
            user: existingScope.user
              ? {
                  id: existingScope.user.id,
                  name: existingScope.user.name,
                  email: existingScope.user.email,
                  role: existingScope.user.role,
                  image: existingScope.user.image,
                }
              : null,
          };

    // Revalidate cache
    revalidateTag("scopes");
    revalidateTag(`scope-${id}`);
    revalidatePath("/scopes");
    revalidatePath("/admin/scopes");
    revalidatePath(`/scopes/${id}`);
    revalidatePath("/scope/profile");

    return NextResponse.json(
      {
        success: true,
        scope,
        message: "Scope updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating scope:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
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

    // Check if scope exists
    const existingScope = await prisma.scope.findUnique({
      where: { id },
      include: {
        user: true,
        appointments: {
          where: {
            status: {
              in: ["PENDING", "CONFIRMED"],
            },
          },
        },
      },
    });

    if (!existingScope) {
      return NextResponse.json({ error: "Scope not found" }, { status: 404 });
    }

    // Check if scope has active appointments
    const activeAppointments = existingScope.appointments.length;
    if (activeAppointments > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete scope with ${activeAppointments} active appointment(s). Please reassign or cancel the appointments first.`,
        },
        { status: 400 }
      );
    }

    // Soft delete by setting status to INACTIVE
    await prisma.scope.update({
      where: { id },
      data: {
        status: "INACTIVE",
      },
    });

    // Change user role from 'scope' to 'user' if needed
    if (existingScope.userId && existingScope.user?.role === "scope") {
      await prisma.user.update({
        where: { id: existingScope.userId },
        data: {
          role: "user",
          updatedAt: new Date(),
        },
      });
    }

    // Revalidate cache
    revalidateTag("scopes");
    revalidateTag(`scope-${id}`);
    revalidatePath("/scopes");
    revalidatePath("/admin/scopes");
    revalidatePath(`/scopes/${id}`);

    return NextResponse.json(
      {
        success: true,
        message: "Scope has been deactivated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting scope:", error);
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

    // Find scope by user ID using findFirst
    const scope = await prisma.scope.findFirst({
      where: {
        userId: id,
      },
      select: {
        id: true,
        name: true,
        specialization: true,
        department: true,
        email: true,
        phone: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        education: true,
        availableDays: true,
        bio: true,
        experience: true,
        consultationFee: true,
        appointments: {
          orderBy: {
            appointmentDate: "desc",
          },
          select: {
            scope: {
              select: {
                name: true,
                specialization: true,
                status: true,
              },
            },
            status: true,
            appointmentDate: true,
            patientName: true,
          },
        },
      },
    });

    if (!scope) {
      return NextResponse.json(
        { error: "Scope profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      scope,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching scope profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
