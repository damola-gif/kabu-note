
-- Add tags support to strategies
ALTER TABLE public.strategies ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create strategy bookmarks table
CREATE TABLE IF NOT EXISTS public.strategy_bookmarks (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    strategy_id UUID NOT NULL REFERENCES public.strategies(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, strategy_id)
);

-- Add RLS policies for strategy bookmarks
ALTER TABLE public.strategy_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookmarks" ON public.strategy_bookmarks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks" ON public.strategy_bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" ON public.strategy_bookmarks
    FOR DELETE USING (auth.uid() = user_id);

-- Add bookmarks count to strategies
ALTER TABLE public.strategies ADD COLUMN IF NOT EXISTS bookmarks_count INT NOT NULL DEFAULT 0;

-- Create trigger functions for bookmarks count
CREATE OR REPLACE FUNCTION increment_bookmarks_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.strategies SET bookmarks_count = bookmarks_count + 1 WHERE id = NEW.strategy_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_bookmarks_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.strategies SET bookmarks_count = bookmarks_count - 1 WHERE id = OLD.strategy_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for bookmarks
DROP TRIGGER IF EXISTS on_bookmark_created ON public.strategy_bookmarks;
CREATE TRIGGER on_bookmark_created 
    AFTER INSERT ON public.strategy_bookmarks 
    FOR EACH ROW EXECUTE FUNCTION increment_bookmarks_count();

DROP TRIGGER IF EXISTS on_bookmark_deleted ON public.strategy_bookmarks;
CREATE TRIGGER on_bookmark_deleted 
    AFTER DELETE ON public.strategy_bookmarks 
    FOR EACH ROW EXECUTE FUNCTION decrement_bookmarks_count();

-- Add draft status and auto-save functionality
ALTER TABLE public.strategies ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT true;
ALTER TABLE public.strategies ADD COLUMN IF NOT EXISTS last_saved_at TIMESTAMPTZ DEFAULT now();

-- Create strategy drafts table for auto-save functionality
CREATE TABLE IF NOT EXISTS public.strategy_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    strategy_id UUID REFERENCES public.strategies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    content_markdown TEXT,
    tags TEXT[] DEFAULT '{}',
    win_rate NUMERIC,
    auto_saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, strategy_id)
);

-- Add RLS policies for strategy drafts
ALTER TABLE public.strategy_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own drafts" ON public.strategy_drafts
    FOR ALL USING (auth.uid() = user_id);

-- Create notifications table for social features
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'strategy_published')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_strategy_id UUID REFERENCES public.strategies(id) ON DELETE CASCADE,
    related_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policies for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Create function to create notifications
CREATE OR REPLACE FUNCTION create_notification(
    target_user_id UUID,
    notification_type TEXT,
    notification_title TEXT,
    notification_message TEXT,
    strategy_id UUID DEFAULT NULL,
    source_user_id UUID DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    INSERT INTO public.notifications (
        user_id, type, title, message, related_strategy_id, related_user_id
    ) VALUES (
        target_user_id, notification_type, notification_title, notification_message, strategy_id, source_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update triggers to create notifications
CREATE OR REPLACE FUNCTION notify_on_like()
RETURNS TRIGGER AS $$
DECLARE
    strategy_owner_id UUID;
    strategy_name TEXT;
    liker_username TEXT;
BEGIN
    -- Get strategy owner and name
    SELECT user_id, name INTO strategy_owner_id, strategy_name
    FROM public.strategies WHERE id = NEW.strategy_id;
    
    -- Get liker username
    SELECT username INTO liker_username 
    FROM public.profiles WHERE id = NEW.user_id;
    
    -- Don't notify if user likes their own strategy
    IF strategy_owner_id != NEW.user_id THEN
        PERFORM create_notification(
            strategy_owner_id,
            'like',
            'New like on your strategy',
            liker_username || ' liked your strategy "' || strategy_name || '"',
            NEW.strategy_id,
            NEW.user_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the like trigger
DROP TRIGGER IF EXISTS on_like_created ON public.strategy_likes;
CREATE TRIGGER on_like_created 
    AFTER INSERT ON public.strategy_likes 
    FOR EACH ROW EXECUTE FUNCTION increment_likes_count();

CREATE TRIGGER on_like_notification
    AFTER INSERT ON public.strategy_likes
    FOR EACH ROW EXECUTE FUNCTION notify_on_like();

-- Create function for comment notifications
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER AS $$
DECLARE
    strategy_owner_id UUID;
    strategy_name TEXT;
    commenter_username TEXT;
BEGIN
    -- Get strategy owner and name
    SELECT user_id, name INTO strategy_owner_id, strategy_name
    FROM public.strategies WHERE id = NEW.strategy_id;
    
    -- Get commenter username
    SELECT username INTO commenter_username 
    FROM public.profiles WHERE id = NEW.user_id;
    
    -- Don't notify if user comments on their own strategy
    IF strategy_owner_id != NEW.user_id THEN
        PERFORM create_notification(
            strategy_owner_id,
            'comment',
            'New comment on your strategy',
            commenter_username || ' commented on your strategy "' || strategy_name || '"',
            NEW.strategy_id,
            NEW.user_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment notification trigger
CREATE TRIGGER on_comment_notification
    AFTER INSERT ON public.strategy_comments
    FOR EACH ROW EXECUTE FUNCTION notify_on_comment();

-- Add storage bucket for strategy images if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('strategy_images', 'strategy_images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for strategy images
CREATE POLICY "Strategy images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'strategy_images');

CREATE POLICY "Users can upload strategy images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'strategy_images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own strategy images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'strategy_images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own strategy images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'strategy_images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );
