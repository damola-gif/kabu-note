
import { useState } from 'react';
import { FeedHeader } from '@/components/feed/FeedHeader';
import { FeedContent } from '@/components/feed/FeedContent';
import { FeedSidebar } from '@/components/feed/FeedSidebar';

export default function Feed() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'liked' | 'following'>('latest');
  const [activeHashtag, setActiveHashtag] = useState<string>('');

  const handleHashtagSearch = (hashtag: string) => {
    setActiveHashtag(hashtag);
    setSearchTerm(''); // Clear regular search when hashtag is active
  };

  const handleClearHashtag = () => {
    setActiveHashtag('');
  };

  return (
    <div className="max-w-7xl mx-auto">
      <FeedHeader 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onHashtagSearch={handleHashtagSearch}
        activeHashtag={activeHashtag}
        onClearHashtag={handleClearHashtag}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <div className="lg:col-span-3">
          <FeedContent 
            searchTerm={searchTerm} 
            sortBy={sortBy} 
            activeHashtag={activeHashtag}
          />
        </div>
        <div className="lg:col-span-1">
          <FeedSidebar />
        </div>
      </div>
    </div>
  );
}
