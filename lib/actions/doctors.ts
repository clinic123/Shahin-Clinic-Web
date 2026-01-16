"use server";

import { auth } from "@/lib/auth";
import { PrismaClient } from "@/prisma/generated/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { auth as betterAuth } from "@/lib/auth";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

interface CreateDoctorInput {
  name: string;
  email: string;
  password: string;
  specialization: string;
  department: string;
  phone: string;
  bio?: string;
  experience: number;
  education: string;
  consultationFee: number;
  availableDays: string[];
  status?: "ACTIVE" | "INACTIVE";
  profileImage?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
}

interface UpdateDoctorInput {
  name?: string;
  specialization?: string;
  department?: string;
  phone?: string;
  bio?: string;
  experience?: number;
  education?: string;
  consultationFee?: number;
  availableDays?: string[];
  status?: "ACTIVE" | "INACTIVE";
  password?: string;
  profileImage?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
}

export async function createDoctor(input: CreateDoctorInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return {
        success: false,
        error: "Unauthorized - Admin access required",
        status: 401,
      };
    }

    // Validate required fields
    if (
      !input.name ||
      !input.email ||
      !input.password ||
      !input.specialization ||
      !input.department ||
      !input.phone ||
      !input.experience ||
      !input.education ||
      !input.consultationFee ||
      !input.availableDays
    ) {
      return {
        success: false,
        error: "Missing required fields",
        status: 400,
      };
    }

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      return {
        success: false,
        error: "User with this email already exists",
        status: 409,
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(input.password, 10);

    // Create user and doctor in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name: input.name,
          email: input.email,
          role: "doctor",
          emailVerified: false,
        },
      });

      // Create account for authentication
      await tx.account.create({
        data: {
          userId: user.id,
          provider: "credential",
          providerAccountId: user.id,
          password: hashedPassword,
        },
      });

      // Create doctor profile
      const doctor = await tx.doctor.create({
        data: {
          userId: user.id,
          name: input.name,
          email: input.email,
          specialization: input.specialization,
          department: input.department,
          phone: input.phone,
          bio: input.bio || "",
          experience: input.experience,
          education: input.education,
          consultationFee: input.consultationFee,
          availableDays: input.availableDays,
          status: input.status || "ACTIVE",
          profileImage: input.profileImage || null,
          facebookUrl: input.facebookUrl || null,
          twitterUrl: input.twitterUrl || null,
          youtubeUrl: input.youtubeUrl || null,
          linkedinUrl: input.linkedinUrl || null,
          instagramUrl: input.instagramUrl || null,
        },
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
      });

      return doctor;
    });

    // Revalidate
    revalidateTag("doctors");
    revalidateTag(`doctor-${result.id}`);
    revalidatePath("/doctors");
    revalidatePath("/teams");
    revalidatePath("/"); // Homepage where TeamSection is displayed
    revalidatePath("/admin/doctors");
    revalidatePath(`/doctors/${result.id}`);
    revalidatePath("/doctor/profile");

    return {
      success: true,
      data: result,
      message: "Doctor created successfully",
    };
  } catch (error) {
    console.error("Error creating doctor:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create doctor",
      status: 500,
    };
  }
}

export async function updateDoctor(doctorId: string, input: UpdateDoctorInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "Unauthorized",
        status: 401,
      };
    }

    // Check if doctor exists
    const existingDoctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        user: {
          include: {
            accounts: true,
          },
        },
      },
    });

    if (!existingDoctor) {
      return {
        success: false,
        error: "Doctor not found",
        status: 404,
      };
    }

    // Check permissions: admin can update any doctor, doctor can only update themselves
    if (
      session.user.role !== "admin" &&
      existingDoctor.userId !== session.user.id
    ) {
      return {
        success: false,
        error: "Forbidden - You can only update your own profile",
        status: 403,
      };
    }

    // Prepare update data
    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.specialization !== undefined)
      updateData.specialization = input.specialization;
    if (input.department !== undefined) updateData.department = input.department;
    if (input.phone !== undefined) updateData.phone = input.phone;
    if (input.bio !== undefined) updateData.bio = input.bio;
    if (input.experience !== undefined)
      updateData.experience = parseInt(String(input.experience));
    if (input.education !== undefined) updateData.education = input.education;
    if (input.consultationFee !== undefined)
      updateData.consultationFee = parseFloat(String(input.consultationFee));
    if (input.availableDays !== undefined)
      updateData.availableDays = input.availableDays;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.profileImage !== undefined)
      updateData.profileImage = input.profileImage;
    if (input.facebookUrl !== undefined)
      updateData.facebookUrl = input.facebookUrl;
    if (input.twitterUrl !== undefined) updateData.twitterUrl = input.twitterUrl;
    if (input.youtubeUrl !== undefined) updateData.youtubeUrl = input.youtubeUrl;
    if (input.linkedinUrl !== undefined)
      updateData.linkedinUrl = input.linkedinUrl;
    if (input.instagramUrl !== undefined)
      updateData.instagramUrl = input.instagramUrl;

    // Update password if provided
    if (input.password) {
      const hashedPassword = await bcrypt.hash(input.password, 10);
      const account = existingDoctor.user.accounts.find(
        (acc) => acc.provider === "credential"
      );
      if (account) {
        await prisma.account.update({
          where: { id: account.id },
          data: { password: hashedPassword },
        });
      }
    }

    // Update doctor
    const doctor = await prisma.doctor.update({
      where: { id: doctorId },
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
    });

    // Revalidate
    revalidateTag("doctors");
    revalidateTag(`doctor-${doctorId}`);
    revalidatePath("/doctors");
    revalidatePath("/teams");
    revalidatePath("/"); // Homepage where TeamSection is displayed
    revalidatePath("/admin/doctors");
    revalidatePath(`/doctors/${doctorId}`);
    revalidatePath("/doctor/profile");

    return {
      success: true,
      data: doctor,
      message: "Doctor updated successfully",
    };
  } catch (error) {
    console.error("Error updating doctor:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update doctor",
      status: 500,
    };
  }
}

export async function updateDoctorStatus(
  doctorId: string,
  status: "ACTIVE" | "INACTIVE"
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return {
        success: false,
        error: "Unauthorized - Admin access required",
        status: 401,
      };
    }

    const doctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: { status },
    });

    // Revalidate
    revalidateTag("doctors");
    revalidateTag(`doctor-${doctorId}`);
    revalidatePath("/doctors");
    revalidatePath("/admin/doctors");
    revalidatePath(`/doctors/${doctorId}`);

    return {
      success: true,
      data: doctor,
      message: "Doctor status updated successfully",
    };
  } catch (error) {
    console.error("Error updating doctor status:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update doctor status",
      status: 500,
    };
  }
}

export async function deleteDoctor(doctorId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return {
        success: false,
        error: "Unauthorized - Admin access required",
        status: 401,
      };
    }

    // Check if doctor exists
    const existingDoctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
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
      return {
        success: false,
        error: "Doctor not found",
        status: 404,
      };
    }

    // Check if doctor has active appointments
    const activeAppointments = existingDoctor.appointments.length;
    if (activeAppointments > 0) {
      return {
        success: false,
        error: `Cannot delete doctor with ${activeAppointments} active appointment(s). Please reassign or cancel the appointments first.`,
        status: 400,
      };
    }

    // Soft delete by setting status to INACTIVE
    await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        status: "INACTIVE",
      },
    });

    // Change user role from 'doctor' to 'user' if needed
    if (
      existingDoctor.userId &&
      existingDoctor.user?.role === "doctor"
    ) {
      await prisma.user.update({
        where: { id: existingDoctor.userId },
        data: {
          role: "user",
        },
      });
    }

    // Revalidate
    revalidateTag("doctors");
    revalidateTag(`doctor-${doctorId}`);
    revalidatePath("/doctors");
    revalidatePath("/admin/doctors");
    revalidatePath(`/doctors/${doctorId}`);

    return {
      success: true,
      message: "Doctor has been deactivated successfully",
    };
  } catch (error) {
    console.error("Error deleting doctor:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete doctor",
      status: 500,
    };
  }
}

