
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RoomWithCreator } from '@/hooks/useRooms';
import { useIsRoomMember, useJoinRoom } from '@/hooks/useRoomMembers';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';

interface RoomCardProps {
  room: RoomWithCreator;
}

export const RoomCard = ({ room }: RoomCardProps) => {
  const { data: isMember, isLoading: checkingMembership } = useIsRoomMember(room.id);
  const joinRoom = useJoinRoom();
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinRoom = async () => {
    setIsJoining(true);
    try {
      await joinRoom.mutateAsync(room.id);
      toast({
        title: 'Joined room',
        description: `You've successfully joined ${room.name}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error joining room',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Card className="flex flex-col bg-card/50 hover:bg-card/90 transition-colors border-border/50">
      <CardHeader>
        <CardTitle>{room.name}</CardTitle>
        <CardDescription>{room.description || 'No description provided.'}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="mr-2 h-4 w-4" />
          <span>{room.member_count} {room.member_count === 1 ? 'member' : 'members'}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={room.profiles?.avatar_url || ''} />
            <AvatarFallback>{room.profiles?.username?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">
            by {room.profiles?.username || '...'}
          </span>
        </div>
        
        {checkingMembership ? (
          <Button size="sm" disabled>Loading...</Button>
        ) : isMember ? (
          <Button asChild size="sm">
            <Link to={`/rooms/${room.id}`}>Enter Room</Link>
          </Button>
        ) : (
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleJoinRoom}
            disabled={isJoining}
          >
            {isJoining ? 'Joining...' : 'Join Room'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
