
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, BookOpen } from 'lucide-react';

export function FeedSidebar() {
  // Mock data - in real app, these would come from API calls
  const trendingTags = ['#SPY', '#Bitcoin', '#Swing', '#Scalping', '#Options'];
  const topTraders = [
    { id: '1', username: 'traderpro', avatar: '', followers: 1234 },
    { id: '2', username: 'cryptoking', avatar: '', followers: 987 },
    { id: '3', username: 'swingmaster', avatar: '', followers: 756 },
  ];

  return (
    <div className="space-y-6">
      {/* Trending Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-sm">
            <TrendingUp className="mr-2 h-4 w-4" />
            Trending Tags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {trendingTags.map((tag) => (
            <Badge key={tag} variant="outline" className="mr-2 cursor-pointer hover:bg-accent">
              {tag}
            </Badge>
          ))}
        </CardContent>
      </Card>

      {/* Top Traders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-sm">
            <Users className="mr-2 h-4 w-4" />
            Top Traders This Week
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topTraders.map((trader) => (
            <div key={trader.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={trader.avatar} />
                  <AvatarFallback>{trader.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{trader.username}</p>
                  <p className="text-xs text-muted-foreground">{trader.followers} followers</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Follow</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* CTA Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-sm">
            <BookOpen className="mr-2 h-4 w-4" />
            Share Your Strategy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Share your trading insights with the community and build your following.
          </p>
          <Button className="w-full" size="sm">
            Create Strategy
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
