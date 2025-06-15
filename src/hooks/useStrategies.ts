import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSession } from "@/contexts/SessionProvider";
import { TablesInsert, TablesUpdate, Tables } from "@/integrations/supabase/types";
import { StrategyFormValues } from "@/components/strategy/strategy.schemas";

export type StrategyWithProfile = Tables<'strategies'> & {
  profile?: Pick<Tables<'profiles'>, 'id' | 'username' | 'avatar_url'> | null;
};

const STRATEGIES_PER_PAGE = 9;

// Hook to search strategies by hashtag
export function useHashtagSearch(hashtag: string) {
  return useQuery({
    queryKey: ['hashtagSearch', hashtag],
    queryFn: async (): Promise<StrategyWithProfile[]> => {
      if (!hashtag) return [];

      // Use the regular strategies table with proper filtering instead of the RPC function
      const { data: strategies, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('is_public', true)
        .contains('tags', [hashtag])
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!strategies) return [];

      // Get unique user IDs from the fetched strategies
      const userIds = [...new Set(strategies.map(s => s.user_id).filter(Boolean))];
      
      if (userIds.length === 0) {
        return strategies.map(s => ({ ...s, profile: null }));
      }

      // Fetch profiles for those user IDs
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", userIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError.message);
        return strategies.map(s => ({ ...s, profile: null }));
      }

      // Map profiles to strategies
      const profilesById = new Map(profiles.map(p => [p.id, p]));

      return strategies.map(strategy => ({
        ...strategy,
        profile: strategy.user_id ? profilesById.get(strategy.user_id) ?? null : null,
      }));
    },
    enabled: !!hashtag,
  });
}

// Hook to fetch strategies with pagination - ONLY current user's strategies
export function useStrategies() {
  const { user } = useSession();
  
  return useInfiniteQuery({
    queryKey: ["strategies", user?.id],
    queryFn: async ({ pageParam = 0 }): Promise<StrategyWithProfile[]> => {
      if (!user) return [];
      
      const from = pageParam * STRATEGIES_PER_PAGE;
      const to = from + STRATEGIES_PER_PAGE - 1;

      // Step 1: Fetch only current user's strategies
      const { data: strategies, error: strategiesError } = await supabase
        .from("strategies")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (strategiesError) throw new Error(strategiesError.message);
      if (!strategies) return [];

      // Step 2: Fetch current user's profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching user profile:", profileError.message);
        // Return strategies without profile info if profile fetch fails
        return strategies.map(s => ({ ...s, profile: null }));
      }

      // Step 3: Map profile to all strategies
      return strategies.map(strategy => ({
        ...strategy,
        profile: profile,
      }));
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < STRATEGIES_PER_PAGE) {
        return undefined; // No more pages
      }
      return allPages.length;
    },
    enabled: !!user,
  });
}

// Hook to get IDs of strategies liked by the current user
export function useLikedStrategyIds() {
    const { user } = useSession();
    return useQuery({
        queryKey: ['likedStrategyIds', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from('strategy_likes')
                .select('strategy_id')
                .eq('user_id', user.id);
            if (error) throw error;
            return data.map(like => like.strategy_id);
        },
        enabled: !!user,
    });
}

// Hook to get IDs of strategies bookmarked by the current user
export function useBookmarkedStrategyIds() {
    const { user } = useSession();
    return useQuery({
        queryKey: ['bookmarkedStrategyIds', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from('strategy_bookmarks')
                .select('strategy_id')
                .eq('user_id', user.id);
            if (error) throw error;
            return data.map(bookmark => bookmark.strategy_id);
        },
        enabled: !!user,
    });
}

// Hook to toggle bookmark on a strategy
export function useToggleBookmark() {
    const { user } = useSession();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ strategyId, isBookmarked }: { strategyId: string; isBookmarked: boolean }) => {
            if (!user) throw new Error("You must be logged in to bookmark a strategy.");

            if (isBookmarked) {
                const { error } = await supabase.from('strategy_bookmarks').delete().match({ strategy_id: strategyId, user_id: user.id });
                if (error) throw error;
            } else {
                const { error } = await supabase.from('strategy_bookmarks').insert({ strategy_id: strategyId, user_id: user.id });
                if (error) throw error;
            }
        },
        onSuccess: (_, { strategyId, isBookmarked }) => {
            queryClient.invalidateQueries({ queryKey: ['strategies'] });
            queryClient.invalidateQueries({ queryKey: ['bookmarkedStrategyIds', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['strategy', strategyId] });
            toast.success(isBookmarked ? "Removed from bookmarks" : "Added to bookmarks");
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });
}

// Hook to toggle like on a strategy
export function useToggleLike() {
    const { user } = useSession();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ strategyId, isLiked }: { strategyId: string; isLiked: boolean }) => {
            if (!user) throw new Error("You must be logged in to like a strategy.");

            if (isLiked) {
                const { error } = await supabase.from('strategy_likes').delete().match({ strategy_id: strategyId, user_id: user.id });
                if (error) throw error;
            } else {
                const { error } = await supabase.from('strategy_likes').insert({ strategy_id: strategyId, user_id: user.id });
                if (error) throw error;
            }
        },
        onSuccess: (_, { strategyId, isLiked }) => {
            queryClient.invalidateQueries({ queryKey: ['strategies'] });
            queryClient.invalidateQueries({ queryKey: ['likedStrategyIds', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['strategy', strategyId] });
            toast.success(isLiked ? "Unliked strategy" : "Liked strategy");
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });
}

// Hook to fetch a single strategy by its ID
export function useStrategy(id: string) {
  return useQuery({
    queryKey: ["strategy", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("strategies")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        // PostgREST errors are thrown for RLS failures, we can't distinguish them from "not found" easily
        // So we return null and let the component handle it.
        if (error.code === 'PGRST116') {
            return null;
        }
        throw new Error(error.message);
      }
      return data;
    },
    enabled: !!id,
  });
}

// Hook to create a new strategy
export function useCreateStrategy() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newStrategy: StrategyFormValues) => {
      if (!user) throw new Error("User must be logged in to create a strategy");
      
      let imagePath: string | null = null;

      if (newStrategy.image_file && newStrategy.image_file.length > 0) {
        const file = newStrategy.image_file[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('strategy_images').upload(filePath, file);
        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }
        imagePath = filePath;
      }
      
      const dataToInsert: TablesInsert<'strategies'> = {
        name: newStrategy.name,
        content_markdown: newStrategy.content_markdown,
        is_public: newStrategy.is_public,
        is_draft: !newStrategy.is_public,
        user_id: user.id,
        image_path: imagePath,
        win_rate: newStrategy.win_rate,
        tags: newStrategy.tags || [],
        // Initialize voting fields for new strategies
        voting_status: newStrategy.is_public ? 'pending' : null,
        approval_votes: 0,
        rejection_votes: 0,
      };
      const { data, error } = await supabase.from("strategies").insert(dataToInsert).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      // Only show default toast for drafts, publish flow has its own toast.
      if (!variables.is_public) {
        toast.success("Strategy created successfully");
      } else {
        toast.success("Strategy submitted for community voting! Need majority approval from 50% of your followers.");
      }
      queryClient.invalidateQueries({ queryKey: ["strategies", user?.id] });
    },
    onError: (error) => {
      toast.error(`Error creating strategy: ${error.message}`);
    },
  });
}

// Hook to update an existing strategy
export function useUpdateStrategy() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values, originalImagePath }: { id: string; values: StrategyFormValues, originalImagePath?: string | null }) => {
      if (!user) throw new Error("User must be logged in to update a strategy");
      
      let finalImagePath: string | null = originalImagePath || null;

      // Case 1: New image uploaded
      if (values.image_file && values.image_file.length > 0) {
        // If an old image exists, remove it
        if (originalImagePath) {
          await supabase.storage.from('strategy_images').remove([originalImagePath]);
        }
        // Upload the new image
        const file = values.image_file[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('strategy_images').upload(filePath, file);
        if (uploadError) throw uploadError;
        finalImagePath = filePath;
      } 
      // Case 2: Image explicitly removed (form sends image_path: null)
      else if (originalImagePath && values.image_path === null) {
        await supabase.storage.from('strategy_images').remove([originalImagePath]);
        finalImagePath = null;
      }
      
      const updateData: TablesUpdate<'strategies'> = {
        name: values.name,
        content_markdown: values.content_markdown,
        is_public: values.is_public,
        is_draft: !values.is_public,
        image_path: finalImagePath,
        win_rate: values.win_rate,
        tags: values.tags || [],
        last_saved_at: new Date().toISOString(),
      };

      // Reset voting status if publishing for the first time
      if (values.is_public) {
        updateData.voting_status = 'pending';
        updateData.approval_votes = 0;
        updateData.rejection_votes = 0;
      }

      const { error } = await supabase
        .from("strategies")
        .update(updateData)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      // Only show default toast for drafts, publish flow has its own toast.
      if (!variables.values.is_public) {
        toast.success("Strategy updated successfully!");
      } else {
        toast.success("Strategy submitted for community voting! Need majority approval from 50% of your followers.");
      }
      queryClient.invalidateQueries({ queryKey: ["strategies", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["strategy", variables.id] });
    },
    onError: (error) => {
      toast.error(`Error updating strategy: ${error.message}`);
    },
  });
}

// Hook to delete a strategy
export function useDeleteStrategy() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("strategies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Strategy deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["strategies", user?.id] });
    },
    onError: (error) => {
      toast.error(`Error deleting strategy: ${error.message}`);
    },
  });
}

// Hook to fork a strategy
export function useForkStrategy() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (strategyToFork: Tables<'strategies'>) => {
      if (!user) throw new Error("User must be logged in to fork a strategy");
      
      const dataToInsert: TablesInsert<'strategies'> = {
        name: `Fork of ${strategyToFork.name}`,
        content_markdown: strategyToFork.content_markdown,
        is_public: false, // Forks are private by default
        is_draft: true,
        user_id: user.id,
        win_rate: strategyToFork.win_rate,
        tags: strategyToFork.tags || [],
        image_path: null, // Don't copy image
      };
      
      const { data, error } = await supabase.from("strategies").insert(dataToInsert).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Strategy forked successfully! It's now in your drafts.");
      queryClient.invalidateQueries({ queryKey: ["strategies"] });
    },
    onError: (error) => {
      toast.error(`Error forking strategy: ${error.message}`);
    },
  });
}

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
