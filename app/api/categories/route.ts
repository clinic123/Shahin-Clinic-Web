import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// GET all categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(categories);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// CREATE category
export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name)
      return NextResponse.json({ error: "Name is required" }, { status: 400 });

    let slug = slugify(name);
    let existing = await prisma.category.findUnique({ where: { slug } });
    let counter = 1;
    while (existing) {
      slug = `${slugify(name)}-${counter++}`;
      existing = await prisma.category.findUnique({ where: { slug } });
    }

    const category = await prisma.category.create({
      data: { name, slug },
    });
    return NextResponse.json(category);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
