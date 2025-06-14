
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useStrategy } from "@/hooks/useStrategies";
import { useSession } from "@/contexts/SessionProvider";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

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
      <div className="space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
        <div className="space-y-2 pt-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-6 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive">Error: {error.message}</div>;
  }
  
  if (!strategy) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">Strategy not found</h2>
        <p className="text-muted-foreground">
          This strategy may have been deleted, or you might not have permission to view it.
        </p>
      </div>
    );
  }

  return (
    <article className="prose dark:prose-invert max-w-none">
      <h1>{strategy.name}</h1>
      <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
        <span>Published on {format(new Date(strategy.created_at), "PPP")}</span>
        {strategy.is_public ? <Badge>Public</Badge> : <Badge variant="secondary">Draft</Badge>}
      </div>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {strategy.content_markdown || ""}
      </ReactMarkdown>
    </article>
  );
}
