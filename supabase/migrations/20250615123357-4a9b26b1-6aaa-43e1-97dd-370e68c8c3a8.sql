
-- Enable RLS on room_members table and add policies
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view members of rooms they are members of
CREATE POLICY "Users can view room members in their rooms"
  ON public.room_members FOR SELECT
  USING ( public.is_user_member_of_room(room_id) );

-- Policy: Users can join rooms (insert themselves as members)
CREATE POLICY "Users can join rooms"
  ON public.room_members FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

-- Policy: Users can leave rooms (delete their own membership)
CREATE POLICY "Users can leave rooms"
  ON public.room_members FOR DELETE
  USING ( auth.uid() = user_id );

-- Enable RLS on community_rooms table and add policies
ALTER TABLE public.community_rooms ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view public rooms
CREATE POLICY "Anyone can view public rooms"
  ON public.community_rooms FOR SELECT
  USING ( privacy_level = 'public' );

-- Policy: Users can view private/invite-only rooms they are members of
CREATE POLICY "Users can view their private rooms"
  ON public.community_rooms FOR SELECT
  USING ( 
    privacy_level != 'public' AND 
    public.is_user_member_of_room(id)
  );

-- Policy: Authenticated users can create rooms
CREATE POLICY "Authenticated users can create rooms"
  ON public.community_rooms FOR INSERT
  WITH CHECK ( auth.uid() = creator_id );

-- Add trigger to automatically add creator as room member
CREATE OR REPLACE FUNCTION public.add_creator_to_room_members()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.room_members (room_id, user_id)
  VALUES (NEW.id, NEW.creator_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER add_creator_as_member
  AFTER INSERT ON public.community_rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.add_creator_to_room_members();
