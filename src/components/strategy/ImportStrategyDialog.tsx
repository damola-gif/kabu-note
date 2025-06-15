
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateStrategy } from '@/hooks/useStrategies';

interface ImportStrategyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ImportStrategyDialog({ open, onOpenChange }: ImportStrategyDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const createMutation = useCreateStrategy();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type === 'application/json' || selectedFile.name.endsWith('.json')) {
                setFile(selectedFile);
            } else {
                toast.error('Please select a valid JSON file');
                event.target.value = '';
            }
        }
    };

    const handleImport = async () => {
        if (!file) {
            toast.error('Please select a file to import');
            return;
        }

        setIsLoading(true);
        try {
            const fileContent = await file.text();
            const strategyData = JSON.parse(fileContent);

            // Validate required fields
            if (!strategyData.name || !strategyData.content_markdown) {
                throw new Error('Invalid strategy format: missing required fields (name, content_markdown)');
            }

            // Create the strategy
            await createMutation.mutateAsync({
                name: strategyData.name,
                content_markdown: strategyData.content_markdown,
                is_public: false, // Import as private by default
                win_rate: strategyData.win_rate || 0,
                image_file: undefined,
                image_path: undefined,
            });

            toast.success('Strategy imported successfully!');
            onOpenChange(false);
            setFile(null);
        } catch (error) {
            console.error('Import error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to import strategy');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setFile(null);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Import Strategy</DialogTitle>
                    <DialogDescription>
                        Upload a JSON file containing strategy data to import it into your library.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="strategy-file">Strategy File (JSON)</Label>
                        <Input
                            id="strategy-file"
                            type="file"
                            accept=".json,application/json"
                            onChange={handleFileChange}
                            className="mt-1"
                        />
                    </div>

                    {file && (
                        <div className="p-3 bg-muted rounded-md">
                            <div className="flex items-center gap-2">
                                <Upload className="h-4 w-4" />
                                <span className="text-sm font-medium">{file.name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Size: {(file.size / 1024).toFixed(1)} KB
                            </p>
                        </div>
                    )}

                    <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md">
                        <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                            <p className="font-medium">Expected JSON format:</p>
                            <pre className="mt-1 text-xs">
{`{
  "name": "Strategy Name",
  "content_markdown": "# Strategy Rules...",
  "win_rate": 75
}`}
                            </pre>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleImport} 
                            disabled={!file || isLoading}
                        >
                            {isLoading ? 'Importing...' : 'Import Strategy'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
