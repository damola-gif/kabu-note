
import { useState } from 'react';
import { FeedHeader } from '@/components/feed/FeedHeader';
import { FeedContent } from '@/components/feed/FeedContent';
import { FeedSidebar } from '@/components/feed/FeedSidebar';
import { CreatePostDialog } from '@/components/feed/CreatePostDialog';
import { PostCard } from '@/components/feed/PostCard';
import { usePosts } from '@/hooks/usePosts';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Feed() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'liked' | 'following'>('latest');
  const [activeHashtag, setActiveHashtag] = useState<string>('');

  const { data: posts, isLoading: postsLoading } = usePosts();

  const handleHashtagSearch = (hashtag: string) => {
    setActiveHashtag(hashtag);
    setSearchTerm(''); // Clear regular search when hashtag is active
  };

  const handleClearHashtag = () => {
    setActiveHashtag('');
  };

  const filteredPosts = posts?.filter(post => {
    // Apply hashtag filter if active
    if (activeHashtag) {
      return post.hashtags?.includes(activeHashtag);
    }
    
    // Apply search filter
    if (searchTerm) {
      return post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             post.hashtags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    
    return true;
  }) || [];

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
          <div className="mb-6">
            <CreatePostDialog />
          </div>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Content</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="strategies">Strategies</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-6 mt-6">
              {/* Show both posts and strategies mixed together */}
              {postsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <>
                  {filteredPosts.map((post) => (
                    <PostCard key={`post-${post.id}`} post={post} />
                  ))}
                  <FeedContent 
                    searchTerm={searchTerm} 
                    sortBy={sortBy} 
                    activeHashtag={activeHashtag}
                  />
                </>
              )}
            </TabsContent>
            
            <TabsContent value="posts" className="space-y-6 mt-6">
              {postsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {activeHashtag 
                    ? `No posts found with hashtag #${activeHashtag}`
                    : searchTerm 
                      ? `No posts found matching "${searchTerm}"`
                      : 'No posts yet. Be the first to create one!'
                  }
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="strategies" className="mt-6">
              <FeedContent 
                searchTerm={searchTerm} 
                sortBy={sortBy} 
                activeHashtag={activeHashtag}
              />
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="lg:col-span-1">
          <FeedSidebar />
        </div>
      </div>
    </div>
  );
}
