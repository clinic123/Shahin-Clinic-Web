import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";

import { NextRequest, NextResponse } from "next/server";

const revalidateBanners = () => {
  revalidateTag("banners");
  revalidatePath("/");
  revalidatePath("/admin/banners");
};

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { banners } = await request.json();

    if (!Array.isArray(banners)) {
      return NextResponse.json(
        { error: "Banners array is required" },
        { status: 400 }
      );
    }

    // Update all banners in a transaction
    const result = await prisma.$transaction(
      banners.map((banner) =>
        prisma.banner.update({
          where: { id: banner.id },
          data: { order: banner.order },
        })
      )
    );

    revalidateBanners();

    return NextResponse.json({
      message: "Banners reordered successfully",
      banners: result,
    });
  } catch (error) {
    console.error("Error reordering banners:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
