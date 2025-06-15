
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Hash, X } from 'lucide-react';
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
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleHashtagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hashtagInput.trim() && onHashtagSearch) {
      const cleanHashtag = hashtagInput.replace('#', '').trim();
      onHashtagSearch(cleanHashtag);
      setHashtagInput('');
    }
  };

  return (
    <div className="space-y-3">
      {/* Main Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search posts and strategies..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 border-border bg-background/50 focus:bg-background"
        />
      </div>

      {/* Active Hashtag Filter */}
      {activeHashtag && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1 px-3 py-1">
            #{activeHashtag}
            {onClearHashtag && (
              <button
                onClick={onClearHashtag}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        </div>
      )}

      {/* Advanced Options Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {showAdvanced ? 'Hide' : 'Show'} filters
        </button>
      </div>

      {/* Advanced Search Options */}
      {showAdvanced && (
        <div className="space-y-3 p-3 bg-muted/30 rounded-lg border border-border">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Hashtag Search */}
            <form onSubmit={handleHashtagSubmit} className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search hashtags..."
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" variant="outline" size="default">
                Search
              </Button>
            </form>

            {/* Sort Options */}
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-full sm:w-48">
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
        </div>
      )}
    </div>
  );
}
