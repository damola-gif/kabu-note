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
import { useCreateTrade } from "@/hooks/useTrades";
import { tradeFormSchema, TradeFormValues } from "./trade.schemas";
import { fetchQuote } from "@/api/twelvedata";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface NewTradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewTradeDialog({ open, onOpenChange }: NewTradeDialogProps) {
  const createTradeMutation = useCreateTrade();
  const [isFetchingPrice, setIsFetchingPrice] = React.useState<string | null>(null);

  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeFormSchema),
    defaultValues: {
      symbol: "",
      side: "long",
      entry_price: 0,
      size: undefined,
      stop_loss: null,
      take_profit: null,
    },
  });

  const onSubmit = (values: TradeFormValues) => {
    createTradeMutation.mutate(values, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
      },
    });
  };

  const handleUseCurrentPrice = async (fieldName: "entry_price" | "stop_loss" | "take_profit") => {
    const symbol = form.getValues("symbol");
    if (!symbol) {
        toast.error("Please enter a symbol first.");
        return;
    }
    setIsFetchingPrice(fieldName);
    try {
        const quote = await fetchQuote(symbol);
        form.setValue(fieldName, quote.c, { shouldValidate: true });
        toast.success(`Set ${fieldName.replace(/_/g, ' ')} to current price: ${quote.c}`);
    } catch (error: any) {
        toast.error(error.message || "Failed to fetch current price.");
    } finally {
        setIsFetchingPrice(null);
    }
  };

  React.useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Trade</DialogTitle>
          <DialogDescription>
            Log a new trade to your journal. Click save when you're done.
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Input type="number" placeholder="e.g., 100" {...field} value={field.value ?? ''} />
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
                  <div className="flex justify-between items-center">
                    <FormLabel>Entry Price</FormLabel>
                    <Button type="button" size="sm" variant="link" className="h-auto p-0 text-xs" onClick={() => handleUseCurrentPrice('entry_price')} disabled={!!isFetchingPrice}>
                      {isFetchingPrice === 'entry_price' ? <Loader2 className="animate-spin h-3 w-3" /> : 'Use Current'}
                    </Button>
                  </div>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 150.25" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stop_loss"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Stop Loss</FormLabel>
                    <Button type="button" size="sm" variant="link" className="h-auto p-0 text-xs" onClick={() => handleUseCurrentPrice('stop_loss')} disabled={!!isFetchingPrice}>
                      {isFetchingPrice === 'stop_loss' ? <Loader2 className="animate-spin h-3 w-3" /> : 'Use Current'}
                    </Button>
                  </div>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 145.00" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="take_profit"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Take Profit</FormLabel>
                    <Button type="button" size="sm" variant="link" className="h-auto p-0 text-xs" onClick={() => handleUseCurrentPrice('take_profit')} disabled={!!isFetchingPrice}>
                      {isFetchingPrice === 'take_profit' ? <Loader2 className="animate-spin h-3 w-3" /> : 'Use Current'}
                    </Button>
                  </div>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 160.50" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={createTradeMutation.isPending}>
                {createTradeMutation.isPending ? "Saving..." : "Save Trade"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
