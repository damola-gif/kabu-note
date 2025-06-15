
-- Create a table for public user profiles
CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  avatar_url text,
  full_name text,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS) for the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- This trigger automatically creates a profile with a default username when a new user signs up.
CREATE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 4));
  return new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create a table for follow relationships
CREATE TABLE public.follows (
    follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (follower_id, following_id)
);

-- Set up Row Level Security (RLS) for the follows table
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view follow relationships." ON public.follows
  FOR SELECT USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can insert their own follow relationship." ON public.follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follow relationship." ON public.follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Drop the constraint if it exists to avoid conflict, then re-create it to point to auth.users
ALTER TABLE public.strategies DROP CONSTRAINT IF EXISTS strategies_user_id_fkey;
ALTER TABLE public.strategies 
  ADD CONSTRAINT strategies_user_id_fkey FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) ON DELETE CASCADE;

-- Set up Row Level Security on the strategies table
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;

-- Allow users to see all public strategies or their own strategies
CREATE POLICY "Users can view public or their own strategies." ON public.strategies
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

-- Allow users to create strategies
CREATE POLICY "Users can create strategies." ON public.strategies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own strategies
CREATE POLICY "Users can update their own strategies." ON public.strategies
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own strategies
CREATE POLICY "Users can delete their own strategies." ON public.strategies
  FOR DELETE USING (auth.uid() = user_id);

