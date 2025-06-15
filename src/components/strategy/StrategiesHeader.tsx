
import { Button } from '@/components/ui/button';
import { PlusCircle, Upload, Download } from 'lucide-react';

interface StrategiesHeaderProps {
    onNewStrategy: () => void;
    onImportStrategy: () => void;
    onExportStrategies: () => void;
}

export function StrategiesHeader({ 
    onNewStrategy, 
    onImportStrategy, 
    onExportStrategies 
}: StrategiesHeaderProps) {
    return (
        <div className="flex justify-between items-center mb-6 gap-4">
            <div>
                <h1 className="text-3xl font-bold">Strategy Library</h1>
                <p className="text-muted-foreground">Browse and manage your collection of trading strategies.</p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={onImportStrategy}>
                    <Upload className="mr-2 h-4 w-4" />
                    Import Strategy
                </Button>
                <Button variant="outline" onClick={onExportStrategies}>
                    <Download className="mr-2 h-4 w-4" />
                    Export All
                </Button>
                <Button onClick={onNewStrategy}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Strategy
                </Button>
            </div>
        </div>
    );
}
