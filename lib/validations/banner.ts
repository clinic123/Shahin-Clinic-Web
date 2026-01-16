import { z } from "zod";

export const bannerFormSchema = z.object({
  heading: z
    .array(z.string().min(1, "Heading line is required"))
    .min(1, "At least one heading line is required"),
  description: z.string().min(1, "Description is required"),
  image: z.string().url("Must be a valid URL").min(1, "Image is required"),
  button: z.string().min(1, "Button text is required"),
  buttonLink: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  published: z.boolean().default(false),
  order: z.number().min(0).default(0),
});

export type BannerFormData = z.infer<typeof bannerFormSchema>;
