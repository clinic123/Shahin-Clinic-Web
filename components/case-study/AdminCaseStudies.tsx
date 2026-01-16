"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { FaEye } from "react-icons/fa6";
import { DeleteCaseStudyDialog } from "./delete-case-study-dialog";

interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  published: boolean;
  publishedAt?: Date | null;
  featuredImage?: string | null;
  author?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  } | null;
  shortDescription: string;
  patientName?: string | null;
  patientAge?: number | null;
  condition?: string | null;
  treatmentDuration?: string | null;
  outcome?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function AdminCaseStudies({
  caseStudies,
  params,
}: {
  caseStudies: CaseStudy[];
  params: "admin";
}) {
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    slug: string;
    title: string;
  }>({
    open: false,
    slug: "",
    title: "",
  });

  if (caseStudies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          No case studies found. Create one to get started!
        </p>
        <Link href={`/${params}/case-studies/create`}>
          <Button>Create New Case Study</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 pt-5">
        <div className="flex justify-between">
          <Link href={`/${params}/case-studies/create`}>
            <Button>Create New Case Study</Button>
          </Link>
        </div>
        {caseStudies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No case studies found. Create one to get started!
            </p>
          </div>
        ) : (
          caseStudies?.map((caseStudy) => (
            <Card
              key={caseStudy.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{caseStudy.title}</CardTitle>
                    <CardDescription>
                      {caseStudy.shortDescription ||
                        caseStudy.content.substring(0, 100)}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/success/${caseStudy.slug}`}>
                      <Button variant="outline" size="sm">
                        <FaEye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/case-studies/edit/${caseStudy.slug}`}>
                      <Button variant="outline" size="sm">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive bg-transparent"
                      onClick={() =>
                        setDeleteDialog({
                          open: true,
                          slug: caseStudy.slug,
                          title: caseStudy.title,
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 items-center">
                  {caseStudy.condition && (
                    <Badge variant="secondary">{caseStudy.condition}</Badge>
                  )}
                  <Badge
                    variant={caseStudy.published ? "default" : "secondary"}
                  >
                    {caseStudy.published ? "Published" : "Draft"}
                  </Badge>
                  <span className="text-sm text-muted-foreground ml-auto">
                    By {caseStudy?.author?.name || "Unknown"} •{" "}
                    {new Date(caseStudy.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <DeleteCaseStudyDialog
        slug={deleteDialog.slug}
        title={deleteDialog.title}
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
      />
    </>
  );
}

export default React.memo(AdminCaseStudies);
