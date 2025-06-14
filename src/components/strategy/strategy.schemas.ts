
import * as z from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

export const strategyFormSchema = z.object({
  name: z.string().min(3, "Strategy name must be at least 3 characters long."),
  content_markdown: z.string().min(10, "Strategy content must be at least 10 characters long."),
  is_public: z.boolean().default(false),
  image_file: z
    .instanceof(FileList)
    .optional()
    .refine(
      (files) => !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE,
      `Max image size is 5MB.`
    )
    .refine(
      (files) =>
        !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files[0].type),
      "Only .jpg, .jpeg, .png, .webp and .gif formats are supported."
    ),
    image_path: z.string().nullable().optional(),
});

export type StrategyFormValues = z.infer<typeof strategyFormSchema>;
