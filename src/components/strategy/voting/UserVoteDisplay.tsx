
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StrategyVote } from '@/hooks/useStrategyVotes';

interface UserVoteDisplayProps {
  userVote: StrategyVote;
  onChangeVote: (newVoteType: 'approve' | 'reject') => void;
  onRemoveVote: () => void;
  isUpdating: boolean;
  isRemoving: boolean;
}

export function UserVoteDisplay({ 
  userVote, 
  onChangeVote, 
  onRemoveVote, 
  isUpdating, 
  isRemoving 
}: UserVoteDisplayProps) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Your vote: <Badge variant={userVote.vote_type === 'approve' ? 'default' : 'destructive'}>
            {userVote.vote_type === 'approve' ? 'Approved' : 'Rejected'}
          </Badge>
        </span>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onChangeVote(userVote.vote_type === 'approve' ? 'reject' : 'approve')}
            disabled={isUpdating}
          >
            Change Vote
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={onRemoveVote}
            disabled={isRemoving}
          >
            Remove
          </Button>
        </div>
      </div>
      {userVote.comment && (
        <p className="text-sm text-gray-600 mt-2">"{userVote.comment}"</p>
      )}
    </div>
  );
}
