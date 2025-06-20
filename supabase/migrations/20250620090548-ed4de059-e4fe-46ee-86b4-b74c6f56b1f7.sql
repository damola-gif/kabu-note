
-- First, let's drop the existing problematic policies and recreate them correctly
DROP POLICY IF EXISTS "Authenticated users can create rooms" ON public.community_rooms;
DROP POLICY IF EXISTS "Users can view public rooms" ON public.community_rooms;
DROP POLICY IF EXISTS "Users can view their private rooms" ON public.community_rooms;
DROP POLICY IF EXISTS "Room creators can update their rooms" ON public.community_rooms;
DROP POLICY IF EXISTS "Room creators can delete their rooms" ON public.community_rooms;

-- Policy: Authenticated users can create rooms (fixed to work with profiles table)
CREATE POLICY "Authenticated users can create rooms"
  ON public.community_rooms FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- Policy: Users can view public rooms
CREATE POLICY "Users can view public rooms"
  ON public.community_rooms FOR SELECT
  USING (privacy_level = 'public');

-- Policy: Users can view private/invite-only rooms they are members of
CREATE POLICY "Users can view their private rooms"
  ON public.community_rooms FOR SELECT
  USING ( 
    privacy_level != 'public' AND 
    public.is_user_member_of_room(id)
  );

-- Policy: Room creators can update their own rooms
CREATE POLICY "Room creators can update their rooms"
  ON public.community_rooms FOR UPDATE
  USING (auth.uid() = creator_id);

-- Policy: Room creators can delete their own rooms
CREATE POLICY "Room creators can delete their rooms"
  ON public.community_rooms FOR DELETE
  USING (auth.uid() = creator_id);
