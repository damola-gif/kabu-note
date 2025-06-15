
-- Create a table to store strategy votes from followers
CREATE TABLE public.strategy_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id uuid REFERENCES public.strategies(id) ON DELETE CASCADE NOT NULL,
  voter_id uuid NOT NULL, -- references auth.users(id)
  vote_type text CHECK (vote_type IN ('approve', 'reject')) NOT NULL,
  comment text, -- optional comment from voter
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(strategy_id, voter_id) -- prevent duplicate votes from same user
);

-- Enable RLS on strategy votes
ALTER TABLE public.strategy_votes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view votes on strategies they can see
CREATE POLICY "Users can view strategy votes" ON public.strategy_votes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.strategies s 
    WHERE s.id = strategy_id 
    AND (s.is_public = true OR s.user_id = auth.uid())
  )
);

-- Policy: Only followers can vote on strategies
CREATE POLICY "Followers can vote on strategies" ON public.strategy_votes
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.follows f
    JOIN public.strategies s ON s.user_id = f.following_id
    WHERE f.follower_id = auth.uid()
    AND s.id = strategy_id
  )
);

-- Policy: Users can update their own votes
CREATE POLICY "Users can update their own votes" ON public.strategy_votes
FOR UPDATE USING (voter_id = auth.uid());

-- Policy: Users can delete their own votes
CREATE POLICY "Users can delete their own votes" ON public.strategy_votes
FOR DELETE USING (voter_id = auth.uid());

-- Add voting-related columns to strategies table
ALTER TABLE public.strategies 
ADD COLUMN votes_required integer DEFAULT 3,
ADD COLUMN approval_votes integer DEFAULT 0,
ADD COLUMN rejection_votes integer DEFAULT 0,
ADD COLUMN voting_status text CHECK (voting_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending';

-- Create function to update vote counts
CREATE OR REPLACE FUNCTION public.update_strategy_vote_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'approve' THEN
      UPDATE public.strategies 
      SET approval_votes = approval_votes + 1
      WHERE id = NEW.strategy_id;
    ELSE
      UPDATE public.strategies 
      SET rejection_votes = rejection_votes + 1
      WHERE id = NEW.strategy_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle vote change
    IF OLD.vote_type = 'approve' AND NEW.vote_type = 'reject' THEN
      UPDATE public.strategies 
      SET approval_votes = approval_votes - 1, rejection_votes = rejection_votes + 1
      WHERE id = NEW.strategy_id;
    ELSIF OLD.vote_type = 'reject' AND NEW.vote_type = 'approve' THEN
      UPDATE public.strategies 
      SET approval_votes = approval_votes + 1, rejection_votes = rejection_votes - 1
      WHERE id = NEW.strategy_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'approve' THEN
      UPDATE public.strategies 
      SET approval_votes = approval_votes - 1
      WHERE id = OLD.strategy_id;
    ELSE
      UPDATE public.strategies 
      SET rejection_votes = rejection_votes - 1
      WHERE id = OLD.strategy_id;
    END IF;
  END IF;
  
  -- Update voting status based on vote counts
  UPDATE public.strategies 
  SET voting_status = CASE 
    WHEN approval_votes >= votes_required THEN 'approved'
    WHEN rejection_votes >= votes_required THEN 'rejected'
    ELSE 'pending'
  END
  WHERE id = COALESCE(NEW.strategy_id, OLD.strategy_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers for vote counting
CREATE TRIGGER strategy_vote_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.strategy_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_strategy_vote_counts();

-- Create function to check if strategy can be published
CREATE OR REPLACE FUNCTION public.can_publish_strategy(strategy_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT voting_status = 'approved' OR user_id = auth.uid()
  FROM public.strategies 
  WHERE id = strategy_id;
$$;
