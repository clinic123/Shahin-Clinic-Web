"use client";

import RichTextEditor from "@/components/ui/rich-text-editor";
import { useCreateCaseStudy } from "@/hooks/useCaseStudies";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { ImageUpload } from "../ui/image-upload";

const CreateCaseStudyForm = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  published: z.boolean().default(false),
  shortDescription: z.string().min(1).max(350).optional(),
  featuredImage: z.string().url("Must be a valid URL"),
  featuredImageAlt: z.string().optional(),
  patientName: z.string().optional(),
  patientAge: z.number().optional(),
  condition: z.string().optional(),
  treatmentDuration: z.string().optional(),
  outcome: z.string().optional(),
});

type CreateCaseStudyForm = z.infer<typeof CreateCaseStudyForm>;

export default function CreateCaseStudyPage({ params }: { params: "admin" }) {
  const router = useRouter();
  const createCaseStudyMutation = useCreateCaseStudy();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<CreateCaseStudyForm>({
    defaultValues: {
      title: "",
      published: true,
      content: "",
      shortDescription: "",
      featuredImage: "",
      featuredImageAlt: "",
      patientName: "",
      patientAge: undefined,
      condition: "",
      treatmentDuration: "",
      outcome: "",
    },
  });

  const content = watch("content");
  const featuredImage = watch("featuredImage");

  const handleImageChange = async (imageUrl: string) => {
    setValue("featuredImage", imageUrl, { shouldValidate: true });
  };
  const handleImageRemove = async () => {
    setValue("featuredImage", "", { shouldValidate: true });
  };

  const onSubmit = async (data: CreateCaseStudyForm) => {
    try {
      const result = await createCaseStudyMutation.mutateAsync({
        ...data,
        patientAge: data.patientAge || undefined,
      });
      toast.success("Case study created successfully");
      router.push(`/${params}/case-studies`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create case study");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create Case Study</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            {...register("title", { required: "Title is required" })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Short Description */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Short Description *
          </label>
          <textarea
            {...register("shortDescription", {
              required: "Short description is required",
            })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Brief description of the case study..."
          />
          {errors.shortDescription && (
            <p className="text-red-500 text-sm mt-1">
              {errors.shortDescription.message}
            </p>
          )}
        </div>

        {/* Featured Image */}
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
            <p className="text-red-500 text-sm mt-1">
              {errors.featuredImage.message}
            </p>
          )}
        </div>

        {/* Featured Image Alt */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Featured Image Alt Text
          </label>
          <input
            type="text"
            {...register("featuredImageAlt")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Alt text for the featured image..."
          />
        </div>

        {/* Patient Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Patient Name (Optional)
            </label>
            <input
              type="text"
              {...register("patientName")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Patient name or 'Anonymous'"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Patient Age (Optional)
            </label>
            <input
              type="number"
              {...register("patientAge", { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Age in years"
            />
          </div>
        </div>

        {/* Condition */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Condition/Treatment (Optional)
          </label>
          <input
            type="text"
            {...register("condition")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="e.g., Chronic Migraine, Eczema"
          />
        </div>

        {/* Treatment Duration */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Treatment Duration (Optional)
          </label>
          <input
            type="text"
            {...register("treatmentDuration")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="e.g., 3 months, 6 weeks"
          />
        </div>

        {/* Outcome */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Outcome Summary (Optional)
          </label>
          <textarea
            {...register("outcome")}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Brief summary of treatment outcome..."
          />
        </div>

        {/* Published */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              {...register("published")}
              className="mr-2"
            />
            Published
          </label>
        </div>

        {/* Content Editor */}
        <div>
          <label className="block text-sm font-medium mb-2">Content *</label>
          <RichTextEditor
            value={content}
            onChange={(val: string) => setValue("content", val)}
            placeholder="Enter case study content..."
          />
          {errors.content && (
            <p className="text-red-500 text-sm mt-1">
              {errors.content.message}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting || createCaseStudyMutation.isPending}
            className="bg-primary text-white px-6 py-2 rounded-md disabled:opacity-50"
          >
            {isSubmitting || createCaseStudyMutation.isPending
              ? "Creating..."
              : "Create Case Study"}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border rounded-md"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
