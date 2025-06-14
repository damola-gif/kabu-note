
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
import { TablesInsert } from "@/integrations/supabase/types";

const tradeFormSchema = z.object({
  symbol: z.string().min(1, "Symbol is required."),
  side: z.enum(["long", "short"]),
  size: z.coerce.number().positive("Size must be a positive number."),
  entry_price: z.coerce.number().nonnegative("Entry price must be a non-negative number."),
});

type TradeFormValues = z.infer<typeof tradeFormSchema>;

interface NewTradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewTradeDialog({ open, onOpenChange }: NewTradeDialogProps) {
  const { user } = useSession();
  const queryClient = useQueryClient();

  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeFormSchema),
    defaultValues: {
      symbol: "",
      side: "long",
      entry_price: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: async (newTrade: TablesInsert<"trades">) => {
      const { error } = await supabase.from("trades").insert(newTrade);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Trade created successfully!");
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(`Error creating trade: ${error.message}`);
    },
  });

  const onSubmit = (values: TradeFormValues) => {
    if (!user) {
      toast.error("You must be logged in to create a trade.");
      return;
    }
    const newTrade: TablesInsert<"trades"> = {
      user_id: user.id,
      symbol: values.symbol,
      side: values.side,
      size: values.size,
      entry_price: values.entry_price,
    };
    mutation.mutate(newTrade);
  };

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
                      </T rig_ger>
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
                  <FormLabel>Entry Price</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 150.25" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : "Save Trade"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
