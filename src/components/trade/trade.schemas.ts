
import * as z from "zod";

export const tradeFormSchema = z.object({
  symbol: z.string().min(1, "Symbol is required."),
  side: z.enum(["long", "short"]),
  size: z.coerce.number().positive("Size must be a positive number."),
  entry_price: z.coerce.number().nonnegative("Entry price must be a non-negative number."),
});

export type TradeFormValues = z.infer<typeof tradeFormSchema>;

export const editTradeFormSchema = z.object({
  symbol: z.string().min(1, "Symbol is required."),
  side: z.enum(["long", "short"]),
  size: z.coerce.number().positive("Size must be a positive number."),
  entry_price: z.coerce.number().nonnegative("Entry price must be a non-negative number."),
  exit_price: z.coerce.number().nonnegative("Exit price must be non-negative.").nullable(),
});

export type EditTradeFormValues = z.infer<typeof editTradeFormSchema>;
