
// Re-export all strategy hooks from their respective files for backwards compatibility
export type { StrategyWithProfile } from './useStrategiesCore';

export {
  useHashtagSearch,
  useStrategies,
  useStrategy
} from './useStrategiesCore';

export {
  useLikedStrategyIds,
  useBookmarkedStrategyIds,
  useToggleBookmark,
  useToggleLike
} from './useStrategyInteractions';

export {
  useCreateStrategy,
  useUpdateStrategy,
  useDeleteStrategy,
  useForkStrategy
} from './useStrategyCRUD';

export {
  useStrategyTags
} from './useStrategyTags';
