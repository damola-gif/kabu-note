
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, ThumbsDown, Users, Clock } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { useStrategyVotes, useUserVote, useSubmitVote, useRemoveVote } from '@/hooks/useStrategyVotes';
import { useSession } from '@/contexts/SessionProvider';
import { useFollowing } from '@/hooks/useProfile';
import { format } from 'date-fns';

interface StrategyVotingSectionProps {
  strategy: Tables<'strategies'>;
}

export function StrategyVotingSection({ strategy }: StrategyVotingSectionProps) {
  const { user } = useSession();
  const [comment, setComment] = useState('');
  const [showVoteForm, setShowVoteForm] = useState(false);
  const [selectedVote, setSelectedVote] = useState<'approve' | 'reject' | null>(null);

  const { data: votes } = useStrategyVotes(strategy.id);
  const { data: userVote } = useUserVote(strategy.id);
  const { data: followingIds } = useFollowing();
  const submitVoteMutation = useSubmitVote();
  const removeVoteMutation = useRemoveVote();

  // Check if current user can vote (must be following the strategy author, and not the owner)
  const canVote = user && strategy.user_id !== user.id && followingIds?.includes(strategy.user_id);
  const isOwner = user?.id === strategy.user_id;

  const handleSubmitVote = async () => {
    if (!selectedVote) return;
    
    await submitVoteMutation.mutateAsync({
      strategyId: strategy.id,
      voteType: selectedVote,
      comment: comment || undefined,
    });
    
    setComment('');
    setShowVoteForm(false);
    setSelectedVote(null);
  };

  const handleVoteClick = (voteType: 'approve' | 'reject') => {
    if (userVote) {
      // User already voted, update their vote
      submitVoteMutation.mutate({
        strategyId: strategy.id,
        voteType,
        comment: undefined,
      });
    } else {
      // New vote, show form
      setSelectedVote(voteType);
      setShowVoteForm(true);
    }
  };

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

  const totalVotes = (strategy.approval_votes || 0) + (strategy.rejection_votes || 0);
  const approvalRate = totalVotes > 0 ? ((strategy.approval_votes || 0) / totalVotes) * 100 : 0;
  const votesNeeded = Math.max(0, 4 - totalVotes);
  const approvalsNeeded = Math.max(0, 2 - (strategy.approval_votes || 0));

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Community Voting
          </span>
          {getVotingStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
              approvalsNeeded > 0 ? `${approvalsNeeded} more approvals needed` : 'Awaiting final votes'
            ) : `${totalVotes} total votes`}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300" 
            style={{ 
              width: `${Math.min(((strategy.approval_votes || 0) / 2) * 100, 100)}%` 
            }}
          />
        </div>

        <div className="text-xs text-gray-600">
          Need 2 out of 4 follower votes to approve. Current: {strategy.approval_votes || 0}/2 approvals, {totalVotes}/4 total votes
        </div>

        {/* Owner Monitoring Section */}
        {isOwner && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Strategy Status Monitor</span>
            </div>
            <p className="text-sm text-blue-700">
              Your strategy is being reviewed by your followers. You'll receive notifications when votes are cast.
              {strategy.voting_status === 'pending' && approvalsNeeded > 0 && (
                ` Need ${approvalsNeeded} more approval${approvalsNeeded !== 1 ? 's' : ''} to publish automatically.`
              )}
            </p>
          </div>
        )}

        {/* Voting Actions for Followers */}
        {!isOwner && (
          <div className="space-y-3">
            {canVote ? (
              <div className="space-y-3">
                {!userVote && !showVoteForm && (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleVoteClick('approve')}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={submitVoteMutation.isPending}
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      onClick={() => handleVoteClick('reject')}
                      variant="destructive"
                      className="flex-1"
                      disabled={submitVoteMutation.isPending}
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}

                {userVote && (
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
                          onClick={() => handleVoteClick(userVote.vote_type === 'approve' ? 'reject' : 'approve')}
                          disabled={submitVoteMutation.isPending}
                        >
                          Change Vote
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => removeVoteMutation.mutate(strategy.id)}
                          disabled={removeVoteMutation.isPending}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                    {userVote.comment && (
                      <p className="text-sm text-gray-600 mt-2">"{userVote.comment}"</p>
                    )}
                  </div>
                )}

                {showVoteForm && (
                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      {selectedVote === 'approve' ? (
                        <ThumbsUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <ThumbsDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-medium">
                        {selectedVote === 'approve' ? 'Approving' : 'Rejecting'} this strategy
                      </span>
                    </div>
                    <Textarea
                      placeholder="Add a comment (optional)"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleSubmitVote} disabled={submitVoteMutation.isPending}>
                        {submitVoteMutation.isPending ? 'Submitting...' : 'Submit Vote'}
                      </Button>
                      <Button variant="ghost" onClick={() => setShowVoteForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <Clock className="h-5 w-5 mx-auto mb-2 text-blue-600" />
                <p className="text-sm text-blue-800">
                  {user ? 'Follow this author to vote on their strategies' : 'Sign in to participate in voting'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Recent Votes */}
        {votes && votes.length > 0 && (
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
        )}
      </CardContent>
    </Card>
  );
}
