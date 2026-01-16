import TiptapRenderer from "@/components/TiptapRenderer";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Suspense } from "react";

const fetchCaseStudy = async (slug: string) => {
  const getCachedCaseStudy = unstable_cache(
    async () => {
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

      return caseStudy;
    },
    [`case-study-${slug}`],
    {
      tags: [`case-study-${slug}`, "case-studies"],
      revalidate: 60,
    }
  );

  return getCachedCaseStudy();
};

const CaseStudyPageSkeleton = () => {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      <div className="mb-8">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      <div className="space-y-4 mb-12">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
};

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  const caseStudy = await fetchCaseStudy(slug);
  if (!caseStudy) {
    return {
      title: "Case Study Not Found - Shaheen's Clinic",
      description: "The requested case study could not be found.",
    };
  }

  return {
    title: `${caseStudy.title} - Case Study | Shaheen's Clinic`,
    description: caseStudy.shortDescription || `Read about this successful homeopathic treatment case from Shaheen's Clinic.`,
    keywords: `${caseStudy.condition || ""}, case study, homeopathy success, ${caseStudy.title}`.trim(),
  };
};

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const caseStudy = await fetchCaseStudy(slug);

  if (!caseStudy) {
    notFound();
  }

  return (
    <Suspense fallback={<CaseStudyPageSkeleton />}>
      <div className="container mx-auto py-8 max-w-4xl">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/success">Case Studies</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{caseStudy.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <article className="prose lg:prose-xl pt-6 max-w-none">
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{caseStudy.title}</h1>
            <div className="flex mb-6 items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <time dateTime={formatDate(caseStudy.publishedAt || caseStudy.createdAt)}>
                {formatDate(caseStudy.publishedAt || caseStudy.createdAt)}
              </time>
              {caseStudy.author && (
                <>
                  <span>•</span>
                  <span>{caseStudy.author.name}</span>
                </>
              )}
            </div>
            {(caseStudy.condition || caseStudy.patientName || caseStudy.patientAge) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {caseStudy.condition && (
                  <Badge variant="secondary">{caseStudy.condition}</Badge>
                )}
                {caseStudy.patientName && (
                  <Badge variant="outline">Patient: {caseStudy.patientName}</Badge>
                )}
                {caseStudy.patientAge && (
                  <Badge variant="outline">{caseStudy.patientAge} years old</Badge>
                )}
              </div>
            )}
            {caseStudy.treatmentDuration && (
              <p className="text-sm text-muted-foreground mb-2">
                Treatment Duration: {caseStudy.treatmentDuration}
              </p>
            )}
            {caseStudy.outcome && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                <p className="font-semibold text-green-800 mb-2">Outcome:</p>
                <p className="text-green-700">{caseStudy.outcome}</p>
              </div>
            )}
          </header>
          <TiptapRenderer content={caseStudy.content} />
        </article>
      </div>
    </Suspense>
  );
}

