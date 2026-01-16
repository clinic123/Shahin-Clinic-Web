import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const caseStudy = await prisma.caseStudy.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!caseStudy) {
      return NextResponse.json(
        { error: "Case study not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ caseStudy });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch case study", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();

    const {
      title,
      content,
      excerpt,
      published,
      shortDescription,
      featuredImage,
      featuredImageAlt,
      patientName,
      patientAge,
      condition,
      treatmentDuration,
      outcome,
    } = body;

    // Check if case study exists
    const existingCaseStudy = await prisma.caseStudy.findUnique({
      where: { slug },
    });

    if (!existingCaseStudy) {
      return NextResponse.json(
        { error: "Case study not found" },
        { status: 404 }
      );
    }

    // Update case study
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (published !== undefined) {
      updateData.published = published;
      updateData.publishedAt = published ? new Date() : null;
    }
    if (shortDescription !== undefined)
      updateData.shortDescription = shortDescription;
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage;
    if (featuredImageAlt !== undefined)
      updateData.featuredImageAlt = featuredImageAlt;
    if (patientName !== undefined) updateData.patientName = patientName;
    if (patientAge !== undefined) updateData.patientAge = patientAge;
    if (condition !== undefined) updateData.condition = condition;
    if (treatmentDuration !== undefined)
      updateData.treatmentDuration = treatmentDuration;
    if (outcome !== undefined) updateData.outcome = outcome;

    const caseStudy = await prisma.caseStudy.update({
      where: { slug },
      data: updateData,
      include: {
        author: { select: { name: true } },
      },
    });

    revalidateTag("case-studies");
    revalidateTag(`case-study-${slug}`);
    revalidatePath("/success");
    revalidatePath(`/success/${slug}`);
    revalidatePath("/admin/case-studies");
    revalidatePath("/");

    return NextResponse.json(caseStudy);
  } catch (error: any) {
    console.error("Error updating case study:", error);
    return NextResponse.json(
      { error: "Failed to update case study", message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

    // Check if case study exists
    const existingCaseStudy = await prisma.caseStudy.findUnique({
      where: { slug },
    });

    if (!existingCaseStudy) {
      return NextResponse.json(
        { error: "Case study not found" },
        { status: 404 }
      );
    }

    await prisma.caseStudy.delete({
      where: { slug },
    });

    revalidateTag("case-studies");
    revalidateTag(`case-study-${slug}`);
    revalidatePath("/success");
    revalidatePath(`/success/${slug}`);
    revalidatePath("/admin/case-studies");
    revalidatePath("/");

    return NextResponse.json({ message: "Case study deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting case study:", error);
    return NextResponse.json(
      { error: "Failed to delete case study", message: error.message },
      { status: 500 }
    );
  }
}

