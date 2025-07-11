
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSession } from "@/contexts/SessionProvider";
import { TablesInsert, TablesUpdate, Tables } from "@/integrations/supabase/types";
import { StrategyFormValues } from "@/components/strategy/strategy.schemas";

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
      // 1. Fetch image_path for the strategy
      const { data: strategy, error: fetchErr } = await supabase
        .from("strategies")
        .select("image_path")
        .eq("id", id)
        .maybeSingle();

      if (fetchErr) throw fetchErr;

      // 2. Delete associated image if exists
      if (strategy?.image_path) {
        try {
          await supabase.storage.from('strategy_images').remove([strategy.image_path]);
        } catch (err) {
          // Continue even if image removal fails (still delete strategy)
          console.warn('Error deleting strategy image:', err);
        }
      }

      // 3. Delete the strategy itself
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
