
import { CreateRoomDialog } from '@/components/rooms/CreateRoomDialog';
import { RoomCard } from '@/components/rooms/RoomCard';
import { usePublicRooms } from '@/hooks/useRooms';
import { Loader2, Users } from 'lucide-react';

export default function Rooms() {
  const { data: rooms, isLoading, error } = usePublicRooms();

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Community Rooms</h1>
        <CreateRoomDialog />
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="text-center py-16 text-destructive">
          <p>Failed to load rooms: {error.message}</p>
        </div>
      )}

      {rooms && rooms.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}

      {rooms?.length === 0 && !isLoading && (
          <div className="text-center py-16 rounded-lg border-2 border-dashed border-muted">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold">No public rooms yet</h2>
              <p className="text-muted-foreground mt-2">Be the first to create one!</p>
          </div>
      )}
    </div>
  );
}
