
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionProvider';

// Manually defining types until the auto-generated types are updated.
type NewRoom = {
  name: string;
  description?: string;
  privacy_level: 'public' | 'private' | 'invite_only';
};

export type CommunityRoom = {
  id: string;
  created_at: string;
  name: string;
  description: string | null;
  creator_id: string;
  privacy_level: 'public' | 'private' | 'invite_only';
  invite_code: string | null;
};

export type RoomWithCreator = CommunityRoom & {
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
  room_members: { count: number }[];
};

// Hook to get public rooms
export const usePublicRooms = () => {
  return useQuery<RoomWithCreator[], Error>({
    queryKey: ['publicRooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_rooms')
        .select('*, profiles:creator_id(username, avatar_url), room_members(count)')
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

  return useMutation<CommunityRoom, Error, NewRoom>({
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
      return data as CommunityRoom;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicRooms'] });
    },
  });
};
