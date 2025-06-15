
import { useMemo } from 'react';
import { useStrategies, useLikedStrategyIds, useBookmarkedStrategyIds } from '@/hooks/useStrategies';
import { StrategyEditorDialog } from '@/components/strategy/StrategyEditorDialog';
import { useFollowing } from '@/hooks/useProfile';
import { DeleteStrategyDialog } from '@/components/strategy/DeleteStrategyDialog';
import { ImportStrategyDialog } from '@/components/strategy/ImportStrategyDialog';
import { ExportStrategiesDialog } from '@/components/strategy/ExportStrategiesDialog';
import { StrategiesHeader } from '@/components/strategy/StrategiesHeader';
import { StrategiesSidebar } from '@/components/strategy/StrategiesSidebar';
import { StrategiesMainContent } from '@/components/strategy/StrategiesMainContent';
import { useStrategyFilters } from '@/hooks/useStrategyFilters';
import { useStrategyActions } from '@/hooks/useStrategyActions';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function Strategies() {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = useStrategies();
    const { data: likedStrategyIds } = useLikedStrategyIds();
    const { data: bookmarkedStrategyIds } = useBookmarkedStrategyIds();
    const { data: followingIds, isLoading: isLoadingFollowing } = useFollowing();
    const [filtersOpen, setFiltersOpen] = useState(false);

    const allStrategies = useMemo(() => data?.pages.flat() ?? [], [data]);

    const {
        searchTerm,
        setSearchTerm,
        winRateRange,
        setWinRateRange,
        dateRange,
        setDateRange,
        authorFilter,
        setAuthorFilter,
        selectedTags,
        setSelectedTags,
        filteredStrategies,
        isFiltering
    } = useStrategyFilters(allStrategies, followingIds, isLoadingFollowing);

    const {
        selectedStrategy,
        setSelectedStrategy,
        isEditorOpen,
        setIsEditorOpen,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        isImportDialogOpen,
        setIsImportDialogOpen,
        isExportDialogOpen,
        setIsExportDialogOpen,
        deleteMutation,
        forkMutation,
        followMutation,
        unfollowMutation,
        handleNewStrategy,
        handleImportStrategy,
        handleExportStrategies,
        handleEdit,
        handleDelete,
        confirmDelete,
        handleFork,
        handleFollowToggle,
        handleLikeToggle,
        handleBookmarkToggle
    } = useStrategyActions();

    return (
        <div className="w-full px-2 sm:px-4">
            <StrategiesHeader
                onNewStrategy={handleNewStrategy}
                onImportStrategy={handleImportStrategy}
                onExportStrategies={handleExportStrategies}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
                {/* Mobile Filter Button */}
                <div className="lg:hidden mb-4">
                    <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="w-full">
                                <Filter className="h-4 w-4 mr-2" />
                                Filters
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-80">
                            <div className="mt-6">
                                <StrategiesSidebar
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
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Desktop Sidebar */}
                <div className="hidden lg:block lg:col-span-1">
                    <StrategiesSidebar
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

                {/* Main Content */}
                <div className="lg:col-span-3">
                    <StrategiesMainContent
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
                        hasNextPage={hasNextPage}
                        isFetchingNextPage={isFetchingNextPage}
                        onFetchNextPage={() => fetchNextPage()}
                    />
                </div>
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
}
