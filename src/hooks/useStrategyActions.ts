
import { useState } from 'react';
import { Tables } from '@/integrations/supabase/types';
import { useDeleteStrategy, useForkStrategy, useToggleLike, useToggleBookmark } from './useStrategies';
import { useFollowUser, useUnfollowUser } from './useProfile';

export function useStrategyActions() {
    const [selectedStrategy, setSelectedStrategy] = useState<Tables<'strategies'> | undefined>();
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

    const deleteMutation = useDeleteStrategy();
    const forkMutation = useForkStrategy();
    const followMutation = useFollowUser();
    const unfollowMutation = useUnfollowUser();
    const toggleLikeMutation = useToggleLike();
    const toggleBookmarkMutation = useToggleBookmark();

    const handleNewStrategy = () => {
        setSelectedStrategy(undefined);
        setIsEditorOpen(true);
    };

    const handleImportStrategy = () => {
        setIsImportDialogOpen(true);
    };

    const handleExportStrategies = () => {
        setIsExportDialogOpen(true);
    };

    const handleEdit = (strategy: Tables<'strategies'>) => {
        setSelectedStrategy(strategy);
        setIsEditorOpen(true);
    };
    
    const handleDelete = (strategy: Tables<'strategies'>) => {
        setSelectedStrategy(strategy);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedStrategy) return;
        deleteMutation.mutate(selectedStrategy.id, {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                setSelectedStrategy(undefined);
            }
        });
    };

    const handleFork = (strategy: Tables<'strategies'>) => {
        forkMutation.mutate(strategy);
    };

    const handleFollowToggle = (profileId: string, isCurrentlyFollowing: boolean) => {
        if (unfollowMutation.isPending || followMutation.isPending) return;
        if (isCurrentlyFollowing) {
            unfollowMutation.mutate(profileId);
        } else {
            followMutation.mutate(profileId);
        }
    };
    
    const handleLikeToggle = (strategyId: string, isLiked: boolean) => {
        toggleLikeMutation.mutate({ strategyId, isLiked });
    };

    const handleBookmarkToggle = (strategyId: string, isBookmarked: boolean) => {
        toggleBookmarkMutation.mutate({ strategyId, isBookmarked });
    };

    return {
        selectedStrategy,
        setSelectedStrategy,
        isEditorOpen,
        setIsEditorOpen,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        isImportDialogOpen,
        setIsImportDialogOpen,
        isExportDialogOpen,
        setIsExportDialogOpen,
        deleteMutation,
        forkMutation,
        followMutation,
        unfollowMutation,
        handleNewStrategy,
        handleImportStrategy,
        handleExportStrategies,
        handleEdit,
        handleDelete,
        confirmDelete,
        handleFork,
        handleFollowToggle,
        handleLikeToggle,
        handleBookmarkToggle
    };
}
