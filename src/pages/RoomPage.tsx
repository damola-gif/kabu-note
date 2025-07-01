
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Users } from 'lucide-react';
import { ChatInterface } from '@/components/rooms/ChatInterface';
import { useRoomDetails } from '@/hooks/useRooms';
import { useRoomMembers, useIsRoomMember, useJoinRoom } from '@/hooks/useRoomMembers';
import { toast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { data: room, isLoading, error } = useRoomDetails(roomId || '');
  const { data: members } = useRoomMembers(roomId || '');
  const { data: isMember, isLoading: checkingMembership } = useIsRoomMember(roomId || '');
  const joinRoom = useJoinRoom();
  const [isJoining, setIsJoining] = useState(false);

  // Add debug logging
  useEffect(() => {
    console.log('RoomPage Debug:', {
      roomId,
      room,
      isLoading,
      error,
      isMember,
      checkingMembership
    });
  }, [roomId, room, isLoading, error, isMember, checkingMembership]);

  if (!roomId) {
    console.log('No roomId found in URL params');
    return (
      <div className="p-4 text-center">
        <p>Invalid room ID.</p>
        <Button onClick={() => window.history.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const handleJoinRoom = async () => {
    setIsJoining(true);
    try {
      await joinRoom.mutateAsync(roomId);
      toast({
        title: 'Joined room',
        description: `You've successfully joined ${room?.name}`,
      });
    } catch (error: any) {
      console.error('Error joining room:', error);
      toast({
        title: 'Error joining room',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsJoining(false);
    }
  };

  const PageHeader = () => (
    <div className="flex items-center justify-between mb-4 flex-shrink-0">
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Rooms
        </Button>
        {isLoading && <Loader2 className="h-6 w-6 animate-spin" />}
        {error && (
          <div>
            <h1 className="text-2xl font-bold text-destructive">Error loading room</h1>
            <p className="text-sm text-muted-foreground mt-1">Error: {error.message}</p>
          </div>
        )}
        {room && (
          <div>
            <h1 className="text-2xl font-bold">{room.name}</h1>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Users className="h-4 w-4 mr-1" />
              <span>{members?.length || 0} members</span>
            </div>
          </div>
        )}
      </div>
      
      {room && !checkingMembership && !isMember && (
        <Button 
          onClick={handleJoinRoom}
          disabled={isJoining}
        >
          {isJoining ? 'Joining...' : 'Join Room'}
        </Button>
      )}
    </div>
  );

  // Show loading state while checking room details
  if (isLoading) {
    return (
      <div className="p-4 flex flex-col h-screen max-h-screen">
        <PageHeader />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading room details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if room doesn't exist or can't be loaded
  if (error) {
    console.error('Room loading error:', error);
    return (
      <div className="p-4 flex flex-col h-screen max-h-screen">
        <PageHeader />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2 text-destructive">Room not found</h2>
            <p className="text-muted-foreground mb-4">
              This room doesn't exist or you don't have permission to view it.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Room ID: {roomId}
            </p>
            <Button onClick={() => window.history.back()}>
              Go Back to Rooms
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while checking membership
  if (checkingMembership) {
    return (
      <div className="p-4 flex flex-col h-screen max-h-screen">
        <PageHeader />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Checking room access...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show join prompt if not a member
  if (!isMember) {
    return (
      <div className="p-4 flex flex-col h-screen max-h-screen">
        <PageHeader />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Join this room</h2>
            <p className="text-muted-foreground mb-4">
              You need to join this room to see messages and participate in conversations.
            </p>
            <Button onClick={handleJoinRoom} disabled={isJoining}>
              {isJoining ? 'Joining...' : 'Join Room'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show chat interface for members
  return (
    <div className="p-4 flex flex-col h-screen max-h-screen">
      <PageHeader />
      <div className="flex-grow min-h-0">
        <ChatInterface roomId={roomId} />
      </div>
    </div>
  );
}
