
-- Enable real-time for room_messages table
ALTER TABLE public.room_messages REPLICA IDENTITY FULL;

-- Enable real-time for room_members table  
ALTER TABLE public.room_members REPLICA IDENTITY FULL;

-- Add tables to the supabase_realtime publication to enable real-time functionality
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_members;
