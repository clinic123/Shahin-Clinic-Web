// components/courses/CourseEditDialog.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { useUpdateCourse } from "@/hooks/useCourses";
import { CourseType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ImageUpload } from "../ui/image-upload";

const courseFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  shortDescription: z.string().min(1, "Short description is required"),
  image: z.string().url("Must be a valid URL").min(1, "Image URL is required"),
  price: z.string().min(1, "Price is required"),
  videoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  category: z.string().min(1, "Category is required"),
  isActive: z.boolean().default(true),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

interface CourseEditDialogProps {
  course: CourseType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CourseEditDialog({
  course,
  open,
  onOpenChange,
  onSuccess,
}: CourseEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateCourse = useUpdateCourse();

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema as any),

    defaultValues: {
      title: "",
      description: "",
      shortDescription: "",
      image: "",
      price: "",
      videoUrl: "",
      category: "",
      isActive: true,
    },
  });

  const featuredImage = form.watch("image");

  const handleImageChange = async (imageUrl: string) => {
    form.setValue("image", imageUrl, { shouldValidate: true });
  };
  const handleImageRemove = async () => {
    form.setValue("image", "", { shouldValidate: true });
  };

  useEffect(() => {
    if (course && open) {
      form.reset({
        title: course.title,
        description: course.description,
        shortDescription: course.shortDescription || "",
        image: course.image,
        price: course.price.toString(),
        videoUrl: course.videoUrl || "",
        category: course.category || "",
        isActive: course.isActive,
      });
    }
  }, [course, open, form]);

  const onSubmit = async (data: CourseFormValues) => {
    if (!course) return;

    setIsSubmitting(true);
    try {
      await updateCourse.mutateAsync({
        id: course.id,
        data: {
          ...data,
          price: parseFloat(data.price),
          videoUrl: data.videoUrl || undefined,
        },
      });
      onSuccess();
      form.reset();
    } catch (error) {
      console.error("Failed to update course:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
          <DialogDescription>
            Update the course details below.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Course title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shortDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Brief description for cards"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Description</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Full course description..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <ImageUpload
                        currentImage={field.value}
                        onImageChange={handleImageChange}
                        onImageRemove={handleImageRemove}
                        variant="square"
                        size="lg"
                        fallbackText="gallery"
                        className="mb-4"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (BDT)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Course category" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video URL (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/video"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>
                      When inactive, the course won't be visible to students.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update Course
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
