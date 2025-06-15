
-- Update the voting requirements and remove owner bypass
UPDATE public.strategies 
SET votes_required = 4
WHERE votes_required = 3;

-- Update the function to remove owner bypass for publishing
CREATE OR REPLACE FUNCTION public.can_publish_strategy(strategy_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT voting_status = 'approved'
  FROM public.strategies 
  WHERE id = strategy_id;
$$;

-- Update vote counting function to require 2 out of 4 votes
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
  
  -- Update voting status: need at least 2 approvals out of 4 votes, or 2+ rejections = rejected
  UPDATE public.strategies 
  SET voting_status = CASE 
    WHEN approval_votes >= 2 AND (approval_votes + rejection_votes) >= 2 THEN 'approved'
    WHEN rejection_votes >= 2 THEN 'rejected'
    ELSE 'pending'
  END
  WHERE id = COALESCE(NEW.strategy_id, OLD.strategy_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;
