
-- Drop the restrictive existing RLS policy, if it exists
DROP POLICY IF EXISTS "Users can view follow relationships." ON public.follows;

-- Allow all authenticated users to view the follows table (so they can view anyone's followers/following lists)
CREATE POLICY "Authenticated users can view follows" 
  ON public.follows 
  FOR SELECT 
  USING (auth.role() = 'authenticated');
