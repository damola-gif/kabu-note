
import { useState, useMemo } from 'react';
import { useStrategies, useDeleteStrategy, useForkStrategy, useLikedStrategyIds, useToggleLike, useBookmarkedStrategyIds, useToggleBookmark } from '@/hooks/useStrategies';
import { Button } from '@/components/ui/button';
import { StrategyEditorDialog } from '@/components/strategy/StrategyEditorDialog';
import { PlusCircle, Loader2, Upload, Download } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { DateRange } from 'react-day-picker';
import { StrategyFilters } from '@/components/strategy/StrategyFilters';
import { useSession } from '@/contexts/SessionProvider';
import { useFollowing, useFollowUser, useUnfollowUser } from '@/hooks/useProfile';
import { StrategyGrid } from '@/components/strategy/StrategyGrid';
import { DeleteStrategyDialog } from '@/components/strategy/DeleteStrategyDialog';
import { ImportStrategyDialog } from '@/components/strategy/ImportStrategyDialog';
import { ExportStrategiesDialog } from '@/components/strategy/ExportStrategiesDialog';

export default function Strategies() {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [selectedStrategy, setSelectedStrategy] = useState<Tables<'strategies'> | undefined>();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [winRateRange, setWinRateRange] = useState<[number, number]>([0, 100]);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [authorFilter, setAuthorFilter] = useState("all");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = useStrategies();
    const { data: likedStrategyIds } = useLikedStrategyIds();
    const { data: bookmarkedStrategyIds } = useBookmarkedStrategyIds();
    const toggleLikeMutation = useToggleLike();
    const toggleBookmarkMutation = useToggleBookmark();

    const { user } = useSession();
    const { data: followingIds, isLoading: isLoadingFollowing } = useFollowing();
    const deleteMutation = useDeleteStrategy();
    const forkMutation = useForkStrategy();
    const followMutation = useFollowUser();
    const unfollowMutation = useUnfollowUser();

    const allStrategies = useMemo(() => data?.pages.flat() ?? [], [data]);

    const handleNewStrategy = () => {
        setSelectedStrategy(undefined);
        setIsEditorOpen(true);
    };

    const handleImportStrategy = () => {
        setIsImportDialogOpen(true);
    };

    const handleExportStrategies = () => {
        setIsExportDialogOpen(true);
    };

    const handleEdit = (strategy: Tables<'strategies'>) => {
        setSelectedStrategy(strategy);
        setIsEditorOpen(true);
    };
    
    const handleDelete = (strategy: Tables<'strategies'>) => {
        setSelectedStrategy(strategy);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedStrategy) return;
        deleteMutation.mutate(selectedStrategy.id, {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                setSelectedStrategy(undefined);
            }
        });
    };

    const handleFork = (strategy: Tables<'strategies'>) => {
        forkMutation.mutate(strategy);
    };

    const handleFollowToggle = (profileId: string, isCurrentlyFollowing: boolean) => {
        if (unfollowMutation.isPending || followMutation.isPending) return;
        if (isCurrentlyFollowing) {
            unfollowMutation.mutate(profileId);
        } else {
            followMutation.mutate(profileId);
        }
    };
    
    const handleLikeToggle = (strategyId: string, isLiked: boolean) => {
        toggleLikeMutation.mutate({ strategyId, isLiked });
    };

    const handleBookmarkToggle = (strategyId: string, isBookmarked: boolean) => {
        toggleBookmarkMutation.mutate({ strategyId, isBookmarked });
    };

    const filteredStrategies = useMemo(() => allStrategies.filter((strategy) => {
        // Search term match
        const searchMatch = searchTerm === "" || 
            strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (strategy.content_markdown && strategy.content_markdown.toLowerCase().includes(searchTerm.toLowerCase()));

        const winRate = (strategy.win_rate ?? 0) as number;
        const winRateMatch = winRate >= winRateRange[0] && winRate <= winRateRange[1];

        const createdAt = strategy.created_at ? new Date(strategy.created_at) : null;
        let dateMatch = true;

        if (dateRange && createdAt) {
            if (dateRange.from && createdAt < dateRange.from) {
                dateMatch = false;
            }
            if (dateRange.to && dateMatch) {
                const toDate = new Date(dateRange.to);
                toDate.setHours(23, 59, 59, 999);
                if (createdAt > toDate) {
                    dateMatch = false;
                }
            }
        } else if (dateRange && (dateRange.from || dateRange.to)) {
            dateMatch = false;
        }

        let authorMatch = true;
        if (authorFilter === 'me') {
            authorMatch = strategy.user_id === user?.id;
        } else if (authorFilter === 'following') {
            if (isLoadingFollowing || !followingIds) {
                return searchMatch && winRateMatch && dateMatch;
            }
            authorMatch = !!strategy.profile?.id && followingIds.includes(strategy.profile.id);
        }

        // Tag filtering
        const tagMatch = selectedTags.length === 0 || 
            (strategy.tags && selectedTags.some(tag => strategy.tags?.includes(tag)));

        return searchMatch && winRateMatch && dateMatch && authorMatch && tagMatch;
    }), [allStrategies, searchTerm, winRateRange, dateRange, authorFilter, selectedTags, user?.id, followingIds, isLoadingFollowing]);

    const isFiltering = searchTerm !== "" || winRateRange[0] !== 0 || winRateRange[1] !== 100 || dateRange !== undefined || authorFilter !== "all" || selectedTags.length > 0;

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold">KabuName Strategy Library</h1>
                    <p className="text-muted-foreground">Browse and manage your collection of trading strategies.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleImportStrategy}>
                        <Upload className="mr-2 h-4 w-4" />
                        Import Strategy
                    </Button>
                    <Button variant="outline" onClick={handleExportStrategies}>
                        <Download className="mr-2 h-4 w-4" />
                        Export All
                    </Button>
                    <Button onClick={handleNewStrategy}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Strategy
                    </Button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <aside className="md:col-span-1">
                   <div className="sticky top-4">
                     <h2 className="text-lg font-semibold mb-4">Filters</h2>
                     <StrategyFilters
                        searchTerm={searchTerm}
                        onSearchTermChange={setSearchTerm}
                        winRateRange={winRateRange}
                        onWinRateChange={setWinRateRange}
                        dateRange={dateRange}
                        onDateChange={setDateRange}
                        authorFilter={authorFilter}
                        onAuthorFilterChange={setAuthorFilter}
                        selectedTags={selectedTags}
                        onTagsChange={setSelectedTags}
                     />
                   </div>
                </aside>

                <main className="md:col-span-3">
                    <StrategyGrid 
                        strategies={filteredStrategies}
                        isLoading={isLoading}
                        error={error}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onFork={handleFork}
                        handleNewStrategy={handleNewStrategy}
                        followingIds={followingIds}
                        isLoadingFollowing={isLoadingFollowing}
                        forkMutation={forkMutation}
                        followMutation={followMutation}
                        unfollowMutation={unfollowMutation}
                        onFollowToggle={handleFollowToggle}
                        isFiltering={isFiltering}
                        likedStrategyIds={likedStrategyIds}
                        onLikeToggle={handleLikeToggle}
                        bookmarkedStrategyIds={bookmarkedStrategyIds}
                        onBookmarkToggle={handleBookmarkToggle}
                    />
                    {hasNextPage && !isFiltering && (
                        <div className="mt-6 text-center">
                            <Button
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
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
                </main>
            </div>

            <StrategyEditorDialog 
                open={isEditorOpen} 
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedStrategy(undefined);
                    }
                    setIsEditorOpen(open);
                }}
                strategy={selectedStrategy}
            />
            
            <DeleteStrategyDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={confirmDelete}
                isPending={deleteMutation.isPending}
                strategyName={selectedStrategy?.name}
            />

            <ImportStrategyDialog
                open={isImportDialogOpen}
                onOpenChange={setIsImportDialogOpen}
            />

            <ExportStrategiesDialog
                open={isExportDialogOpen}
                onOpenChange={setIsExportDialogOpen}
                strategies={allStrategies}
            />
        </div>
    );
};
