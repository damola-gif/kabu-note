
-- Drop the old, permissive policy for viewing public strategies
DROP POLICY IF EXISTS "Users can view public strategies" ON public.strategies;

-- A new policy to ensure only public AND approved strategies are visible to everyone.
CREATE POLICY "Users can view public and approved strategies"
ON public.strategies
FOR SELECT
USING (is_public = true AND voting_status = 'approved');

-- A new policy to allow followers to see strategies that are pending a vote.
-- This allows them to participate in the voting process before a strategy is public.
CREATE POLICY "Followers can view pending strategies for voting"
ON public.strategies
FOR SELECT
USING (
  voting_status = 'pending' AND
  is_draft = false AND
  EXISTS (
    SELECT 1
    FROM public.follows f
    WHERE f.follower_id = auth.uid()
    AND f.following_id = strategies.user_id
  )
);
