
-- Add a GIN index on tags array for better hashtag search performance
CREATE INDEX IF NOT EXISTS idx_strategies_tags_gin ON public.strategies USING GIN (tags);

-- Add a function to search strategies by hashtags
CREATE OR REPLACE FUNCTION search_strategies_by_hashtag(hashtag_query text)
RETURNS TABLE (
  id uuid,
  name text,
  content_markdown text,
  tags text[],
  user_id uuid,
  created_at timestamptz,
  is_public boolean,
  win_rate numeric,
  likes_count integer,
  comments_count integer,
  bookmarks_count integer,
  image_path text
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.content_markdown,
    s.tags,
    s.user_id,
    s.created_at,
    s.is_public,
    s.win_rate,
    s.likes_count,
    s.comments_count,
    s.bookmarks_count,
    s.image_path
  FROM public.strategies s
  WHERE s.is_public = true
    AND (
      hashtag_query = ANY(s.tags) 
      OR EXISTS (
        SELECT 1 FROM unnest(s.tags) as tag 
        WHERE tag ILIKE '%' || hashtag_query || '%'
      )
    )
  ORDER BY s.created_at DESC;
END;
$$;
