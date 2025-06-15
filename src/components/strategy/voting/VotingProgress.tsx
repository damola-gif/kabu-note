
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

interface VotingProgressProps {
  strategy: Tables<'strategies'>;
}

export function VotingProgress({ strategy }: VotingProgressProps) {
  const totalVotes = (strategy.approval_votes || 0) + (strategy.rejection_votes || 0);
  const requiredVotes = strategy.votes_required || 2;
  const votesNeeded = Math.max(0, requiredVotes - totalVotes);
  const majorityNeeded = Math.ceil(requiredVotes / 2);
  const approvalsNeeded = Math.max(0, majorityNeeded - (strategy.approval_votes || 0));

  const getVotingStatusBadge = () => {
    switch (strategy.voting_status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending Votes</Badge>;
    }
  };

  return (
    <>
      {/* Voting Progress */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-green-600">
            <ThumbsUp className="h-4 w-4" />
            {strategy.approval_votes || 0} Approve
          </span>
          <span className="flex items-center gap-1 text-red-600">
            <ThumbsDown className="h-4 w-4" />
            {strategy.rejection_votes || 0} Reject
          </span>
        </div>
        <span className="text-gray-500">
          {strategy.voting_status === 'pending' ? (
            votesNeeded > 0 ? `${votesNeeded} more votes needed` : 
            approvalsNeeded > 0 ? `Need ${approvalsNeeded} more approvals` : 'Awaiting final decision'
          ) : `${totalVotes} total votes`}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-green-500 h-2 rounded-full transition-all duration-300" 
          style={{ 
            width: `${Math.min(((strategy.approval_votes || 0) / majorityNeeded) * 100, 100)}%` 
          }}
        />
      </div>

      <div className="text-xs text-gray-600">
        Requires {requiredVotes} votes (50% of followers) with majority approval. 
        Current: {strategy.approval_votes || 0}/{majorityNeeded} approvals needed, {totalVotes}/{requiredVotes} total votes
      </div>

      {getVotingStatusBadge()}
    </>
  );
}
