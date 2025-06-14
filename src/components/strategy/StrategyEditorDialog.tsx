
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCreateStrategy, useUpdateStrategy } from "@/hooks/useStrategies";
import { strategyFormSchema, StrategyFormValues } from "./strategy.schemas";
import { Tables } from "@/integrations/supabase/types";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { copyToClipboard } from '@/lib/utils';

interface StrategyEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  strategy?: Tables<'strategies'>;
  trade?: Tables<'trades'>;
}

export function StrategyEditorDialog({ open, onOpenChange, strategy, trade }: StrategyEditorDialogProps) {
  const createMutation = useCreateStrategy();
  const updateMutation = useUpdateStrategy();
  const isEditing = !!strategy;

  const form = useForm<StrategyFormValues>({
    resolver: zodResolver(strategyFormSchema),
    defaultValues: {
      name: "",
      content_markdown: "",
      is_public: false,
    },
  });

  React.useEffect(() => {
    if (strategy) {
      form.reset({
        name: strategy.name,
        content_markdown: strategy.content_markdown ?? '',
        is_public: strategy.is_public ?? false,
      });
    } else if (trade) {
        const title = `${format(new Date(), "yyyy-MM-dd")} - ${trade.symbol} Strategy`;
        const content = `
*   **Symbol:** ${trade.symbol}
*   **Side:** ${trade.side}
*   **Entry Price:** ${trade.entry_price}
*   **Size:** ${trade.size}
*   **Stop Loss:** ${trade.stop_loss ?? 'N/A'}
*   **Take Profit:** ${trade.take_profit ?? 'N/A'}

---

### Analysis

(Add your notes here)
`;
        form.reset({
            name: title,
            content_markdown: content.trim(),
            is_public: false,
        })
    } else {
        form.reset({
            name: "",
            content_markdown: "",
            is_public: false,
        });
    }
  }, [strategy, trade, form, open]);
  
  const handlePublish = async () => {
    const values = form.getValues();
    const result = strategyFormSchema.safeParse({...values, is_public: true });

    if (!result.success) {
      form.trigger();
      return;
    }
    
    if (isEditing) {
        await updateMutation.mutateAsync({ id: strategy.id, ...result.data, is_public: true });
        const strategyUrl = `${window.location.origin}/strategies/${strategy.id}`;
        toast.success("Your strategy is now public!", {
            action: {
                label: "Copy Link",
                onClick: () => copyToClipboard(strategyUrl, "Strategy link copied to clipboard!"),
            },
        });
    } else {
        // Can't publish a new strategy directly this way without getting the ID first
        // For simplicity, we'll just save it as public
        createMutation.mutate({ ...result.data, is_public: true });
    }
    onOpenChange(false);
  }

  function onSubmit(values: StrategyFormValues) {
    if (isEditing) {
      updateMutation.mutate({ id: strategy.id, ...values });
    } else {
      createMutation.mutate(values);
    }
    onOpenChange(false);
  }

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Strategy" : "Create New Strategy"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update your strategy details below." : "Author a new strategy. You can save it as a draft or publish it."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Breakout RSI Strategy" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content_markdown"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Strategy Content (Markdown)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Write your strategy details here..." {...field} rows={15} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="!justify-between">
                <FormField
                  control={form.control}
                  name="is_public"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Publish Publicly</FormLabel>
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                    <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Save Draft"}</Button>
                    <Button type="button" onClick={handlePublish} disabled={isLoading}>
                      {isLoading ? "Publishing..." : "Publish"}
                    </Button>
                </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
