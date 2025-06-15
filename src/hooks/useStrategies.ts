
export type { StrategyWithProfile } from './strategies/types';

// Re-export all core strategy hooks
export { useHashtagSearch } from './strategies/useHashtagSearch';
export { useMyStrategies as useStrategies } from './strategies/useMyStrategies';
export { useSingleStrategy as useStrategy } from './strategies/useSingleStrategy';
export { usePublicStrategies } from './strategies/usePublicStrategies';
export { useFollowingStrategies } from './strategies/useFollowingStrategies';

// Re-export strategy interaction hooks
export {
  useLikedStrategyIds,
  useBookmarkedStrategyIds,
  useToggleBookmark,
  useToggleLike,
} from './useStrategyInteractions';

// Re-export CRUD hooks
export {
  useCreateStrategy,
  useUpdateStrategy,
  useDeleteStrategy,
  useForkStrategy,
} from './useStrategyCRUD';

// Re-export strategy tags hook
export { useStrategyTags } from './useStrategyTags';
