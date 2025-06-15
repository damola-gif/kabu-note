
import { Clock } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

interface OwnerMonitorProps {
  strategy: Tables<'strategies'>;
}

export function OwnerMonitor({ strategy }: OwnerMonitorProps) {
  const totalVotes = (strategy.approval_votes || 0) + (strategy.rejection_votes || 0);
  const requiredVotes = strategy.votes_required || 2;
  const votesNeeded = Math.max(0, requiredVotes - totalVotes);
  const majorityNeeded = Math.ceil(requiredVotes / 2);
  const approvalsNeeded = Math.max(0, majorityNeeded - (strategy.approval_votes || 0));

  return (
    <div className="p-3 bg-blue-50 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-800">Strategy Status Monitor</span>
      </div>
      <p className="text-sm text-blue-700">
        Your strategy is being reviewed by your followers. You need at least {requiredVotes} votes (50% of your followers) 
        with majority approval to publish automatically.
        {strategy.voting_status === 'pending' && votesNeeded > 0 && (
          ` Need ${votesNeeded} more vote${votesNeeded !== 1 ? 's' : ''} to meet the minimum requirement.`
        )}
        {strategy.voting_status === 'pending' && votesNeeded === 0 && approvalsNeeded > 0 && (
          ` Need ${approvalsNeeded} more approval${approvalsNeeded !== 1 ? 's' : ''} for majority.`
        )}
      </p>
    </div>
  );
}
