
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StrategyWithProfile } from './types';

export function useHashtagSearch(hashtag: string) {
  return useQuery({
    queryKey: ['hashtagSearch', hashtag],
    queryFn: async (): Promise<StrategyWithProfile[]> => {
      if (!hashtag) return [];

      const { data: strategies, error } = await supabase
        .from('strategies')
        .select('*, profile:profiles(id, username, avatar_url)')
        .eq('is_public', true)
        .contains('tags', [hashtag])
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!strategies) return [];

      return strategies.map(s => ({
        ...s,
        profile: Array.isArray(s.profile) ? s.profile[0] : s.profile
      })) as StrategyWithProfile[];
    },
    enabled: !!hashtag,
  });
}
