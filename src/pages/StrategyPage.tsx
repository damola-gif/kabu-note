
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
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-24" />
        </div>
        
        {/* Content Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-destructive text-center py-8">Error: {error.message}</div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!strategy) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <h2 className="text-xl sm:text-2xl font-bold">Strategy not found</h2>
              <p className="text-muted-foreground text-sm sm:text-base mt-2">
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
    <div className="space-y-6">
      {/* Header similar to Journal page */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Strategy Content Card */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              {strategy.is_public ? (
                <Globe className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
              ) : (
                <Lock className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <CardTitle className="text-2xl sm:text-3xl font-bold leading-tight break-words">
                  {strategy.name}
                </CardTitle>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Published on {format(new Date(strategy.created_at!), "MMM d, yyyy")}</span>
              </div>
              
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
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {imageUrl && (
            <div className="w-full">
              <img 
                src={imageUrl} 
                alt={strategy.name} 
                className="w-full rounded-lg max-h-[300px] sm:max-h-[400px] lg:max-h-[500px] object-contain border" 
              />
            </div>
          )}
          
          <div className="prose dark:prose-invert max-w-none prose-sm sm:prose-base prose-headings:text-lg sm:prose-headings:text-xl lg:prose-headings:text-2xl prose-p:text-sm sm:prose-p:text-base prose-li:text-sm sm:prose-li:text-base">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {strategy.content_markdown || "No content available."}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Voting Section - only show for public strategies */}
      {strategy.is_public && (
        <Card>
          <CardContent className="pt-6">
            <StrategyVotingSection strategy={strategy} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
