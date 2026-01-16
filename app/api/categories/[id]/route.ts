import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { name } = await req.json();
    if (!name)
      return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const category = await prisma.category.update({
      where: { id },
      data: { name },
    });
    return NextResponse.json(category);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
