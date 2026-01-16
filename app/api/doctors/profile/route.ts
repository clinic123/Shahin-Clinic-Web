import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has doctor role
    if (session.user.role !== "doctor") {
      return NextResponse.json(
        { error: "Access denied. Doctor role required." },
        { status: 403 }
      );
    }

    // Find doctor by user ID
    const doctor = await prisma.doctor.findFirst({
      where: {
        userId: session.user.id,
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
          },
        },
        profileImage: true,
        facebookUrl: true,
        twitterUrl: true,
        youtubeUrl: true,
        linkedinUrl: true,
        instagramUrl: true,
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

export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has doctor role
    if (session.user.role !== "doctor") {
      return NextResponse.json(
        { error: "Access denied. Doctor role required." },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Find the doctor with accounts for password update
    const existingDoctor = await prisma.doctor.findFirst({
      where: {
        userId: session.user.id,
      },
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
    if (body.name !== undefined && body.name !== null) updateData.name = body.name;
    if (body.specialization !== undefined && body.specialization !== null)
      updateData.specialization = body.specialization;
    if (body.department !== undefined && body.department !== null)
      updateData.department = body.department;
    if (body.phone !== undefined && body.phone !== null) updateData.phone = body.phone;
    if (body.bio !== undefined && body.bio !== null) updateData.bio = body.bio;
    if (body.experience !== undefined && body.experience !== null)
      updateData.experience = parseInt(String(body.experience));
    if (body.education !== undefined && body.education !== null)
      updateData.education = body.education;
    if (body.consultationFee !== undefined && body.consultationFee !== null)
      updateData.consultationFee = parseFloat(String(body.consultationFee));
    if (body.availableDays !== undefined && body.availableDays !== null)
      updateData.availableDays = body.availableDays;
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

    // Update doctor profile only if there's data to update
    const doctor = Object.keys(updateData).length > 0
      ? await prisma.doctor.update({
      where: { id: existingDoctor.id },
          data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
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
                image: existingDoctor.user.image,
                role: existingDoctor.user.role,
              }
            : null,
        };

    // Revalidate cache
    revalidateTag("doctors");
    revalidateTag(`doctor-${doctor.id}`);
    revalidatePath("/doctors");
    revalidatePath("/teams");
    revalidatePath("/"); // Homepage where TeamSection is displayed
    revalidatePath("/admin/doctors");
    revalidatePath(`/doctors/${doctor.id}`);
    revalidatePath("/doctor/profile");

    return NextResponse.json({
      success: true,
      doctor,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating doctor profile:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
