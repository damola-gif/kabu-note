
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

  const { data: posts, isLoading: postsLoading, refetch } = usePosts();

  const handleHashtagSearch = (hashtag: string) => {
    setActiveHashtag(hashtag);
    setSearchTerm('');
  };

  const handleClearHashtag = () => {
    setActiveHashtag('');
  };

  const filteredPosts = posts?.filter(post => {
    if (activeHashtag) {
      return post.hashtags?.includes(activeHashtag);
    }
    
    if (searchTerm) {
      return post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             post.hashtags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    
    return true;
  }) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Main Feed Column */}
          <div className="lg:col-span-7 border-x border-border">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
              <div className="px-4 py-3">
                <h1 className="text-xl font-bold">Home</h1>
              </div>
              <div className="px-4 pb-3">
                <FeedHeader 
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  onHashtagSearch={handleHashtagSearch}
                  activeHashtag={activeHashtag}
                  onClearHashtag={handleClearHashtag}
                />
              </div>
            </div>
            
            {/* Create Post Section */}
            <div className="border-b border-border p-4">
              <CreatePostDialog />
            </div>
            
            {/* Feed Tabs */}
            <Tabs defaultValue="all" className="w-full">
              <div className="border-b border-border">
                <TabsList className="grid w-full grid-cols-3 bg-transparent h-auto p-0 rounded-none">
                  <TabsTrigger 
                    value="all" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4"
                  >
                    For you
                  </TabsTrigger>
                  <TabsTrigger 
                    value="posts" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4"
                  >
                    Posts
                  </TabsTrigger>
                  <TabsTrigger 
                    value="strategies" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4"
                  >
                    Strategies
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="all" className="mt-0">
                {postsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div>
                    {filteredPosts.map((post) => (
                      <PostCard key={`post-${post.id}`} post={post} />
                    ))}
                    <FeedContent 
                      searchTerm={searchTerm} 
                      sortBy={sortBy} 
                      activeHashtag={activeHashtag}
                    />
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="posts" className="mt-0">
                {postsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="text-center py-12 px-8">
                    <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                    <p className="text-muted-foreground mb-4">
                      {activeHashtag 
                        ? `No posts found with hashtag #${activeHashtag}`
                        : searchTerm 
                          ? `No posts found matching "${searchTerm}"`
                          : 'Be the first to create a post!'
                      }
                    </p>
                  </div>
                ) : (
                  <div>
                    {filteredPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="strategies" className="mt-0">
                <FeedContent 
                  searchTerm={searchTerm} 
                  sortBy={sortBy} 
                  activeHashtag={activeHashtag}
                />
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right Sidebar */}
          <div className="lg:col-span-5 pl-8 pr-4 py-4">
            <FeedSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
