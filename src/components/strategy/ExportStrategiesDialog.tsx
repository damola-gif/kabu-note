
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileText, Database } from 'lucide-react';
import { toast } from 'sonner';
import { StrategyWithProfile } from '@/hooks/useStrategies';

interface ExportStrategiesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    strategies: StrategyWithProfile[];
}

export function ExportStrategiesDialog({ open, onOpenChange, strategies }: ExportStrategiesDialogProps) {
    const [format, setFormat] = useState<'json' | 'csv'>('json');
    const [includePrivate, setIncludePrivate] = useState(true);
    const [includePublic, setIncludePublic] = useState(true);

    const filteredStrategies = strategies.filter(strategy => {
        if (strategy.is_public && !includePublic) return false;
        if (!strategy.is_public && !includePrivate) return false;
        return true;
    });

    const handleExport = () => {
        if (filteredStrategies.length === 0) {
            toast.error('No strategies selected for export');
            return;
        }

        try {
            if (format === 'json') {
                exportAsJSON();
            } else {
                exportAsCSV();
            }
            toast.success(`${filteredStrategies.length} strategies exported successfully!`);
            onOpenChange(false);
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export strategies');
        }
    };

    const exportAsJSON = () => {
        const exportData = filteredStrategies.map(strategy => ({
            name: strategy.name,
            content_markdown: strategy.content_markdown,
            win_rate: strategy.win_rate,
            is_public: strategy.is_public,
            tags: strategy.tags || [],
            created_at: strategy.created_at,
            likes_count: strategy.likes_count,
            comments_count: strategy.comments_count,
            bookmarks_count: strategy.bookmarks_count || 0,
        }));

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        downloadFile(blob, 'kabuname-strategies.json');
    };

    const exportAsCSV = () => {
        const headers = ['Name', 'Win Rate (%)', 'Visibility', 'Tags', 'Created Date', 'Likes', 'Comments', 'Bookmarks', 'Content Preview'];
        const rows = filteredStrategies.map(strategy => [
            strategy.name,
            strategy.win_rate || 0,
            strategy.is_public ? 'Public' : 'Private',
            (strategy.tags || []).join('; '),
            strategy.created_at ? new Date(strategy.created_at).toLocaleDateString() : '',
            strategy.likes_count || 0,
            strategy.comments_count || 0,
            strategy.bookmarks_count || 0,
            (strategy.content_markdown || '').substring(0, 100).replace(/\n/g, ' ') + '...'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        downloadFile(blob, 'kabuname-strategies.csv');
    };

    const downloadFile = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Export Strategies</DialogTitle>
                    <DialogDescription>
                        Export your strategies to a file for backup or sharing.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div>
                        <Label className="text-base font-medium">Export Format</Label>
                        <RadioGroup value={format} onValueChange={(value) => setFormat(value as 'json' | 'csv')} className="mt-2">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="json" id="json" />
                                <Label htmlFor="json" className="flex items-center gap-2 cursor-pointer">
                                    <Database className="h-4 w-4" />
                                    JSON (Full data, re-importable)
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="csv" id="csv" />
                                <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer">
                                    <FileText className="h-4 w-4" />
                                    CSV (Spreadsheet compatible)
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div>
                        <Label className="text-base font-medium">Strategy Visibility</Label>
                        <div className="mt-2 space-y-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="include-public" 
                                    checked={includePublic}
                                    onCheckedChange={(checked) => setIncludePublic(checked === true)}
                                />
                                <Label htmlFor="include-public">Include public strategies</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="include-private" 
                                    checked={includePrivate}
                                    onCheckedChange={(checked) => setIncludePrivate(checked === true)}
                                />
                                <Label htmlFor="include-private">Include private strategies</Label>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm">
                            <span className="font-medium">{filteredStrategies.length}</span> strategies will be exported
                        </p>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleExport} 
                            disabled={filteredStrategies.length === 0}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Export {format.toUpperCase()}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
