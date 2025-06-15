import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCreateStrategy, useUpdateStrategy } from "@/hooks/useStrategies";
import { strategyFormSchema, StrategyFormValues } from "./strategy.schemas";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { StrategyForm } from "./StrategyForm";

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
      win_rate: 0,
    },
  });

  React.useEffect(() => {
    if (open) {
      if (strategy) {
        form.reset({
          name: strategy.name,
          content_markdown: strategy.content_markdown ?? '',
          is_public: strategy.is_public ?? false,
          image_path: strategy.image_path ?? undefined,
          win_rate: (strategy.win_rate as number) ?? 0,
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
            image_file: undefined,
            image_path: undefined,
            win_rate: 0,
        });
        setImagePreview(null);
      } else {
          form.reset({
              name: "",
              content_markdown: "",
              is_public: false,
              image_file: undefined,
              image_path: undefined,
              win_rate: 0,
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
      // We no longer need to manually clear the input as RHF handles it with controlled components
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
    
    // Zod will parse and validate the final values
    const validatedValues = strategyFormSchema.parse(valuesForPublish);

    if (isEditing) {
        if (!strategy) return;
        await updateMutation.mutateAsync({ id: strategy.id, values: validatedValues, originalImagePath: strategy.image_path });
        const strategyUrl = `${window.location.origin}/strategies/${strategy.id}`;
        toast.success("Your strategy is now public!", {
            action: {
                label: "Copy Link",
                onClick: () => copyToClipboard(strategyUrl, "Strategy link copied to clipboard!"),
            },
        });
    } else {
        const newStrategy = await createMutation.mutateAsync(validatedValues);
        if (newStrategy?.id) {
          const strategyUrl = `${window.location.origin}/strategies/${newStrategy.id}`;
          toast.success("Strategy published successfully!", {
              action: {
                  label: "Copy Link",
                  onClick: () => copyToClipboard(strategyUrl, "Strategy link copied to clipboard!"),
              },
          });
        } else {
          toast.success("Strategy published successfully!");
        }
    }
    onOpenChange(false);
  }

  function onSubmit(values: StrategyFormValues) {
    if (isEditing) {
      if (!strategy) return;
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
        <StrategyForm
            form={form}
            onSubmit={onSubmit}
            imagePreview={imagePreview}
            onImageChange={handleImageChange}
            onImageRemove={removeImage}
            isLoading={isLoading}
            onCancel={() => onOpenChange(false)}
            handlePublish={handlePublish}
        />
      </DialogContent>
    </Dialog>
  );
}
