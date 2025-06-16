
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, User, FileText, Target } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { PostCard } from '@/components/feed/PostCard';

interface SearchResults {
  posts: any[];
  strategies: any[];
  users: any[];
}

export function AdvancedSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const navigate = useNavigate();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['advancedSearch', debouncedSearchTerm],
    queryFn: async (): Promise<SearchResults> => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
        return { posts: [], strategies: [], users: [] };
      }

      const searchPattern = `%${debouncedSearchTerm}%`;

      // Search posts
      const { data: posts } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url,
            full_name
          )
        `)
        .or(`content.ilike.${searchPattern},hashtags.cs.{${debouncedSearchTerm}}`)
        .order('created_at', { ascending: false })
        .limit(10);

      // Search strategies
      const { data: strategies } = await supabase
        .from('strategies')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url,
            full_name
          )
        `)
        .eq('is_public', true)
        .or(`name.ilike.${searchPattern},content_markdown.ilike.${searchPattern},tags.cs.{${debouncedSearchTerm}}`)
        .order('created_at', { ascending: false })
        .limit(10);

      // Search users
      const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.${searchPattern},full_name.ilike.${searchPattern}`)
        .limit(10);

      return {
        posts: posts || [],
        strategies: strategies || [],
        users: users || []
      };
    },
    enabled: debouncedSearchTerm.length >= 2,
  });

  const handleUserClick = (username: string) => {
    navigate(`/u/${username}`);
  };

  const handleStrategyClick = (strategyId: string) => {
    navigate(`/strategies/${strategyId}`);
  };

  const totalResults = (searchResults?.posts.length || 0) + 
                      (searchResults?.strategies.length || 0) + 
                      (searchResults?.users.length || 0);

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search across all content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 text-lg h-12"
        />
      </div>

      {debouncedSearchTerm.length >= 2 && (
        <div className="text-sm text-muted-foreground">
          {isLoading ? 'Searching...' : `Found ${totalResults} results for "${debouncedSearchTerm}"`}
        </div>
      )}

      {searchResults && totalResults > 0 && (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              All ({totalResults})
            </TabsTrigger>
            <TabsTrigger value="posts">
              Posts ({searchResults.posts.length})
            </TabsTrigger>
            <TabsTrigger value="strategies">
              Strategies ({searchResults.strategies.length})
            </TabsTrigger>
            <TabsTrigger value="users">
              Users ({searchResults.users.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {searchResults.users.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Users
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {searchResults.users.slice(0, 3).map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserClick(user.username)}
                      className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                    >
                      <Avatar>
                        <AvatarImage src={user.avatar_url || ''} />
                        <AvatarFallback>
                          {(user.full_name || user.username)?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.full_name || user.username}</p>
                        {user.full_name && (
                          <p className="text-sm text-muted-foreground">@{user.username}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {searchResults.strategies.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Strategies
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {searchResults.strategies.slice(0, 3).map((strategy) => (
                    <div
                      key={strategy.id}
                      onClick={() => handleStrategyClick(strategy.id)}
                      className="p-3 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                    >
                      <h4 className="font-medium mb-1">{strategy.name}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {strategy.content_markdown?.substring(0, 100)}...
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          by {strategy.profiles?.full_name || strategy.profiles?.username}
                        </span>
                        {strategy.win_rate && (
                          <Badge variant="secondary" className="text-xs">
                            {strategy.win_rate}% win rate
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {searchResults.posts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Posts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {searchResults.posts.slice(0, 2).map((post) => (
                    <div key={post.id} className="border rounded-lg">
                      <PostCard post={post} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="posts" className="space-y-4">
            {searchResults.posts.map((post) => (
              <div key={post.id} className="border rounded-lg">
                <PostCard post={post} />
              </div>
            ))}
          </TabsContent>

          <TabsContent value="strategies" className="space-y-4">
            {searchResults.strategies.map((strategy) => (
              <Card key={strategy.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleStrategyClick(strategy.id)}>
                <CardHeader>
                  <CardTitle className="text-lg">{strategy.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      by {strategy.profiles?.full_name || strategy.profiles?.username}
                    </span>
                    {strategy.win_rate && (
                      <Badge variant="secondary">
                        {strategy.win_rate}% win rate
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3">
                    {strategy.content_markdown}
                  </p>
                  {strategy.tags && strategy.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {strategy.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="grid gap-4">
              {searchResults.users.map((user) => (
                <Card key={user.id} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleUserClick(user.username)}>
                  <CardContent className="flex items-center gap-4 p-6">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={user.avatar_url || ''} />
                      <AvatarFallback className="text-lg">
                        {(user.full_name || user.username)?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{user.full_name || user.username}</h3>
                      {user.full_name && (
                        <p className="text-muted-foreground">@{user.username}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {debouncedSearchTerm.length >= 2 && totalResults === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-8">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or browse our content
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
