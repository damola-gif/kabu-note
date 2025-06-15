
-- Add foreign key relationship between strategies and profiles
ALTER TABLE public.strategies 
ADD CONSTRAINT fk_strategies_user_profile 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Also ensure we have proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_strategies_user_id ON public.strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_strategies_public_created_at ON public.strategies(is_public, created_at) WHERE is_public = true;
