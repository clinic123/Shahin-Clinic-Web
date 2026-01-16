//doctor/[id]route.ts

import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";
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

    // Check if doctor exists
    const existingDoctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            accounts: true,
          },
        },
      },
    });

    if (!existingDoctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Check permissions: admin can update any doctor, doctor can only update themselves
    if (
      session.user.role !== "admin" &&
      existingDoctor.userId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "Forbidden - You can only update your own profile" },
        { status: 403 }
      );
    }

    // Handle password update separately if provided
    if (body.password && existingDoctor.user) {
      const bcrypt = (await import("bcryptjs")).default;
      const hashedPassword = await bcrypt.hash(body.password, 10);
      const account = existingDoctor.user.accounts.find(
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
    if (body.name !== undefined && body.name !== null)
      updateData.name = body.name;
    if (body.specialization !== undefined && body.specialization !== null)
      updateData.specialization = body.specialization;
    if (body.department !== undefined && body.department !== null)
      updateData.department = body.department;
    if (body.phone !== undefined && body.phone !== null)
      updateData.phone = body.phone;
    if (body.bio !== undefined && body.bio !== null) updateData.bio = body.bio;
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
      updateData.profileImage = body.profileImage;
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

    // Update the doctor record only if there's data to update
    const doctor =
      Object.keys(updateData).length > 0
        ? await prisma.doctor.update({
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
            ...existingDoctor,
            user: existingDoctor.user
              ? {
                  id: existingDoctor.user.id,
                  name: existingDoctor.user.name,
                  email: existingDoctor.user.email,
                  role: existingDoctor.user.role,
                  image: existingDoctor.user.image,
                }
              : null,
          };

    // Revalidate cache
    revalidateTag("doctors");
    revalidateTag(`doctor-${id}`);
    revalidatePath("/doctors");
    revalidatePath("/teams");
    revalidatePath("/"); // Homepage where TeamSection is displayed
    revalidatePath("/admin/doctors");
    revalidatePath(`/doctors/${id}`);
    revalidatePath("/doctor/profile");

    return NextResponse.json(
      {
        success: true,
        doctor,
        message: "Doctor updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating doctor:", error);
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
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;

    // Check if doctor exists
    const existingDoctor = await prisma.doctor.findUnique({
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

    if (!existingDoctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Check if doctor has active appointments
    const activeAppointments = existingDoctor.appointments.length;
    if (activeAppointments > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete doctor with ${activeAppointments} active appointment(s). Please reassign or cancel the appointments first.`,
        },
        { status: 400 }
      );
    }

    // Soft delete by setting status to INACTIVE
    await prisma.doctor.update({
      where: { id },
      data: {
        status: "INACTIVE",
      },
    });

    // Change user role from 'doctor' to 'user' if needed
    if (existingDoctor.userId && existingDoctor.user?.role === "doctor") {
      await prisma.user.update({
        where: { id: existingDoctor.userId },
        data: {
          role: "user",
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Doctor has been deactivated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting doctor:", error);
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

    // Find doctor by user ID using findFirst
    const doctor = await prisma.doctor.findFirst({
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
            doctor: {
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

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      doctor,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
