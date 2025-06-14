
import React from 'react';
import { Control } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from '@/components/ui/switch';
import { DialogFooter } from '@/components/ui/dialog';
import { StrategyFormValues } from './strategy.schemas';

interface StrategyDialogFooterProps {
  control: Control<StrategyFormValues>;
  isLoading: boolean;
  onCancel: () => void;
  handlePublish: () => Promise<void>;
}

export function StrategyDialogFooter({ control, isLoading, onCancel, handlePublish }: StrategyDialogFooterProps) {
  return (
    <DialogFooter className="!justify-between pt-4 sticky bottom-0 bg-background py-4">
      <FormField
        control={control}
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
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Save Draft"}</Button>
        <Button type="button" onClick={handlePublish} disabled={isLoading}>
          {isLoading ? "Publishing..." : "Publish"}
        </Button>
      </div>
    </DialogFooter>
  );
}
