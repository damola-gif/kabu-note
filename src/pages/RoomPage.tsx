
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ChatInterface } from '@/components/rooms/ChatInterface';
import { useRoomDetails } from '@/hooks/useRooms';

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { data: room, isLoading, error } = useRoomDetails(roomId || '');

  if (!roomId) {
    return (
      <div className="p-4 text-center">
        <p>Invalid room ID.</p>
        <Button onClick={() => window.history.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const PageHeader = () => (
    <div className="flex items-center mb-4 flex-shrink-0">
      <Button
        variant="ghost"
        onClick={() => window.history.back()}
        className="mr-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Rooms
      </Button>
      {isLoading && <Loader2 className="h-6 w-6 animate-spin" />}
      {error && <h1 className="text-2xl font-bold text-destructive">Error loading room</h1>}
      {room && <h1 className="text-2xl font-bold">{room.name}</h1>}
    </div>
  );

  return (
    <div className="p-4 flex flex-col h-screen max-h-screen">
      <PageHeader />
      <div className="flex-grow min-h-0">
        <ChatInterface roomId={roomId} />
      </div>
    </div>
  );
}
