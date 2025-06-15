
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Hash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FeedHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: 'latest' | 'trending' | 'liked' | 'following';
  onSortChange: (value: 'latest' | 'trending' | 'liked' | 'following') => void;
  onHashtagSearch?: (hashtag: string) => void;
  activeHashtag?: string;
  onClearHashtag?: () => void;
}

export function FeedHeader({ 
  searchTerm, 
  onSearchChange, 
  sortBy, 
  onSortChange,
  onHashtagSearch,
  activeHashtag,
  onClearHashtag
}: FeedHeaderProps) {
  const [hashtagInput, setHashtagInput] = useState('');

  const handleHashtagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hashtagInput.trim() && onHashtagSearch) {
      const cleanHashtag = hashtagInput.replace('#', '').trim();
      onHashtagSearch(cleanHashtag);
      setHashtagInput('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Main Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search strategies..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Hashtag Search */}
        <form onSubmit={handleHashtagSubmit} className="flex gap-2">
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search hashtags..."
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              className="pl-10 w-48"
            />
          </div>
          <Button type="submit" variant="outline" size="default">
            Search
          </Button>
        </form>

        {/* Sort Options */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="trending">Trending</SelectItem>
            <SelectItem value="liked">Most Liked</SelectItem>
            <SelectItem value="following">Following</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Hashtag Filter */}
      {activeHashtag && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtering by hashtag:</span>
          <Badge variant="secondary" className="gap-1">
            #{activeHashtag}
            {onClearHashtag && (
              <button
                onClick={onClearHashtag}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            )}
          </Badge>
        </div>
      )}
    </div>
  );
}
