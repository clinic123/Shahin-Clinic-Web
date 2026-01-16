"use server";

import { auth } from "@/lib/auth";
import { PrismaClient } from "@/prisma/generated/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";

const prisma = new PrismaClient();

interface CreateScopeInput {
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

interface UpdateScopeInput {
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

export async function createScope(input: CreateScopeInput) {
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

    // Create user and scope in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name: input.name,
          email: input.email,
          role: "scope",
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Create account for authentication
      await tx.account.create({
        data: {
          userId: user.id,
          accountId: user.id,
          providerId: "credential",
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Create scope profile
      const scope = await tx.scope.create({
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

      return scope;
    });

    // Revalidate
    revalidateTag("scopes");
    revalidateTag(`scope-${result.id}`);
    revalidatePath("/scopes");
    revalidatePath(`/scope/${result.id}`); // Scope detail page
    revalidatePath("/admin/scopes");
    revalidatePath(`/scopes/${result.id}`);
    revalidatePath("/scope/profile");

    return {
      success: true,
      data: result,
      message: "Scope created successfully",
    };
  } catch (error) {
    console.error("Error creating scope:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create scope",
      status: 500,
    };
  }
}

export async function updateScope(scopeId: string, input: UpdateScopeInput) {
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

    // Check if scope exists
    const existingScope = await prisma.scope.findUnique({
      where: { id: scopeId },
      include: {
        user: {
          include: {
            accounts: true,
          },
        },
      },
    });

    if (!existingScope) {
      return {
        success: false,
        error: "Scope not found",
        status: 404,
      };
    }

    // Check permissions: admin can update any scope, scope can only update themselves
    if (
      session.user.role !== "admin" &&
      existingScope.userId !== session.user.id
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
    if (input.department !== undefined)
      updateData.department = input.department;
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
    if (input.twitterUrl !== undefined)
      updateData.twitterUrl = input.twitterUrl;
    if (input.youtubeUrl !== undefined)
      updateData.youtubeUrl = input.youtubeUrl;
    if (input.linkedinUrl !== undefined)
      updateData.linkedinUrl = input.linkedinUrl;
    if (input.instagramUrl !== undefined)
      updateData.instagramUrl = input.instagramUrl;

    // Update password if provided
    if (input.password) {
      const hashedPassword = await bcrypt.hash(input.password, 10);
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

    // Update scope
    const scope = await prisma.scope.update({
      where: { id: scopeId },
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
    revalidateTag("scopes");
    revalidateTag(`scope-${scopeId}`);
    revalidatePath("/scopes");
    revalidatePath(`/scope/${scopeId}`); // Scope detail page
    revalidatePath("/admin/scopes");
    revalidatePath(`/scopes/${scopeId}`);
    revalidatePath("/scope/profile");

    return {
      success: true,
      data: scope,
      message: "Scope updated successfully",
    };
  } catch (error) {
    console.error("Error updating scope:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update scope",
      status: 500,
    };
  }
}

export async function updateScopeStatus(
  scopeId: string,
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

    const scope = await prisma.scope.update({
      where: { id: scopeId },
      data: { status },
    });

    // Revalidate
    revalidateTag("scopes");
    revalidateTag(`scope-${scopeId}`);
    revalidatePath("/scopes");
    revalidatePath("/admin/scopes");
    revalidatePath(`/scopes/${scopeId}`);

    return {
      success: true,
      data: scope,
      message: "Scope status updated successfully",
    };
  } catch (error) {
    console.error("Error updating scope status:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update scope status",
      status: 500,
    };
  }
}

export async function deleteScope(scopeId: string) {
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

    // Check if scope exists
    const existingScope = await prisma.scope.findUnique({
      where: { id: scopeId },
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
      return {
        success: false,
        error: "Scope not found",
        status: 404,
      };
    }

    // Check if scope has active appointments
    const activeAppointments = existingScope.appointments.length;
    if (activeAppointments > 0) {
      return {
        success: false,
        error: `Cannot delete scope with ${activeAppointments} active appointment(s). Please reassign or cancel the appointments first.`,
        status: 400,
      };
    }

    // Soft delete by setting status to INACTIVE
    await prisma.scope.update({
      where: { id: scopeId },
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
        },
      });
    }

    // Revalidate
    revalidateTag("scopes");
    revalidateTag(`scope-${scopeId}`);
    revalidatePath("/scopes");
    revalidatePath("/admin/scopes");
    revalidatePath(`/scopes/${scopeId}`);

    return {
      success: true,
      message: "Scope has been deactivated successfully",
    };
  } catch (error) {
    console.error("Error deleting scope:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete scope",
      status: 500,
    };
  }
}
