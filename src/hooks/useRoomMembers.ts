
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionProvider';
import { useEffect } from 'react';

export type RoomMember = {
  id: number;
  user_id: string;
  room_id: string;
  joined_at: string;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
};

// Hook to get members of a room
export const useRoomMembers = (roomId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!roomId) return;

    console.log(`Setting up real-time subscription for room members: ${roomId}`);

    const channel = supabase
      .channel(`room-members-${roomId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'room_members', 
          filter: `room_id=eq.${roomId}` 
        },
        (payload) => {
          console.log('New member joined:', payload.new);
          // Invalidate queries to refresh member list and counts
          queryClient.invalidateQueries({ queryKey: ['roomMembers', roomId] });
          queryClient.invalidateQueries({ queryKey: ['publicRooms'] });
        }
      )
      .on(
        'postgres_changes',
        { 
          event: 'DELETE', 
          schema: 'public', 
          table: 'room_members', 
          filter: `room_id=eq.${roomId}` 
        },
        (payload) => {
          console.log('Member left:', payload.old);
          // Invalidate queries to refresh member list and counts
          queryClient.invalidateQueries({ queryKey: ['roomMembers', roomId] });
          queryClient.invalidateQueries({ queryKey: ['publicRooms'] });
        }
      )
      .subscribe((status) => {
        console.log('Room members subscription status:', status);
      });

    return () => {
      console.log('Unsubscribing from room members channel');
      supabase.removeChannel(channel);
    };
  }, [roomId, queryClient]);

  return useQuery<RoomMember[], Error>({
    queryKey: ['roomMembers', roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('room_members')
        .select('*, profiles(username, avatar_url)')
        .eq('room_id', roomId);

      if (error) {
        console.error('Error fetching room members:', error);
        throw error;
      }
      return data as RoomMember[];
    },
    enabled: !!roomId,
  });
};

// Hook to join a room
export const useJoinRoom = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: string) => {
      if (!user) throw new Error('User must be logged in to join a room');

      console.log('Joining room:', { roomId, userId: user.id });

      const { data, error } = await supabase
        .from('room_members')
        .insert([{ room_id: roomId, user_id: user.id }])
        .select();

      if (error) {
        console.error('Error joining room:', error);
        throw error;
      }
      
      console.log('Successfully joined room:', data);
      return data;
    },
    onSuccess: (_, roomId) => {
      console.log('Join room mutation successful');
      // Immediately invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['roomMembers', roomId] });
      queryClient.invalidateQueries({ queryKey: ['isRoomMember', roomId] });
      queryClient.invalidateQueries({ queryKey: ['publicRooms'] });
      
      // Optimistically update the membership status
      queryClient.setQueryData(['isRoomMember', roomId, user?.id], true);
    },
    onError: (error) => {
      console.error('Failed to join room:', error);
    }
  });
};

// Hook to check if user is member of a room
export const useIsRoomMember = (roomId: string) => {
  const { user } = useSession();
  
  return useQuery<boolean, Error>({
    queryKey: ['isRoomMember', roomId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('room_members')
        .select('id')
        .eq('room_id', roomId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking room membership:', error);
        throw error;
      }
      return !!data;
    },
    enabled: !!roomId && !!user,
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });
};
