
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Hook to get all unique tags from strategies
export function useStrategyTags() {
  return useQuery({
    queryKey: ['strategyTags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategies')
        .select('tags')
        .not('tags', 'is', null);
      
      if (error) throw error;
      
      const allTags = new Set<string>();
      data.forEach(strategy => {
        if (strategy.tags) {
          strategy.tags.forEach(tag => allTags.add(tag));
        }
      });
      
      return Array.from(allTags).sort();
    },
  });
}
