
-- Drop and recreate the trigger function to handle duplicates gracefully
DROP TRIGGER IF EXISTS add_creator_as_member ON public.community_rooms;
DROP TRIGGER IF EXISTS on_community_room_created ON public.community_rooms;
DROP FUNCTION IF EXISTS public.add_creator_to_room_members();

-- Recreate the function with duplicate handling
CREATE OR REPLACE FUNCTION public.add_creator_to_room_members()
RETURNS TRIGGER AS $$
BEGIN
  -- Use INSERT ... ON CONFLICT DO NOTHING to avoid duplicate key errors
  INSERT INTO public.room_members (room_id, user_id)
  VALUES (NEW.id, NEW.creator_id)
  ON CONFLICT (room_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER add_creator_as_member
  AFTER INSERT ON public.community_rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.add_creator_to_room_members();
