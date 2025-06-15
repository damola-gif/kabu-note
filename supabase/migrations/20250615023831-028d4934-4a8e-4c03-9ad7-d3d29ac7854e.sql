
-- Create a posts table for feed content
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  content TEXT,
  post_type TEXT NOT NULL CHECK (post_type IN ('text', 'image', 'video', 'link')),
  media_url TEXT,
  media_type TEXT,
  link_url TEXT,
  link_title TEXT,
  link_description TEXT,
  link_image TEXT,
  hashtags TEXT[],
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create policies for posts
CREATE POLICY "Anyone can view public posts" 
  ON public.posts 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own posts" 
  ON public.posts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
  ON public.posts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
  ON public.posts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create storage bucket for post media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('post-media', 'post-media', true);

-- Create storage policies for post media
CREATE POLICY "Anyone can view post media" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'post-media');

CREATE POLICY "Users can upload post media" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own post media" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own post media" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create triggers to update counts
CREATE OR REPLACE FUNCTION public.increment_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrement_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create post_likes table
CREATE TABLE public.post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  post_id UUID REFERENCES public.posts NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Enable RLS on post_likes
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for post_likes
CREATE POLICY "Users can view all post likes" 
  ON public.post_likes 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own post likes" 
  ON public.post_likes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own post likes" 
  ON public.post_likes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create triggers for post likes
CREATE TRIGGER increment_post_likes_trigger
  AFTER INSERT ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.increment_post_likes_count();

CREATE TRIGGER decrement_post_likes_trigger
  AFTER DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.decrement_post_likes_count();
