import AdminCaseStudies from "@/components/case-study/AdminCaseStudies";
import prisma from "@/lib/prisma";
import { Suspense } from "react";

async function fetchCaseStudies() {
  try {
    const caseStudies = await prisma.caseStudy.findMany({
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
      orderBy: {
        createdAt: "desc",
      },
    });
    return caseStudies;
  } catch (error) {
    console.error("Error fetching case studies:", error);
    return [];
  }
}

export default async function AdminCaseStudiesPage() {
  const caseStudies = await fetchCaseStudies();

  return (
    <Suspense
      fallback={
        <>
          <div>
            <p>Loading.....</p>
          </div>
        </>
      }
    >
      <AdminCaseStudies caseStudies={caseStudies} params="admin" />
    </Suspense>
  );
}

