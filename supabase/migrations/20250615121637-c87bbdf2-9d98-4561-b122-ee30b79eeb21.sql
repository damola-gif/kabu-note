
-- Drop the existing foreign key constraint which incorrectly points to auth.users
ALTER TABLE public.room_messages DROP CONSTRAINT room_messages_user_id_fkey;

-- Add a new foreign key constraint that correctly references the public.profiles table
-- This will allow us to join messages with user profiles to get username and avatar
ALTER TABLE public.room_messages
ADD CONSTRAINT room_messages_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
