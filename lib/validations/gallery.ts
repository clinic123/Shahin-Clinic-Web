// lib/validations/gallery.ts
import { z } from "zod";

export const galleryFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  description: z.string().min(1, "Description is required"),
  featuredImage: z
    .string()
    .url("Must be a valid URL")
    .min(1, "Featured image is required"),
  published: z.boolean().default(false),
});

export type GalleryFormData = z.infer<typeof galleryFormSchema>;
