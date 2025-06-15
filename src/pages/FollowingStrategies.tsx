
import { useFollowingStrategies, StrategyWithProfile } from '@/hooks/useStrategies';
import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { VotingStrategyGrid } from '@/components/strategy/voting/VotingStrategyGrid';
import { Button } from '@/components/ui/button';

export default function FollowingStrategies() {
    const { 
        data, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage, 
        isLoading, 
        error 
    } = useFollowingStrategies();
    
    const strategies = useMemo(() => data?.pages.flat() as StrategyWithProfile[] ?? [], [data]);

    return (
        <div className="w-full px-2 sm:px-4">
            <header className="py-4 border-b mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Strategy Voting</h1>
                <p className="text-muted-foreground mt-1">
                    Vote on these strategies from traders you follow. Your vote helps decide if they get published.
                </p>
            </header>
            <main>
                <VotingStrategyGrid
                    strategies={strategies}
                    isLoading={isLoading}
                    error={error}
                />
                {hasNextPage && (
                    <div className="flex justify-center mt-6">
                        <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                            {isFetchingNextPage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Load More'}
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}
