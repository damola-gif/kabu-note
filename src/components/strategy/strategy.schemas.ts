
import { z } from "zod";

export const strategyFormSchema = z.object({
  name: z.string().min(1, "Strategy name is required"),
  content_markdown: z.string().min(1, "Strategy content is required"),
  is_public: z.boolean().default(false),
  image_file: z.instanceof(FileList).optional(),
  image_path: z.string().nullable().optional(),
  win_rate: z.number().min(0).max(100).default(0),
  tags: z.array(z.string()).default([]),
});

export type StrategyFormValues = z.infer<typeof strategyFormSchema>;
