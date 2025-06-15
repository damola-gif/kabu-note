
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionProvider';
import { useEffect } from 'react';

type RoomMessageRow = {
  id: string;
  created_at: string;
  content: string;
  user_id: string;
  room_id: string;
};

export type RoomMessage = RoomMessageRow & {
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
};

// Hook to get messages for a room with real-time updates
export const useRoomMessages = (roomId: string) => {
  const queryClient = useQueryClient();
  const { user } = useSession();

  useEffect(() => {
    if (!roomId) return;

    console.log(`Setting up real-time subscription for room: ${roomId}`);

    const channel = supabase
      .channel(`room-messages-${roomId}`)
      .on<RoomMessageRow>(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'room_messages', 
          filter: `room_id=eq.${roomId}` 
        },
        async (payload) => {
          console.log('Real-time message received:', payload.new);
          
          // Fetch the profile data for the new message
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', payload.new.user_id)
            .single();

          if (error) {
            console.error('Error fetching profile for new message:', error);
            // Fallback: just invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['roomMessages', roomId] });
            return;
          }

          const newMessage: RoomMessage = {
            ...payload.new,
            profiles: profileData
          };

          // Add the new message to the existing cache
          queryClient.setQueryData<RoomMessage[]>(['roomMessages', roomId], (oldData) => {
            if (!oldData) return [newMessage];
            
            // Check if message already exists to avoid duplicates
            const messageExists = oldData.some(msg => msg.id === newMessage.id);
            if (messageExists) return oldData;
            
            console.log('Adding new message to cache:', newMessage);
            return [...oldData, newMessage];
          });
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    return () => {
      console.log('Unsubscribing from real-time channel');
      supabase.removeChannel(channel);
    };
  }, [roomId, queryClient]);

  return useQuery<RoomMessage[], Error>({
    queryKey: ['roomMessages', roomId],
    queryFn: async () => {
      console.log(`Fetching messages for room: ${roomId}`);
      const { data, error } = await supabase
        .from('room_messages')
        .select('*, profiles(username, avatar_url)')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }
      console.log(`Fetched ${data.length} messages for room: ${roomId}`);
      return data as RoomMessage[];
    },
    enabled: !!roomId,
    staleTime: 60000, // Cache for 1 minute since real-time updates will keep it fresh
    refetchOnWindowFocus: false,
  });
};

// Hook to send a message
export const useSendMessage = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId, content }: { roomId: string; content: string }) => {
      if (!user) throw new Error('User must be logged in to send a message');
      if (!content.trim()) throw new Error('Message cannot be empty');

      console.log('Sending message:', { roomId, content, userId: user.id });

      const { data, error } = await supabase
        .from('room_messages')
        .insert([{ room_id: roomId, user_id: user.id, content: content.trim() }])
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }

      console.log('Message sent successfully:', data);
      return data;
    },
    onSuccess: (data, variables) => {
      console.log('Message mutation successful, data will come via real-time');
      // Don't manually update cache here since real-time will handle it
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
    }
  });
};
