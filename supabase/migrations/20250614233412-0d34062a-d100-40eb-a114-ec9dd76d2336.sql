
-- Enable Row Level Security on the strategies table
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to view their own strategies (both public and private)
CREATE POLICY "Users can view their own strategies"
ON public.strategies FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Allow anyone to view public strategies
CREATE POLICY "Anyone can view public strategies"
ON public.strategies FOR SELECT
USING (is_public = true);

-- Policy: Allow users to create strategies for themselves
CREATE POLICY "Users can create their own strategies"
ON public.strategies FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to update their own strategies
CREATE POLICY "Users can update their own strategies"
ON public.strategies FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Allow users to delete their own strategies
CREATE POLICY "Users can delete their own strategies"
ON public.strategies FOR DELETE
USING (auth.uid() = user_id);
