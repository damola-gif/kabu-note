import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StrategyFormValues } from './strategy.schemas';
import { StrategyImageUpload } from './StrategyImageUpload';
import { StrategyDialogFooter } from './StrategyDialogFooter';
import { Slider } from '@/components/ui/slider';

interface StrategyFormProps {
    form: UseFormReturn<StrategyFormValues>;
    onSubmit: (values: StrategyFormValues) => void;
    imagePreview: string | null;
    onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onImageRemove: () => void;
    isLoading: boolean;
    onCancel: () => void;
    handlePublish: () => Promise<void>;
}

export function StrategyForm({
    form,
    onSubmit,
    imagePreview,
    onImageChange,
    onImageRemove,
    isLoading,
    onCancel,
    handlePublish
}: StrategyFormProps) {
    const winRateValue = form.watch("win_rate");

    return (
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
                    name="win_rate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Win Rate ({field.value}%)</FormLabel>
                            <FormControl>
                                <Slider
                                    min={0}
                                    max={100}
                                    step={1}
                                    value={[field.value ?? 0]}
                                    onValueChange={(value) => field.onChange(value[0])}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <StrategyImageUpload
                    control={form.control}
                    imagePreview={imagePreview}
                    onImageChange={onImageChange}
                    onImageRemove={onImageRemove}
                />
                
                <StrategyDialogFooter
                    control={form.control}
                    isLoading={isLoading}
                    onCancel={onCancel}
                    handlePublish={handlePublish}
                />
            </form>
        </Form>
    );
}
