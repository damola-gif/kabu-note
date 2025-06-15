
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function RoomPage() {
  const { roomId } = useParams();

  return (
    <div className="p-4">
      <Button
        variant="ghost"
        onClick={() => window.history.back()}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Rooms
      </Button>
      <h1 className="text-2xl font-bold">Community Room</h1>
      <p>Room ID: {roomId}</p>
      <div className="mt-8 p-8 border-2 border-dashed rounded-lg text-center">
        <p className="text-muted-foreground">Chat interface coming soon!</p>
      </div>
    </div>
  );
}
