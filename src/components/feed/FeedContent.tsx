import { useInfiniteQuery } from '@tanstack/react-query';
import { usePublicStrategies, useStrategies, useHashtagSearch } from '@/hooks/useStrategies';
import { FeedCard } from './FeedCard';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface FeedContentProps {
  searchTerm: string;
  sortBy: 'latest' | 'trending' | 'liked' | 'following';
  activeHashtag?: string;
}

export function FeedContent({ searchTerm, sortBy, activeHashtag }: FeedContentProps) {
  // Use public strategies for the feed strategies tab
  const { data: publicData, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading: isPublicLoading } = usePublicStrategies();
  const { data: userData, ...userStrategyRest } = useStrategies();
  const { data: hashtagResults, isLoading: isHashtagLoading } = useHashtagSearch(activeHashtag || '');

  let strategies: any[] = [];
  let isLoading = false;

  // In “Strategies” feed tab, use public strategies
  if (activeHashtag) {
    strategies = hashtagResults || [];
    isLoading = isHashtagLoading;
  } else {
    strategies = publicData?.pages.flatMap(page => page) || [];
    isLoading = isPublicLoading;
  }

  // Apply search filter if there's a search term
  if (searchTerm && !activeHashtag) {
    strategies = strategies.filter(strategy => 
      strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (strategy.content_markdown && strategy.content_markdown.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (strategies.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {activeHashtag 
          ? `No strategies found with hashtag #${activeHashtag}`
          : searchTerm 
            ? `No strategies found matching "${searchTerm}"`
            : 'No strategies found'
        }
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {strategies.map((strategy) => (
        <FeedCard key={strategy.id} strategy={strategy} />
      ))}
      
      {!activeHashtag && hasNextPage && (
        <div className="flex justify-center py-4">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
