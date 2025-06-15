
-- Create table for room messages
CREATE TABLE public.room_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.community_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.room_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view messages in rooms they are a member of
CREATE POLICY "Users can view messages in their rooms"
  ON public.room_messages FOR SELECT
  USING ( public.is_user_member_of_room(room_id) );

-- Policy: Users can send messages in rooms they are a member of
CREATE POLICY "Users can send messages in their rooms"
  ON public.room_messages FOR INSERT
  WITH CHECK ( public.is_user_member_of_room(room_id) AND auth.uid() = user_id );

-- Enable realtime on the table for live chat functionality
ALTER TABLE public.room_messages REPLICA IDENTITY FULL;

-- Add an index for better query performance
CREATE INDEX ON public.room_messages (room_id, created_at);

