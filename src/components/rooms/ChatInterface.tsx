
import { useRoomMessages } from '@/hooks/useRoomMessages';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Loader2 } from 'lucide-react';

interface ChatInterfaceProps {
  roomId: string;
}

export const ChatInterface = ({ roomId }: ChatInterfaceProps) => {
  const { data: messages, isLoading, error } = useRoomMessages(roomId);

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading messages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex justify-center items-center text-destructive h-full">
        <p>Error loading messages: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-background">
      {messages && messages.length > 0 ? (
        <MessageList messages={messages} />
      ) : (
        <div className="flex-1 flex justify-center items-center">
            <p className="text-muted-foreground">No messages yet. Be the first to say something!</p>
        </div>
      )}
      <MessageInput roomId={roomId} />
    </div>
  );
};
