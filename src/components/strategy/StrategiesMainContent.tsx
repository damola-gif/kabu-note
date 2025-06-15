
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { StrategyGrid } from './StrategyGrid';
import { StrategyWithProfile } from '@/hooks/useStrategies';
import { Tables } from '@/integrations/supabase/types';
import { UseMutationResult } from '@tanstack/react-query';

interface StrategiesMainContentProps {
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
    hasNextPage?: boolean;
    isFetchingNextPage: boolean;
    onFetchNextPage: () => void;
}

export function StrategiesMainContent({
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
    onBookmarkToggle,
    hasNextPage,
    isFetchingNextPage,
    onFetchNextPage
}: StrategiesMainContentProps) {
    return (
        <div className="w-full">
            <StrategyGrid 
                strategies={strategies}
                isLoading={isLoading}
                error={error}
                onEdit={onEdit}
                onDelete={onDelete}
                onFork={onFork}
                handleNewStrategy={handleNewStrategy}
                followingIds={followingIds}
                isLoadingFollowing={isLoadingFollowing}
                forkMutation={forkMutation}
                followMutation={followMutation}
                unfollowMutation={unfollowMutation}
                onFollowToggle={onFollowToggle}
                isFiltering={isFiltering}
                likedStrategyIds={likedStrategyIds}
                onLikeToggle={onLikeToggle}
                bookmarkedStrategyIds={bookmarkedStrategyIds}
                onBookmarkToggle={onBookmarkToggle}
            />
            {hasNextPage && !isFiltering && (
                <div className="mt-6 text-center">
                    <Button
                        onClick={onFetchNextPage}
                        disabled={isFetchingNextPage}
                        className="w-full sm:w-auto"
                    >
                        {isFetchingNextPage ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            'Load More'
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
