import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSession } from "@/contexts/SessionProvider";
import { Tables, TablesInsert } from "@/integrations/supabase/types";

export type StrategyVote = Tables<'strategy_votes'>;

// Hook to get votes for a strategy
export function useStrategyVotes(strategyId: string) {
  return useQuery({
    queryKey: ['strategyVotes', strategyId],
    queryFn: async (): Promise<StrategyVote[]> => {
      const { data, error } = await supabase
        .from('strategy_votes')
        .select('*')
        .eq('strategy_id', strategyId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!strategyId,
  });
}

// Hook to get user's vote for a strategy
export function useUserVote(strategyId: string) {
  const { user } = useSession();
  
  return useQuery({
    queryKey: ['userVote', strategyId, user?.id],
    queryFn: async (): Promise<StrategyVote | null> => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('strategy_votes')
        .select('*')
        .eq('strategy_id', strategyId)
        .eq('voter_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!strategyId && !!user,
  });
}

// Hook to get user's votes for a list of strategies
export function useUserVotesForStrategies(strategyIds: string[]) {
    const { user } = useSession();
    
    return useQuery({
        queryKey: ['userVotes', strategyIds, user?.id],
        queryFn: async (): Promise<{ [key: string]: StrategyVote }> => {
            if (!user || strategyIds.length === 0) return {};
            
            const { data, error } = await supabase
                .from('strategy_votes')
                .select('*')
                .in('strategy_id', strategyIds)
                .eq('voter_id', user.id);
            
            if (error) throw error;

            const votesByStrategyId: { [key: string]: StrategyVote } = {};
            data.forEach(vote => {
                votesByStrategyId[vote.strategy_id] = vote;
            });
            return votesByStrategyId;
        },
        enabled: !!user && strategyIds.length > 0,
    });
}

// Hook to submit a vote
export function useSubmitVote() {
  const { user } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ strategyId, voteType, comment }: { 
      strategyId: string; 
      voteType: 'approve' | 'reject'; 
      comment?: string 
    }) => {
      if (!user) throw new Error("You must be logged in to vote");

      const voteData: TablesInsert<'strategy_votes'> = {
        strategy_id: strategyId,
        voter_id: user.id,
        vote_type: voteType,
        comment: comment || null,
      };

      const { data, error } = await supabase
        .from('strategy_votes')
        .upsert(voteData, { onConflict: 'strategy_id,voter_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, { strategyId, voteType }) => {
      queryClient.invalidateQueries({ queryKey: ['strategyVotes', strategyId] });
      queryClient.invalidateQueries({ queryKey: ['userVote', strategyId, user?.id] });
      // Invalidate the list of following strategies to update vote counts
      queryClient.invalidateQueries({ queryKey: ['followingStrategies'] });
      queryClient.invalidateQueries({ queryKey: ['strategy', strategyId] });
      toast.success(`Vote cast successfully!`);
    },
    onError: (error) => {
      toast.error(`Error submitting vote: ${error.message}`);
    },
  });
}

// Hook to remove a vote
export function useRemoveVote() {
  const { user } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (strategyId: string) => {
      if (!user) throw new Error("You must be logged in to remove vote");

      const { error } = await supabase
        .from('strategy_votes')
        .delete()
        .eq('strategy_id', strategyId)
        .eq('voter_id', user.id);

      if (error) throw error;
    },
    onSuccess: (_, strategyId) => {
      queryClient.invalidateQueries({ queryKey: ['strategyVotes', strategyId] });
      queryClient.invalidateQueries({ queryKey: ['userVote', strategyId] });
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
      queryClient.invalidateQueries({ queryKey: ['strategy', strategyId] });
      toast.success("Vote removed successfully!");
    },
    onError: (error) => {
      toast.error(`Error removing vote: ${error.message}`);
    },
  });
}
