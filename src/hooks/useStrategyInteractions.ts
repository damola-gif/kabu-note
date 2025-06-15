
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSession } from "@/contexts/SessionProvider";

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
