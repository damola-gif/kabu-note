
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useStrategy } from "@/hooks/useStrategies";
import { useSession } from "@/contexts/SessionProvider";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { StrategyVotingSection } from "@/components/strategy/StrategyVotingSection";

export default function StrategyPage() {
  const { strategyId } = useParams<{ strategyId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: sessionLoading } = useSession();

  useEffect(() => {
    if (!sessionLoading && !user) {
      navigate(`/auth?redirect=${location.pathname}`);
    }
  }, [user, sessionLoading, navigate, location.pathname]);
  
  const { data: strategy, isLoading, error } = useStrategy(strategyId!);

  if (isLoading || sessionLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="space-y-3 pt-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-destructive text-center py-8">Error: {error.message}</div>
      </div>
    );
  }
  
  if (!strategy) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center py-10">
          <h2 className="text-xl sm:text-2xl font-bold">Strategy not found</h2>
          <p className="text-muted-foreground text-sm sm:text-base mt-2">
            This strategy may have been deleted, or you might not have permission to view it.
          </p>
        </div>
      </div>
    );
  }

  const imageUrl = strategy.image_path
    ? supabase.storage.from('strategy_images').getPublicUrl(strategy.image_path).data.publicUrl
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-6">
      <article className="prose dark:prose-invert max-w-none prose-sm sm:prose-base">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">{strategy.name}</h1>
        <div className="flex flex-wrap items-center gap-3 mb-6 text-xs sm:text-sm text-muted-foreground not-prose">
          <span className="whitespace-nowrap">Published on {format(new Date(strategy.created_at!), "MMM d, yyyy")}</span>
          {strategy.is_public ? (
            <Badge className="text-xs">Public</Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">Draft</Badge>
          )}
          {strategy.voting_status && (
            <Badge 
              variant={strategy.voting_status === 'approved' ? 'default' : 
                       strategy.voting_status === 'rejected' ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {strategy.voting_status}
            </Badge>
          )}
        </div>
        {imageUrl && (
          <div className="not-prose mb-6">
            <img 
              src={imageUrl} 
              alt={strategy.name} 
              className="w-full rounded-lg max-h-[300px] sm:max-h-[400px] lg:max-h-[500px] object-contain border" 
            />
          </div>
        )}
        <div className="prose-headings:text-lg sm:prose-headings:text-xl lg:prose-headings:text-2xl prose-p:text-sm sm:prose-p:text-base prose-li:text-sm sm:prose-li:text-base">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {strategy.content_markdown || ""}
          </ReactMarkdown>
        </div>
      </article>

      {/* Voting Section - only show for public strategies */}
      {strategy.is_public && (
        <div className="mt-8">
          <StrategyVotingSection strategy={strategy} />
        </div>
      )}
    </div>
  );
}
