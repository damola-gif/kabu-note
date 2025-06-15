
import { StrategyWithProfile } from '@/hooks/useStrategies';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StrategyCard } from './StrategyCard';
import { Tables } from '@/integrations/supabase/types';
import { UseMutationResult } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { PlusCircle } from 'lucide-react';
import { useSession } from '@/contexts/SessionProvider';

interface StrategyGridProps {
    strategies: StrategyWithProfile[];
    isLoading: boolean;
    error: Error | null;
    onEdit: (strategy: Tables<'strategies'>) => void;
    onDelete: (strategy: Tables<'strategies'>) => void;
    onFork: (strategy: Tables<'strategies'>) => void;
    handleNewStrategy: () => void;
    followingIds?: string[];
    isLoadingFollowing: boolean;
    forkMutation: UseMutationResult<any, Error, Tables<'strategies'>, unknown>;
    followMutation: UseMutationResult<void, Error, string, unknown>;
    unfollowMutation: UseMutationResult<void, Error, string, unknown>;
    onFollowToggle: (profileId: string, isCurrentlyFollowing: boolean) => void;
    isFiltering: boolean;
    likedStrategyIds?: string[];
    onLikeToggle: (strategyId: string, isLiked: boolean) => void;
    bookmarkedStrategyIds?: string[];
    onBookmarkToggle: (strategyId: string, isBookmarked: boolean) => void;
}

export function StrategyGrid({
    strategies,
    isLoading,
    error,
    onEdit,
    onDelete,
    onFork,
    handleNewStrategy,
    followingIds,
    isLoadingFollowing,
    forkMutation,
    followMutation,
    unfollowMutation,
    onFollowToggle,
    isFiltering,
    likedStrategyIds,
    onLikeToggle,
    bookmarkedStrategyIds,
    onBookmarkToggle
}: StrategyGridProps) {
    const { user } = useSession();

    if (isLoading && strategies.length === 0) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-8 w-full mt-4" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return <p className="text-destructive">Error loading strategies: {error.message}</p>;
    }
    
    if (strategies.length === 0) {
        if (isFiltering) {
            return (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <h2 className="text-lg sm:text-xl font-semibold">No Strategies Found</h2>
                    <p className="text-muted-foreground mt-2 text-sm">
                        Try adjusting your search or filter criteria.
                    </p>
                </div>
            );
        }
        return (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <h2 className="text-lg sm:text-xl font-semibold">No Strategies Yet</h2>
                <p className="text-muted-foreground mt-2 text-sm">Click the button to create your first trading strategy.</p>
                <Button className="mt-4" onClick={handleNewStrategy}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Strategy
                </Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {strategies.map((strategy) => {
                const isOwnStrategy = strategy.user_id === user?.id;
                const canFollow = !isOwnStrategy && !!strategy.profile?.id;
                const isFollowing = !!(canFollow && followingIds?.includes(strategy.profile!.id));
                const isLiked = !!likedStrategyIds?.includes(strategy.id);
                const isBookmarked = !!bookmarkedStrategyIds?.includes(strategy.id);

                return (
                    <StrategyCard
                        key={strategy.id}
                        strategy={strategy}
                        isOwnStrategy={isOwnStrategy}
                        canFollow={canFollow}
                        isFollowing={isFollowing}
                        isLiked={isLiked}
                        isBookmarked={isBookmarked}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onFork={onFork}
                        onFollowToggle={onFollowToggle}
                        onLikeToggle={onLikeToggle}
                        onBookmarkToggle={onBookmarkToggle}
                        forkMutation={forkMutation}
                        followMutation={followMutation}
                        unfollowMutation={unfollowMutation}
                    />
                )
            })}
        </div>
    );
}
