
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Clock } from 'lucide-react';
import { StrategyVote } from '@/hooks/useStrategyVotes';
import { VoteForm } from './VoteForm';
import { UserVoteDisplay } from './UserVoteDisplay';

interface VotingActionsProps {
  canVote: boolean;
  userVote: StrategyVote | null;
  user: any;
  onSubmitVote: (voteType: 'approve' | 'reject', comment?: string) => void;
  onRemoveVote: () => void;
  isSubmitting: boolean;
  isRemoving: boolean;
}

export function VotingActions({
  canVote,
  userVote,
  user,
  onSubmitVote,
  onRemoveVote,
  isSubmitting,
  isRemoving
}: VotingActionsProps) {
  const [showVoteForm, setShowVoteForm] = useState(false);
  const [selectedVote, setSelectedVote] = useState<'approve' | 'reject' | null>(null);

  const handleVoteClick = (voteType: 'approve' | 'reject') => {
    if (userVote) {
      // User already voted, update their vote
      onSubmitVote(voteType);
    } else {
      // New vote, show form
      setSelectedVote(voteType);
      setShowVoteForm(true);
    }
  };

  const handleSubmitVote = (comment?: string) => {
    if (!selectedVote) return;
    
    onSubmitVote(selectedVote, comment);
    setShowVoteForm(false);
    setSelectedVote(null);
  };

  if (!canVote) {
    return (
      <div className="p-3 bg-blue-50 rounded-lg text-center">
        <Clock className="h-5 w-5 mx-auto mb-2 text-blue-600" />
        <p className="text-sm text-blue-800">
          {user ? 'Follow this author to vote on their strategies' : 'Sign in to participate in voting'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!userVote && !showVoteForm && (
        <div className="flex gap-2">
          <Button 
            onClick={() => handleVoteClick('approve')}
            className="flex-1 bg-green-600 hover:bg-green-700"
            disabled={isSubmitting}
          >
            <ThumbsUp className="h-4 w-4 mr-2" />
            Approve
          </Button>
          <Button 
            onClick={() => handleVoteClick('reject')}
            variant="destructive"
            className="flex-1"
            disabled={isSubmitting}
          >
            <ThumbsDown className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </div>
      )}

      {userVote && (
        <UserVoteDisplay
          userVote={userVote}
          onChangeVote={handleVoteClick}
          onRemoveVote={onRemoveVote}
          isUpdating={isSubmitting}
          isRemoving={isRemoving}
        />
      )}

      {showVoteForm && selectedVote && (
        <VoteForm
          selectedVote={selectedVote}
          onSubmit={handleSubmitVote}
          onCancel={() => setShowVoteForm(false)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
