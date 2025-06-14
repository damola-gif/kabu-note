
import * as z from "zod";

export const tradeFormSchema = z.object({
  symbol: z.string().min(1, "Symbol is required."),
  side: z.enum(["long", "short"]),
  size: z.coerce.number().positive("Size must be a positive number."),
  entry_price: z.coerce.number().nonnegative("Entry price must be a non-negative number."),
  stop_loss: z.coerce.number().nonnegative("Stop loss must be non-negative.").optional().nullable(),
  take_profit: z.coerce.number().nonnegative("Take profit must be non-negative.").optional().nullable(),
});

export type TradeFormValues = z.infer<typeof tradeFormSchema>;

export const editTradeFormSchema = z.object({
  symbol: z.string().min(1, "Symbol is required."),
  side: z.enum(["long", "short"]),
  size: z.coerce.number().positive("Size must be a positive number."),
  entry_price: z.coerce.number().nonnegative("Entry price must be a non-negative number."),
  exit_price: z.coerce.number().nonnegative("Exit price must be non-negative.").nullable(),
  stop_loss: z.coerce.number().nonnegative("Stop loss must be non-negative.").optional().nullable(),
  take_profit: z.coerce.number().nonnegative("Take profit must be non-negative.").optional().nullable(),
  closing_notes: z.string().optional().nullable(),
});

export type EditTradeFormValues = z.infer<typeof editTradeFormSchema>;
