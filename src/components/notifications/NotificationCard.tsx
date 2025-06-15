
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MessageSquare, User, CheckCircle, XCircle, Bell } from 'lucide-react';
import { Notification } from '@/hooks/useNotifications';
import { useMarkNotificationAsRead } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';

interface NotificationCardProps {
  notification: Notification;
}

export function NotificationCard({ notification }: NotificationCardProps) {
  const markAsRead = useMarkNotificationAsRead();
  const navigate = useNavigate();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'follow':
        return <User className="h-4 w-4 text-green-500" />;
      case 'strategy_approval':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'strategy_rejection':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleClick = async () => {
    if (!notification.is_read) {
      markAsRead.mutate(notification.id);
    }

    // Navigate to related content
    if (notification.related_strategy_id) {
      navigate(`/strategies/${notification.related_strategy_id}`);
    } else if (notification.related_user_id && notification.profiles?.username) {
      navigate(`/u/${notification.profiles.username}`);
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
        !notification.is_read ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''
      }`}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {notification.profiles?.avatar_url ? (
              <Avatar className="h-10 w-10">
                <AvatarImage src={notification.profiles.avatar_url} />
                <AvatarFallback>
                  {notification.profiles.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                {getNotificationIcon(notification.type)}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground">
                {notification.title}
              </h4>
              {!notification.is_read && (
                <Badge variant="default" className="ml-2 h-2 w-2 p-0 rounded-full" />
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mt-1">
              {notification.message}
            </p>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </span>
              {!notification.is_read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead.mutate(notification.id);
                  }}
                  className="h-6 px-2 text-xs"
                >
                  Mark as read
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
