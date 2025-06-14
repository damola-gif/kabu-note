
import { useState } from 'react';
import { useStrategies } from '@/hooks/useStrategies';
import { Button } from '@/components/ui/button';
import { StrategyEditorDialog } from '@/components/strategy/StrategyEditorDialog';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Strategies() {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const { data: strategies, isLoading, error } = useStrategies();

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            );
        }

        if (error) {
            return <p className="text-destructive">Error loading strategies: {error.message}</p>;
        }

        if (!strategies || strategies.length === 0) {
            return (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <h2 className="text-xl font-semibold">No Strategies Yet</h2>
                    <p className="text-muted-foreground mt-2">Click the button to create your first trading strategy.</p>
                    <Button className="mt-4" onClick={() => setIsEditorOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Strategy
                    </Button>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {strategies.map((strategy) => (
                    <Card key={strategy.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="truncate">{strategy.name}</CardTitle>
                            <CardDescription>
                                {strategy.is_public ? <Badge>Public</Badge> : <Badge variant="secondary">Draft</Badge>}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-muted-foreground line-clamp-3">
                                {strategy.content_markdown?.substring(0, 150) || "No content."}
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button asChild variant="outline" className="w-full">
                                <Link to={`/strategies/${strategy.id}`}>View Strategy</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">My Strategies</h1>
                    <p className="text-muted-foreground">Your collection of authored trading strategies.</p>
                </div>
                <Button onClick={() => setIsEditorOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Strategy
                </Button>
            </div>
            
            {renderContent()}

            <StrategyEditorDialog open={isEditorOpen} onOpenChange={setIsEditorOpen} />
        </div>
    );
};
