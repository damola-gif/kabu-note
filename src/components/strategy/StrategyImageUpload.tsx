
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { StrategyFormValues } from "./strategy.schemas";
import { X } from 'lucide-react';

interface StrategyImageUploadProps {
  control: UseFormReturn<StrategyFormValues>['control'];
  imagePreview: string | null;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: () => void;
}

export function StrategyImageUpload({ control, imagePreview, onImageChange, onImageRemove }: StrategyImageUploadProps) {
  return (
    <>
      <FormField
        control={control}
        name="image_file"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Strategy Image (Optional)</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={(e) => {
                  field.onChange(e.target.files); // Update RHF state
                  onImageChange(e); // Update preview
                }}
              />
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
            onClick={onImageRemove}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove image</span>
          </Button>
        </div>
      )}
    </>
  );
}
