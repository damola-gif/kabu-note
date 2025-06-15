
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import { 
  useNotifications, 
  useMarkAllNotificationsAsRead,
  useNotificationRealtime 
} from '@/hooks/useNotifications';
import { Search, CheckCheck, Settings, RefreshCw } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Notifications() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  
  const { data: notifications, isLoading, refetch } = useNotifications();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const navigate = useNavigate();
  
  // Enable real-time updates
  useNotificationRealtime();

  const filteredNotifications = notifications?.filter(notification => {
    const matchesSearch = searchTerm === '' || 
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.profiles?.username?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || notification.type === filterType;
    
    return matchesSearch && matchesType;
  }) || [];

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;
  const notificationTypes = [...new Set(notifications?.map(n => n.type) || [])];

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'like': return 'Likes';
      case 'comment': return 'Comments';
      case 'follow': return 'Follows';
      case 'strategy_approval': return 'Approvals';
      case 'strategy_rejection': return 'Rejections';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
              className="flex items-center space-x-2"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Mark all read</span>
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/settings')}
            className="flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Tabs value={filterType} onValueChange={setFilterType} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            {notificationTypes.slice(0, 5).map(type => (
              <TabsTrigger key={type} value={type}>
                {getTypeDisplayName(type)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              {searchTerm || filterType !== 'all' 
                ? 'No notifications found matching your criteria.'
                : 'No notifications yet. Activity will appear here when other users interact with your content.'
              }
            </div>
          </div>
        ) : (
          <>
            {/* Unread notifications first */}
            {filteredNotifications
              .filter(notification => !notification.is_read)
              .map((notification) => (
                <NotificationCard 
                  key={notification.id} 
                  notification={notification} 
                />
              ))}
            
            {/* Read notifications */}
            {filteredNotifications
              .filter(notification => notification.is_read)
              .map((notification) => (
                <NotificationCard 
                  key={notification.id} 
                  notification={notification} 
                />
              ))}
          </>
        )}
      </div>
    </div>
  );
}
