
-- Step 1: Drop the old public.users table and its dependencies if it exists.
DROP TABLE IF EXISTS public.users CASCADE;

-- Step 2: Create the 'strategies' table if it doesn't exist, with the correct columns.
CREATE TABLE IF NOT EXISTS public.strategies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid NOT NULL,
  name text not null,
  content_markdown text,
  is_public boolean default false,
  created_at timestamp with time zone default now()
);

-- Step 3: If the 'strategies' table already existed, ensure it has the correct structure.
-- This drops the old 'rules' column and adds the new 'content_markdown' column if needed.
ALTER TABLE public.strategies
  DROP COLUMN IF EXISTS rules,
  ADD COLUMN IF NOT EXISTS content_markdown TEXT;

-- Step 4: Correctly link the user_id in 'trades' and 'strategies' to auth.users.
ALTER TABLE public.trades DROP CONSTRAINT IF EXISTS trades_user_id_fkey;
ALTER TABLE public.trades 
  ADD CONSTRAINT trades_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.strategies DROP CONSTRAINT IF EXISTS strategies_user_id_fkey;
ALTER TABLE public.strategies 
  ADD CONSTRAINT strategies_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  
-- Step 5: Enable Row Level Security (RLS) on both tables.
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policy for 'trades' to ensure users can only access their own.
DROP POLICY IF EXISTS "users can manage their own trades" ON public.trades;
CREATE POLICY "users can manage their own trades"
  ON public.trades
  FOR ALL
  USING ( auth.uid() = user_id )
  WITH CHECK ( auth.uid() = user_id );

-- Step 7: Create RLS policies for 'strategies' as requested.
DROP POLICY IF EXISTS "public strategies are visible to any authenticated user" ON public.strategies;
CREATE POLICY "public strategies are visible to any authenticated user"
  ON public.strategies
  FOR SELECT
  USING ( is_public = true AND auth.uid() IS NOT NULL );

DROP POLICY IF EXISTS "authors can manage their own strategies" ON public.strategies;
CREATE POLICY "authors can manage their own strategies"
  ON public.strategies
  FOR ALL
  USING ( user_id = auth.uid() )
  WITH CHECK ( user_id = auth.uid() );
