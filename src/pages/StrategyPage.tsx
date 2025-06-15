
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useStrategy } from "@/hooks/useStrategies";
import { useSession } from "@/contexts/SessionProvider";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { StrategyVotingSection } from "@/components/strategy/StrategyVotingSection";
import { ArrowLeft, Globe, Lock, Calendar } from "lucide-react";

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
      <div className="space-y-4 w-full max-w-full overflow-x-hidden">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-20" />
        </div>
        <Card className="w-full max-w-full">
          <CardHeader className="pb-3">
            <Skeleton className="h-6 w-3/4" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-16" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 w-full max-w-full overflow-x-hidden">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </div>
        <Card className="w-full max-w-full">
          <CardContent className="pt-4">
            <div className="text-destructive text-center py-6 text-sm">Error: {error.message}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="space-y-4 w-full max-w-full overflow-x-hidden">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </div>
        <Card className="w-full max-w-full">
          <CardContent className="pt-4">
            <div className="text-center py-8">
              <h2 className="text-lg font-bold">Strategy not found</h2>
              <p className="text-muted-foreground text-sm mt-2">
                This strategy may have been deleted, or you might not have permission to view it.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const imageUrl = strategy.image_path
    ? supabase.storage.from('strategy_images').getPublicUrl(strategy.image_path).data.publicUrl
    : null;

  return (
    <div className="space-y-4 w-full max-w-full overflow-x-hidden">
      {/* Compact Header */}
      <div className="flex items-center justify-between py-2 px-0">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Strategy Content Card */}
      <Card className="w-full max-w-full mx-0">
        <CardHeader className="pb-3 px-3 sm:px-4">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              {strategy.is_public ? (
                <Globe className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg sm:text-xl font-bold leading-tight break-words">
                  {strategy.name}
                </CardTitle>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(strategy.created_at!), "MMM d, yyyy")}</span>
              </div>
              {strategy.is_public ? (
                <Badge className="text-xs h-5">Public</Badge>
              ) : (
                <Badge variant="secondary" className="text-xs h-5">Draft</Badge>
              )}
              {strategy.voting_status && (
                <Badge
                  variant={strategy.voting_status === 'approved' ? 'default' :
                    strategy.voting_status === 'rejected' ? 'destructive' : 'secondary'}
                  className="text-xs h-5"
                >
                  {strategy.voting_status}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 px-3 sm:px-4 pb-4 w-full max-w-full">
          {/* Strategy Image */}
          {imageUrl && (
            <div className="w-full max-w-full">
              <img
                src={imageUrl}
                alt={strategy.name}
                className="w-full max-w-full rounded-md max-h-44 sm:max-h-64 object-contain border"
                style={{ display: 'block', margin: 0, padding: 0 }}
              />
            </div>
          )}

          {/* Markdown Content */}
          <div className="w-full max-w-full">
            <div className="prose dark:prose-invert max-w-full text-sm leading-relaxed prose-headings:text-base prose-headings:font-semibold prose-headings:mb-2 prose-p:mb-3 prose-li:mb-1 break-words">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {strategy.content_markdown || "No content available."}
              </ReactMarkdown>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voting Section */}
      {strategy.is_public && (
        <Card className="w-full max-w-full mx-0">
          <CardContent className="pt-4 px-3 sm:px-4 pb-4">
            <StrategyVotingSection strategy={strategy} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
