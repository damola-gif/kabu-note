
-- Drop the existing policy for viewing rooms
DROP POLICY "Public rooms are viewable by everyone." ON public.community_rooms;

-- Create a new policy that allows viewing public rooms OR rooms the user is a member of
CREATE POLICY "Users can view rooms they have access to."
  ON public.community_rooms FOR SELECT
  USING (
    privacy_level = 'public'
    OR public.is_user_member_of_room(id)
  );
