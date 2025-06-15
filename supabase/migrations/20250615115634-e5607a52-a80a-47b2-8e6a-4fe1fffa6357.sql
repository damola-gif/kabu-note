
-- Function to check if the current user is a member of a specific room.
-- Using SECURITY DEFINER to bypass RLS and avoid recursion.
CREATE OR REPLACE FUNCTION public.is_user_member_of_room(p_room_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.room_members
    WHERE room_id = p_room_id AND user_id = auth.uid()
  );
$$;

-- Drop the old recursive policy
DROP POLICY "Users can see members of rooms they are in." ON public.room_members;

-- Recreate the policy using the helper function
CREATE POLICY "Users can see members of rooms they are in."
  ON public.room_members FOR SELECT
  USING (
    public.is_user_member_of_room(room_id)
    OR EXISTS (
      SELECT 1 FROM public.community_rooms
      WHERE id = public.room_members.room_id AND privacy_level = 'public'
    )
  );
