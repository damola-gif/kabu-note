
import { StrategyWithProfile } from '@/hooks/useStrategies';
import { VotingStrategyCard } from './VotingStrategyCard';
import { ShieldQuestion } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

interface VotingStrategyGridProps {
    strategies: StrategyWithProfile[];
    isLoading: boolean;
    error: Error | null;
}

export function VotingStrategyGrid({ strategies, isLoading, error }: VotingStrategyGridProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-8 w-full mt-4" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }
    
    if (error) {
        return <p className="text-center text-destructive">Error loading strategies: {error.message}</p>;
    }

    if (strategies.length === 0) {
        return (
            <div className="text-center py-10 border-2 border-dashed rounded-lg flex flex-col items-center">
                <ShieldQuestion className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold">No Strategies to Vote On</h2>
                <p className="text-muted-foreground mt-2 max-w-md">
                    When a trader you follow submits a new strategy, it will appear here for you to vote on before it becomes public.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {strategies.map(strategy => (
                <VotingStrategyCard key={strategy.id} strategy={strategy} />
            ))}
        </div>
    );
}
