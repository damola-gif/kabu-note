
import { RoomMessage } from '@/hooks/useRoomMessages';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useSession } from '@/contexts/SessionProvider';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useRef } from 'react';

interface MessageListProps {
  messages: RoomMessage[];
}

export const MessageList = ({ messages }: MessageListProps) => {
  const { user } = useSession();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isOwnMessage = message.user_id === user?.id;
        return (
          <div
            key={message.id}
            className={cn('flex items-start gap-3', isOwnMessage && 'flex-row-reverse')}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={message.profiles?.avatar_url || ''} />
              <AvatarFallback>{message.profiles?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className={cn('flex flex-col max-w-[70%]', isOwnMessage && 'items-end')}>
              <div className={cn('p-3 rounded-lg', isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                {!isOwnMessage && (
                  <p className="text-xs font-semibold mb-1">{message.profiles?.username || 'Unknown User'}</p>
                )}
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              <span className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
