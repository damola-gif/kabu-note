
-- Add an 'updated_at' column to the strategies table to track modifications.
ALTER TABLE public.strategies
ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();

-- Create a trigger that automatically updates the 'updated_at' column whenever a strategy is modified.
CREATE TRIGGER handle_strategy_update
BEFORE UPDATE ON public.strategies
FOR EACH ROW
EXECUTE PROCEDURE public.update_updated_at_column();

-- Enable Row Level Security on the strategies table to control data access.
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;

-- POLICY: Users can view public strategies or their own private strategies.
-- This ensures that private data remains secure while allowing for public sharing.
CREATE POLICY "Allow authenticated users to read public or own strategies"
ON public.strategies
FOR SELECT
USING (is_public = TRUE OR auth.uid() = user_id);

-- POLICY: Users can only create strategies for themselves.
-- This links every new strategy to its creator.
CREATE POLICY "Allow users to insert their own strategies"
ON public.strategies
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- POLICY: Users can only update their own strategies.
-- This prevents unauthorized edits by other users.
CREATE POLICY "Allow users to update their own strategies"
ON public.strategies
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- POLICY: Users can only delete their own strategies.
-- This protects strategies from being deleted by anyone other than the author.
CREATE POLICY "Allow users to delete their own strategies"
ON public.strategies
FOR DELETE
USING (auth.uid() = user_id);
