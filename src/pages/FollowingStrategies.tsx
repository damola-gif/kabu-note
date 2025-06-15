
import { useFollowingStrategies, useLikedStrategyIds, useBookmarkedStrategyIds, StrategyWithProfile } from '@/hooks/useStrategies';
import { useFollowing } from '@/hooks/useProfile';
import { useStrategyActions } from '@/hooks/useStrategyActions';
import { StrategiesMainContent } from '@/components/strategy/StrategiesMainContent';
import { useMemo } from 'react';
import { Loader2, ShieldQuestion } from 'lucide-react';

export default function FollowingStrategies() {
    const { 
        data, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage, 
        isLoading, 
        error 
    } = useFollowingStrategies();
    
    const { data: likedStrategyIds } = useLikedStrategyIds();
    const { data: bookmarkedStrategyIds } = useBookmarkedStrategyIds();
    const { data: followingIds, isLoading: isLoadingFollowing } = useFollowing();

    const {
        handleFork,
        handleFollowToggle,
        handleLikeToggle,
        handleBookmarkToggle,
        forkMutation,
        followMutation,
        unfollowMutation,
    } = useStrategyActions();

    const strategies = useMemo(() => data?.pages.flat() ?? [], [data]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            <StrategiesMainContent
                strategies={strategies as StrategyWithProfile[]}
                isLoading={isLoading}
                error={error}
                onEdit={() => {}}
                onDelete={() => {}}
                onFork={handleFork}
                handleNewStrategy={() => {}}
                followingIds={followingIds}
                isLoadingFollowing={isLoadingFollowing}
                forkMutation={forkMutation}
                followMutation={followMutation}
                unfollowMutation={unfollowMutation}
                onFollowToggle={handleFollowToggle}
                isFiltering={false}
                likedStrategyIds={likedStrategyIds}
                onLikeToggle={handleLikeToggle}
                bookmarkedStrategyIds={bookmarkedStrategyIds}
                onBookmarkToggle={handleBookmarkToggle}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                onFetchNextPage={() => fetchNextPage()}
            />
        );
    }
    
    return (
        <div className="w-full px-2 sm:px-4">
            <header className="py-4 border-b mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Pending Strategies</h1>
                <p className="text-muted-foreground mt-1">
                    Vote on these strategies from traders you follow. Your vote helps decide if they get published.
                </p>
            </header>
            <main>
                {renderContent()}
            </main>
        </div>
    );
}
