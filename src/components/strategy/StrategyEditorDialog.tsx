import React from "react";
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
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";

interface StrategyEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  strategy?: Tables<'strategies'>;
  trade?: Tables<'trades'>;
}

const copyToClipboard = (text: string, message: string) => {
  navigator.clipboard.writeText(text).then(() => {
    toast.success(message);
  }).catch(err => {
    toast.error("Failed to copy link.");
    console.error('Failed to copy: ', err);
  });
};

export function StrategyEditorDialog({ open, onOpenChange, strategy, trade }: StrategyEditorDialogProps) {
  const createMutation = useCreateStrategy();
  const updateMutation = useUpdateStrategy();
  const isEditing = !!strategy;
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  const form = useForm<StrategyFormValues>({
    resolver: zodResolver(strategyFormSchema),
    defaultValues: {
      name: "",
      content_markdown: "",
      is_public: false,
      image_file: undefined,
      image_path: undefined,
    },
  });

  const imageFileRef = form.register("image_file");

  React.useEffect(() => {
    if (open) {
      if (strategy) {
        form.reset({
          name: strategy.name,
          content_markdown: strategy.content_markdown ?? '',
          is_public: strategy.is_public ?? false,
          image_path: strategy.image_path ?? undefined,
        });
        if (strategy.image_path) {
          const { data: { publicUrl } } = supabase.storage.from('strategy_images').getPublicUrl(strategy.image_path);
          setImagePreview(publicUrl);
        } else {
          setImagePreview(null);
        }
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
              image_file: undefined,
              image_path: undefined,
          });
          setImagePreview(null);
      }
    }
  }, [strategy, trade, form, open]);
  
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue("image_path", "new-file-selected"); // prevent removal signal
    }
  };

  const removeImage = () => {
      setImagePreview(null);
      form.setValue("image_file", undefined);
      const imageInput = document.querySelector('input[type="file"][name="image_file"]') as HTMLInputElement;
      if (imageInput) imageInput.value = "";
      form.setValue("image_path", null); // Signal removal
  }

  const handlePublish = async () => {
    // Get values and set is_public to true for validation and submission
    const currentValues = form.getValues();
    const valuesForPublish = { ...currentValues, is_public: true };
    
    const result = await form.trigger();
    if (!result) {
        toast.error("Please fix the validation errors before publishing.");
        return;
    }
    
    const validatedValues = strategyFormSchema.parse(valuesForPublish);

    if (isEditing) {
        await updateMutation.mutateAsync({ id: strategy.id, values: validatedValues, originalImagePath: strategy.image_path });
        const strategyUrl = `${window.location.origin}/strategies/${strategy.id}`;
        toast.success("Your strategy is now public!", {
            action: {
                label: "Copy Link",
                onClick: () => copyToClipboard(strategyUrl, "Strategy link copied to clipboard!"),
            },
        });
    } else {
        await createMutation.mutateAsync(validatedValues);
        toast.success("Strategy published successfully!");
    }
    onOpenChange(false);
  }

  function onSubmit(values: StrategyFormValues) {
    if (isEditing) {
      updateMutation.mutate({ id: strategy.id, values, originalImagePath: strategy.image_path });
    } else {
      createMutation.mutate(values);
    }
    onOpenChange(false);
  }

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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
            
            <FormField
              control={form.control}
              name="image_file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Strategy Image (Optional)</FormLabel>
                  <FormControl>
                    <Input type="file" accept="image/jpeg,image/png,image/gif,image/webp" {...imageFileRef} onChange={handleImageChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {imagePreview && (
              <div className="relative w-full h-48 mt-2 rounded-md border">
                <img src={imagePreview} alt="Strategy preview" className="rounded-md object-contain w-full h-full" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove image</span>
                </Button>
              </div>
            )}
            
            <DialogFooter className="!justify-between pt-4 sticky bottom-0 bg-background py-4">
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
