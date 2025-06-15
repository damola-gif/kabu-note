
-- Update the voting system to require 50% of followers to vote
-- First, let's create a function to calculate required votes based on follower count
CREATE OR REPLACE FUNCTION public.calculate_required_votes(strategy_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT GREATEST(2, CEIL(COUNT(*)::numeric * 0.5)::integer)
  FROM public.follows 
  WHERE following_id = strategy_user_id;
$$;

-- Update the vote counting function to use dynamic requirements
CREATE OR REPLACE FUNCTION public.update_strategy_vote_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  required_votes integer;
  strategy_user_id uuid;
BEGIN
  -- Get strategy owner ID
  SELECT user_id INTO strategy_user_id 
  FROM public.strategies 
  WHERE id = COALESCE(NEW.strategy_id, OLD.strategy_id);
  
  -- Calculate required votes (50% of followers, minimum 2)
  SELECT calculate_required_votes(strategy_user_id) INTO required_votes;

  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'approve' THEN
      UPDATE public.strategies 
      SET approval_votes = approval_votes + 1,
          votes_required = required_votes
      WHERE id = NEW.strategy_id;
    ELSE
      UPDATE public.strategies 
      SET rejection_votes = rejection_votes + 1,
          votes_required = required_votes
      WHERE id = NEW.strategy_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle vote change
    IF OLD.vote_type = 'approve' AND NEW.vote_type = 'reject' THEN
      UPDATE public.strategies 
      SET approval_votes = approval_votes - 1, 
          rejection_votes = rejection_votes + 1,
          votes_required = required_votes
      WHERE id = NEW.strategy_id;
    ELSIF OLD.vote_type = 'reject' AND NEW.vote_type = 'approve' THEN
      UPDATE public.strategies 
      SET approval_votes = approval_votes + 1, 
          rejection_votes = rejection_votes - 1,
          votes_required = required_votes
      WHERE id = NEW.strategy_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'approve' THEN
      UPDATE public.strategies 
      SET approval_votes = approval_votes - 1,
          votes_required = required_votes
      WHERE id = OLD.strategy_id;
    ELSE
      UPDATE public.strategies 
      SET rejection_votes = rejection_votes - 1,
          votes_required = required_votes
      WHERE id = OLD.strategy_id;
    END IF;
  END IF;
  
  -- Update voting status: need majority approval from required votes
  UPDATE public.strategies 
  SET voting_status = CASE 
    WHEN approval_votes >= CEIL(required_votes::numeric / 2) AND (approval_votes + rejection_votes) >= required_votes THEN 'approved'
    WHEN rejection_votes >= CEIL(required_votes::numeric / 2) THEN 'rejected'
    ELSE 'pending'
  END
  WHERE id = COALESCE(NEW.strategy_id, OLD.strategy_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Update the publishing function to remove owner bypass
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
