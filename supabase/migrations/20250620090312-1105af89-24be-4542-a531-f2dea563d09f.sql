
-- Add missing RLS policies for community_rooms table

-- Policy: Users can view public rooms (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_rooms' AND policyname = 'Users can view public rooms') THEN
        CREATE POLICY "Users can view public rooms"
          ON public.community_rooms FOR SELECT
          USING (privacy_level = 'public');
    END IF;
END $$;

-- Policy: Users can view private/invite-only rooms they are members of (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_rooms' AND policyname = 'Users can view their private rooms') THEN
        CREATE POLICY "Users can view their private rooms"
          ON public.community_rooms FOR SELECT
          USING ( 
            privacy_level != 'public' AND 
            public.is_user_member_of_room(id)
          );
    END IF;
END $$;

-- Policy: Room creators can update their own rooms (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_rooms' AND policyname = 'Room creators can update their rooms') THEN
        CREATE POLICY "Room creators can update their rooms"
          ON public.community_rooms FOR UPDATE
          USING (auth.uid() = creator_id);
    END IF;
END $$;

-- Policy: Room creators can delete their own rooms (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_rooms' AND policyname = 'Room creators can delete their rooms') THEN
        CREATE POLICY "Room creators can delete their rooms"
          ON public.community_rooms FOR DELETE
          USING (auth.uid() = creator_id);
    END IF;
END $$;
