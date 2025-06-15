
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionProvider';
import { Tables } from '@/integrations/supabase/types';

// The type for inserting a new room will not be correctly inferred until types are regenerated.
// Let's define it manually for now.
type NewRoom = {
  name: string;
  description?: string;
  privacy_level: 'public' | 'private' | 'invite_only';
};

export type RoomWithCreator = Tables<'community_rooms'> & {
  creator_id: {
    username: string | null;
    avatar_url: string | null;
  } | null;
  room_members: { count: number }[];
};

// Hook to get public rooms
export const usePublicRooms = () => {
  return useQuery({
    queryKey: ['publicRooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_rooms')
        .select('*, creator_id:profiles(username, avatar_url), room_members(count)')
        .eq('privacy_level', 'public')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching public rooms:', error);
        throw error;
      }
      return data as RoomWithCreator[];
    },
  });
};

// Hook to create a new room
export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  const { user } = useSession();

  return useMutation({
    mutationFn: async (roomData: NewRoom) => {
      if (!user) throw new Error('User must be logged in to create a room');
      
      const { data, error } = await supabase
        .from('community_rooms')
        .insert([{ ...roomData, creator_id: user.id }])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating room:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicRooms'] });
    },
  });
};
