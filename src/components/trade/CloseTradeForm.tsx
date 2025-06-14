
import * as React from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateTrade } from "@/hooks/useTrades";
import { Tables } from "@/integrations/supabase/types";
import { closeTradeFormSchema, CloseTradeFormValues } from "./trade.schemas";
import { fetchQuote } from "@/api/twelvedata";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";

interface CloseTradeFormProps {
  trade: Tables<"trades">;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CloseTradeForm({ trade, onSuccess, onCancel }: CloseTradeFormProps) {
  const updateTradeMutation = useUpdateTrade();
  const [isFetchingPrice, setIsFetchingPrice] = React.useState(false);

  const form = useForm<CloseTradeFormValues>({
    resolver: zodResolver(closeTradeFormSchema),
    defaultValues: {
      exit_price: undefined,
      closing_notes: trade.closing_notes ?? "",
    }
  });

  const onSubmit = (values: CloseTradeFormValues) => {
    updateTradeMutation.mutate({ values, tradeId: trade.id }, {
      onSuccess: () => {
        toast.success(`Trade ${trade.symbol} closed successfully.`);
        onSuccess();
      }
    });
  };

  const handleUseCurrentPrice = async () => {
    if (!trade.symbol) return;
    setIsFetchingPrice(true);
    try {
        const quote = await fetchQuote(trade.symbol);
        form.setValue("exit_price", quote.c, { shouldValidate: true });
        toast.success(`Set exit price to current price: ${quote.c}`);
    } catch (error: any) {
        toast.error(error.message || "Failed to fetch current price.");
    } finally {
        setIsFetchingPrice(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="exit_price"
          render={({ field }) => (
            <FormItem>
                <div className="flex justify-between items-center">
                <FormLabel>Exit Price</FormLabel>
                <Button type="button" size="sm" variant="link" className="h-auto p-0 text-xs" onClick={handleUseCurrentPrice} disabled={isFetchingPrice}>
                  {isFetchingPrice ? <Loader2 className="animate-spin h-3 w-3" /> : 'Use Current'}
                </Button>
              </div>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter exit price"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="closing_notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Closing Notes (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Target hit, exited trade."
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
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" variant="destructive" disabled={updateTradeMutation.isPending}>
            {updateTradeMutation.isPending ? "Closing..." : "Close Trade"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
