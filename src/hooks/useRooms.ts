
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionProvider';
import * as z from 'zod';

// Manually defining types until the auto-generated types are updated.
export const createRoomSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(50),
  description: z.string().max(200).optional(),
  privacy_level: z.enum(['public', 'private', 'invite_only']),
});

export type NewRoom = z.infer<typeof createRoomSchema>;

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
  member_count: number;
};

// Function to generate a random invite code
const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Hook to get rooms the user has access to (public + their private/invite-only rooms)
export const usePublicRooms = () => {
  return useQuery<RoomWithCreator[], Error>({
    queryKey: ['publicRooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_rooms')
        .select(`
          *,
          profiles:creator_id(username, avatar_url),
          room_members(count)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching rooms:', error);
        throw error;
      }

      // Transform the data to include member count
      const transformedData = data.map(room => ({
        ...room,
        member_count: room.room_members?.[0]?.count || 1
      }));

      return transformedData as RoomWithCreator[];
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
      
      // Generate invite code for invite-only rooms
      const invite_code = roomData.privacy_level === 'invite_only' ? generateInviteCode() : null;
      
      // Construct the insert object with explicit typing to ensure name is required
      const insertData: {
        name: string;
        description: string | null;
        privacy_level: 'public' | 'private' | 'invite_only';
        creator_id: string;
        invite_code: string | null;
      } = {
        name: roomData.name, // This is guaranteed to exist due to Zod validation
        description: roomData.description || null,
        privacy_level: roomData.privacy_level,
        creator_id: user.id,
        invite_code: invite_code
      };
      
      const { data, error } = await supabase
        .from('community_rooms')
        .insert([insertData])
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

// Hook to get details for a single room
export const useRoomDetails = (roomId: string) => {
  return useQuery<CommunityRoom, Error>({
    queryKey: ['roomDetails', roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (error) {
        console.error('Error fetching room details:', error);
        throw error;
      }
      return data as CommunityRoom;
    },
    enabled: !!roomId,
  });
};
