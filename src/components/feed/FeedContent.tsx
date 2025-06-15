
import { useInfiniteQuery } from '@tanstack/react-query';
import { useStrategies } from '@/hooks/useStrategies';
import { FeedCard } from './FeedCard';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface FeedContentProps {
  searchTerm: string;
  sortBy: 'latest' | 'trending' | 'liked' | 'following';
}

export function FeedContent({ searchTerm, sortBy }: FeedContentProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useStrategies();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const strategies = data?.pages.flatMap(page => page) || [];

  return (
    <div className="space-y-6">
      {strategies.map((strategy) => (
        <FeedCard key={strategy.id} strategy={strategy} />
      ))}
      
      {hasNextPage && (
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
