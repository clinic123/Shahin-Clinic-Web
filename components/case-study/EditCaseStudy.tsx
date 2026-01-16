"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ImageUpload } from "../ui/image-upload";
import { useUpdateCaseStudy, useCaseStudy } from "@/hooks/useCaseStudies";

const updateCaseStudySchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  shortDescription: z.string().max(400, "Description is too long").optional(),
  content: z.string().min(1, "Content is required"),
  published: z.boolean().default(false),
  featuredImage: z.string().url("Must be a valid URL"),
  featuredImageAlt: z.string().optional(),
  patientName: z.string().optional(),
  patientAge: z.number().optional(),
  condition: z.string().optional(),
  treatmentDuration: z.string().optional(),
  outcome: z.string().optional(),
});

type UpdateCaseStudyFormData = z.infer<typeof updateCaseStudySchema>;

interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  published: boolean;
  publishedAt?: Date | null;
  featuredImage?: string | null;
  featuredImageAlt?: string | null;
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

interface EditCaseStudyPageProps {
  params: "admin";
  caseStudy: CaseStudy;
}

export default function EditCaseStudyPage({
  params,
  caseStudy: initialCaseStudy,
}: EditCaseStudyPageProps) {
  const router = useRouter();
  const updateCaseStudyMutation = useUpdateCaseStudy();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<UpdateCaseStudyFormData>({
    resolver: zodResolver(updateCaseStudySchema as any),
    defaultValues: {
      title: initialCaseStudy.title,
      shortDescription: initialCaseStudy.shortDescription,
      content: initialCaseStudy.content,
      published: initialCaseStudy.published,
      featuredImage: initialCaseStudy.featuredImage || "",
      featuredImageAlt: initialCaseStudy.featuredImageAlt || "",
      patientName: initialCaseStudy.patientName || "",
      patientAge: initialCaseStudy.patientAge || undefined,
      condition: initialCaseStudy.condition || "",
      treatmentDuration: initialCaseStudy.treatmentDuration || "",
      outcome: initialCaseStudy.outcome || "",
    },
  });

  const content = watch("content");
  const featuredImage = watch("featuredImage");

  const handleEditorChange = (content: string) => {
    setValue("content", content, { shouldValidate: true });
  };

  const handleImageChange = async (imageUrl: string) => {
    setValue("featuredImage", imageUrl, { shouldValidate: true });
  };
  const handleImageRemove = async () => {
    setValue("featuredImage", "", { shouldValidate: true });
  };

  const onSubmit = async (data: UpdateCaseStudyFormData) => {
    try {
      await updateCaseStudyMutation.mutateAsync({
        slug: initialCaseStudy.slug,
        ...data,
        patientAge: data.patientAge || undefined,
      });
      toast.success("Case study updated successfully");
      router.push(`/${params}/case-studies`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update case study");
    }
  };

  return (
    <Card className="w-full max-w-7xl">
      <CardHeader>
        <CardTitle>Edit Case Study</CardTitle>
        <CardDescription>Update your case study content</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter case study title"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <textarea
              id="shortDescription"
              {...register("shortDescription")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Brief description of your case study"
            />
            {errors.shortDescription && (
              <p className="text-sm text-red-600">
                {errors.shortDescription.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium mb-2">
              Featured Image *
            </label>
            <ImageUpload
              onImageChange={handleImageChange}
              onImageRemove={handleImageRemove}
              currentImage={featuredImage}
              variant="image-box"
            />
            {errors.featuredImage && (
              <p className="text-sm text-red-600">
                {errors.featuredImage.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="featuredImageAlt">Featured Image Alt Text</Label>
            <Input
              id="featuredImageAlt"
              placeholder="Alt text for the featured image"
              {...register("featuredImageAlt")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientName">Patient Name (Optional)</Label>
              <Input
                id="patientName"
                placeholder="Patient name or 'Anonymous'"
                {...register("patientName")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patientAge">Patient Age (Optional)</Label>
              <Input
                id="patientAge"
                type="number"
                placeholder="Age in years"
                {...register("patientAge", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition">Condition/Treatment (Optional)</Label>
            <Input
              id="condition"
              placeholder="e.g., Chronic Migraine, Eczema"
              {...register("condition")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatmentDuration">
              Treatment Duration (Optional)
            </Label>
            <Input
              id="treatmentDuration"
              placeholder="e.g., 3 months, 6 weeks"
              {...register("treatmentDuration")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="outcome">Outcome Summary (Optional)</Label>
            <textarea
              id="outcome"
              {...register("outcome")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Brief summary of treatment outcome..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="published"
              {...register("published")}
              className="rounded border-gray-300"
            />
            <Label htmlFor="published">Published</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <RichTextEditor
              value={content}
              onChange={handleEditorChange}
              placeholder="Enter case study content..."
            />
            {errors.content && (
              <p className="text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting || updateCaseStudyMutation.isPending}
            >
              {isSubmitting || updateCaseStudyMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Case Study"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

