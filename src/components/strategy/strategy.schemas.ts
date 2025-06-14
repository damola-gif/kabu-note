
import * as z from "zod";

export const strategyFormSchema = z.object({
  name: z.string().min(3, "Strategy name must be at least 3 characters long."),
  content_markdown: z.string().min(10, "Strategy content must be at least 10 characters long."),
  is_public: z.boolean().default(false),
});

export type StrategyFormValues = z.infer<typeof strategyFormSchema>;
