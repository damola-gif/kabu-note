
-- Add image_path column to strategies table
ALTER TABLE public.strategies ADD COLUMN image_path TEXT;

-- Create a new storage bucket for strategy images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('strategy_images', 'strategy_images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

-- Create policies for the new bucket
-- Allow public read access to all files
CREATE POLICY "Public read access for strategy images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'strategy_images' );

-- Allow authenticated users to upload their own images
CREATE POLICY "Allow authenticated users to upload strategy images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'strategy_images' AND auth.uid()::text = (storage.foldername(name))[1] );

-- Allow users to update their own images
CREATE POLICY "Allow users to update their own strategy images"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'strategy_images' AND auth.uid()::text = (storage.foldername(name))[1] );

-- Allow users to delete their own images
CREATE POLICY "Allow users to delete their own strategy images"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'strategy_images' AND auth.uid()::text = (storage.foldername(name))[1] );
