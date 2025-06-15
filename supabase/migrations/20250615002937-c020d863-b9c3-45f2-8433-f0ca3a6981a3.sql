
-- Add count columns to the strategies table
ALTER TABLE public.strategies ADD COLUMN IF NOT EXISTS likes_count INT NOT NULL DEFAULT 0;
ALTER TABLE public.strategies ADD COLUMN IF NOT EXISTS comments_count INT NOT NULL DEFAULT 0;

-- Create a table to store likes for strategies
CREATE TABLE public.strategy_likes (
    strategy_id UUID NOT NULL REFERENCES public.strategies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (strategy_id, user_id)
);

-- Add Row Level Security for the likes table
ALTER TABLE public.strategy_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all likes" ON public.strategy_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert their own likes" ON public.strategy_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own likes" ON public.strategy_likes FOR DELETE USING (auth.uid() = user_id);

-- Create a table to store comments for strategies
CREATE TABLE public.strategy_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id UUID NOT NULL REFERENCES public.strategies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add Row Level Security for the comments table
ALTER TABLE public.strategy_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all comments" ON public.strategy_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert comments" ON public.strategy_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON public.strategy_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.strategy_comments FOR DELETE USING (auth.uid() = user_id);

-- Trigger functions to update likes_count
CREATE OR REPLACE FUNCTION increment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.strategies SET likes_count = likes_count + 1 WHERE id = NEW.strategy_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.strategies SET likes_count = likes_count - 1 WHERE id = OLD.strategy_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger functions to update comments_count
CREATE OR REPLACE FUNCTION increment_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.strategies SET comments_count = comments_count + 1 WHERE id = NEW.strategy_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.strategies SET comments_count = comments_count - 1 WHERE id = OLD.strategy_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for likes
CREATE TRIGGER on_like_created AFTER INSERT ON public.strategy_likes FOR EACH ROW EXECUTE FUNCTION increment_likes_count();
CREATE TRIGGER on_like_deleted AFTER DELETE ON public.strategy_likes FOR EACH ROW EXECUTE FUNCTION decrement_likes_count();

-- Create triggers for comments
CREATE TRIGGER on_comment_created AFTER INSERT ON public.strategy_comments FOR EACH ROW EXECUTE FUNCTION increment_comments_count();
CREATE TRIGGER on_comment_deleted AFTER DELETE ON public.strategy_comments FOR EACH ROW EXECUTE FUNCTION decrement_comments_count();

-- Trigger to update 'updated_at' on comments table
CREATE TRIGGER handle_comment_updated_at BEFORE UPDATE ON public.strategy_comments 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
