
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { useStrategyVotes, useUserVote, useSubmitVote, useRemoveVote } from '@/hooks/useStrategyVotes';
import { useSession } from '@/contexts/SessionProvider';
import { useFollowing } from '@/hooks/useProfile';
import { VotingProgress } from './voting/VotingProgress';
import { OwnerMonitor } from './voting/OwnerMonitor';
import { VotingActions } from './voting/VotingActions';
import { RecentVotes } from './voting/RecentVotes';

interface StrategyVotingSectionProps {
  strategy: Tables<'strategies'>;
}

export function StrategyVotingSection({ strategy }: StrategyVotingSectionProps) {
  const { user } = useSession();

  const { data: votes } = useStrategyVotes(strategy.id);
  const { data: userVote } = useUserVote(strategy.id);
  const { data: followingIds } = useFollowing();
  const submitVoteMutation = useSubmitVote();
  const removeVoteMutation = useRemoveVote();

  // Check if current user can vote (must be following the strategy author, and not the owner)
  const canVote = user && strategy.user_id !== user.id && followingIds?.includes(strategy.user_id);
  const isOwner = user?.id === strategy.user_id;

  const handleSubmitVote = async (voteType: 'approve' | 'reject', comment?: string) => {
    await submitVoteMutation.mutateAsync({
      strategyId: strategy.id,
      voteType,
      comment,
    });
  };

  const handleRemoveVote = () => {
    removeVoteMutation.mutate(strategy.id);
  };

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Community Voting
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <VotingProgress strategy={strategy} />

        {/* Owner Monitoring Section */}
        {isOwner && <OwnerMonitor strategy={strategy} />}

        {/* Voting Actions for Followers */}
        {!isOwner && (
          <VotingActions
            canVote={!!canVote}
            userVote={userVote}
            user={user}
            onSubmitVote={handleSubmitVote}
            onRemoveVote={handleRemoveVote}
            isSubmitting={submitVoteMutation.isPending}
            isRemoving={removeVoteMutation.isPending}
          />
        )}

        {/* Recent Votes */}
        <RecentVotes votes={votes || []} />
      </CardContent>
    </Card>
  );
}
