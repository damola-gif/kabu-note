
import { Tables } from "@/integrations/supabase/types";

export type StrategyWithProfile = Tables<'strategies'> & {
  profile?: Pick<Tables<'profiles'>, 'id' | 'username' | 'avatar_url'> | null;
};
