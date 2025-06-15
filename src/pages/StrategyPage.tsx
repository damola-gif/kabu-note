
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
import { ArrowLeft, Globe, Lock, Calendar, Share2 } from "lucide-react";
import { toast } from "sonner";

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

  const handleShare = () => {
    const strategyUrl = window.location.href;
    navigator.clipboard.writeText(strategyUrl).then(() => {
        toast.success("Strategy link copied to clipboard!");
    }).catch(err => {
        toast.error("Failed to copy link.");
        console.error("Failed to copy link:", err);
    });
  };

  if (isLoading || sessionLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="border-x border-border min-h-screen">
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
              <div className="px-4 py-3 flex items-center justify-between">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
            <div className="p-4 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="border-x border-border min-h-screen">
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
              <div className="px-4 py-3">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </div>
            </div>
            <div className="p-4">
              <div className="text-destructive text-center py-6 text-sm">Error: {error.message}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="border-x border-border min-h-screen">
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
              <div className="px-4 py-3">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </div>
            </div>
            <div className="p-4">
              <div className="text-center py-8">
                <h2 className="text-lg font-bold">Strategy not found</h2>
                <p className="text-muted-foreground text-sm mt-2">
                  This strategy may have been deleted, or you might not have permission to view it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const imageUrl = strategy.image_path
    ? supabase.storage.from('strategy_images').getPublicUrl(strategy.image_path).data.publicUrl
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="border-x border-border min-h-screen">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
            <div className="px-4 py-3 flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Strategy Header */}
            <div className="border-b border-border pb-4 mb-4">
              <div className="flex items-start gap-2 mb-3">
                {strategy.is_public ? (
                  <Globe className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                )}
                <h1 className="text-xl font-bold leading-tight break-words">
                  {strategy.name}
                </h1>
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

            {/* Strategy Content */}
            <div className="space-y-4">
              {/* Strategy Image */}
              {imageUrl && (
                <div className="rounded-2xl overflow-hidden border border-border">
                  <img
                    src={imageUrl}
                    alt={strategy.name}
                    className="w-full max-h-96 object-contain"
                  />
                </div>
              )}

              {/* Markdown Content */}
              <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed prose-headings:text-base prose-headings:font-semibold prose-headings:mb-2 prose-p:mb-3 prose-li:mb-1 break-words">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {strategy.content_markdown || "No content available."}
                </ReactMarkdown>
              </div>
            </div>

            {/* Voting Section */}
            {strategy.is_public && (
              <div className="border-t border-border pt-4 mt-6">
                <StrategyVotingSection strategy={strategy} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
