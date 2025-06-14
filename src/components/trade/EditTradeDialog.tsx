
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSession } from "@/contexts/SessionProvider";
import { Tables, TablesUpdate } from "@/integrations/supabase/types";

const editTradeFormSchema = z.object({
  symbol: z.string().min(1, "Symbol is required."),
  side: z.enum(["long", "short"]),
  size: z.coerce.number().positive("Size must be a positive number."),
  entry_price: z.coerce.number().nonnegative("Entry price must be a non-negative number."),
  exit_price: z.coerce.number().nonnegative("Exit price must be non-negative.").nullable(),
});

type EditTradeFormValues = z.infer<typeof editTradeFormSchema>;

interface EditTradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trade: Tables<"trades">;
}

export function EditTradeDialog({ open, onOpenChange, trade }: EditTradeDialogProps) {
  const queryClient = useQueryClient();
  const { user } = useSession();

  const form = useForm<EditTradeFormValues>({
    resolver: zodResolver(editTradeFormSchema),
  });

  React.useEffect(() => {
    if (trade) {
      form.reset({
        symbol: trade.symbol,
        side: trade.side,
        size: trade.size,
        entry_price: trade.entry_price,
        exit_price: trade.exit_price,
      });
    }
  }, [trade, open, form]);

  const mutation = useMutation({
    mutationFn: async (updatedTrade: {
      values: TablesUpdate<"trades">;
      tradeId: string;
    }) => {
      const { error } = await supabase
        .from("trades")
        .update(updatedTrade.values)
        .eq("id", updatedTrade.tradeId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Trade updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["trades", user?.id] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Error updating trade: ${error.message}`);
    },
  });

  const onSubmit = (values: EditTradeFormValues) => {
    const updatedTradeValues: TablesUpdate<"trades"> = {
      symbol: values.symbol,
      side: values.side,
      size: values.size,
      entry_price: values.entry_price,
      exit_price: values.exit_price,
      updated_at: new Date().toISOString(),
    };

    if (values.exit_price && !trade.exit_price) {
      updatedTradeValues.closed_at = new Date().toISOString();
    } else if (!values.exit_price && trade.exit_price) {
      updatedTradeValues.closed_at = null;
    }

    if (values.exit_price) {
      const exitPrice = values.exit_price;
      const entryPrice = values.entry_price;
      const size = values.size;
      if (values.side === "long") {
        updatedTradeValues.pnl = (exitPrice - entryPrice) * size;
      } else {
        updatedTradeValues.pnl = (entryPrice - exitPrice) * size;
      }
    } else {
      updatedTradeValues.pnl = null;
    }

    mutation.mutate({ values: updatedTradeValues, tradeId: trade.id });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Trade</DialogTitle>
          <DialogDescription>
            Update the details of your trade. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Symbol</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., AAPL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="side"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Side</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a side" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="long">Long</SelectItem>
                      <SelectItem value="short">Short</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Size</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 100"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="entry_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entry Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 150.25"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="exit_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exit Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Leave blank if open"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
