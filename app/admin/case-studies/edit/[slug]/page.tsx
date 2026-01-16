import EditCaseStudyPage from "@/components/case-study/EditCaseStudy";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditCaseStudyPageScreen({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
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
    notFound();
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4">
        <Link href="/admin/case-studies">
          <Button variant="ghost" className="mb-6">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Case Studies
          </Button>
        </Link>

        <div className="flex justify-center">
          <EditCaseStudyPage params="admin" caseStudy={caseStudy} />
        </div>
      </div>
    </main>
  );
}

