
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { format } from 'date-fns';
import { StrategyVote } from '@/hooks/useStrategyVotes';

interface RecentVotesProps {
  votes: StrategyVote[];
}

export function RecentVotes({ votes }: RecentVotesProps) {
  if (!votes || votes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm">Recent Votes</h4>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {votes.slice(0, 5).map((vote) => (
          <div key={vote.id} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
            <div className="flex items-center gap-2">
              {vote.vote_type === 'approve' ? (
                <ThumbsUp className="h-3 w-3 text-green-600" />
              ) : (
                <ThumbsDown className="h-3 w-3 text-red-600" />
              )}
              <span className="text-gray-600">
                {vote.vote_type === 'approve' ? 'Approved' : 'Rejected'}
              </span>
            </div>
            <span className="text-gray-500">
              {format(new Date(vote.created_at), 'MMM d')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
