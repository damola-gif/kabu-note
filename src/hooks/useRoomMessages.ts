
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

  useEffect(() => {
    const channel = supabase
      .channel(`room-messages-${roomId}`)
      .on<RoomMessageRow>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'room_messages', filter: `room_id=eq.${roomId}` },
        async (payload) => {
            const { data: profileData, error } = await supabase
                .from('profiles')
                .select('username, avatar_url')
                .eq('id', payload.new.user_id)
                .single();

            if (error) {
                console.error('Error fetching profile for new message:', error);
                queryClient.invalidateQueries({ queryKey: ['roomMessages', roomId] });
                return;
            }

            const newMessage: RoomMessage = {
                ...payload.new,
                profiles: profileData
            };

            queryClient.setQueryData<RoomMessage[]>(['roomMessages', roomId], (oldData) => {
                return oldData ? [...oldData, newMessage] : [newMessage];
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, queryClient]);

  return useQuery<RoomMessage[], Error>({
    queryKey: ['roomMessages', roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('room_messages')
        .select('*, profiles:user_id(username, avatar_url)')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }
      return data as RoomMessage[];
    },
    staleTime: Infinity, // Real-time updates will keep the data fresh
  });
};

// Hook to send a message
export const useSendMessage = () => {
  const { user } = useSession();

  return useMutation({
    mutationFn: async ({ roomId, content }: { roomId: string; content: string }) => {
      if (!user) throw new Error('User must be logged in to send a message');
      if (!content.trim()) throw new Error('Message cannot be empty');

      const { data, error } = await supabase
        .from('room_messages')
        .insert([{ room_id: roomId, user_id: user.id, content: content.trim() }])
        .select();

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }
      return data;
    },
  });
};
