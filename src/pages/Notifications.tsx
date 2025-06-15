
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
  
  const { data: notifications, isLoading, refetch, error } = useNotifications();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const navigate = useNavigate();
  
  // Enable real-time updates
  useNotificationRealtime();

  console.log('Notifications component - data:', notifications, 'loading:', isLoading, 'error:', error);

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

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 px-2 sm:px-4">
        <div className="text-center py-8">
          <h1 className="text-xl sm:text-2xl font-bold mb-4">Notifications</h1>
          <p className="text-red-600 mb-4">Error loading notifications: {error.message}</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 px-2 sm:px-4">
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 px-2 sm:px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
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
              <span className="hidden sm:inline">Mark all read</span>
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/settings')}
            className="flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search notifications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="w-full overflow-x-auto">
        <Tabs value={filterType} onValueChange={setFilterType}>
          <TabsList className="inline-flex h-9 min-w-full sm:min-w-0">
            <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
            {notificationTypes.slice(0, 4).map(type => (
              <TabsTrigger key={type} value={type} className="text-xs sm:text-sm">
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
            <div className="text-muted-foreground text-sm">
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
