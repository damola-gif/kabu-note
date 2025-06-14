
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSession } from "@/contexts/SessionProvider";
import { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { StrategyFormValues } from "@/components/strategy/strategy.schemas";

// Hook to fetch all strategies for the logged-in user
export function useStrategies() {
  const { user } = useSession();
  return useQuery({
    queryKey: ["strategies", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("strategies")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!user,
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
        user_id: user.id,
        image_path: imagePath,
      };
      const { data, error } = await supabase.from("strategies").insert(dataToInsert).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      // Only show default toast for drafts, publish flow has its own toast.
      if (!variables.is_public) {
        toast.success("Strategy created successfully");
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
        image_path: finalImagePath,
      };

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
