
import { useParams, Navigate } from "react-router-dom";
import { useStrategy } from "@/hooks/useStrategies";
import { useSession } from "@/contexts/SessionProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, TrendingUp, BookOpen, Users } from "lucide-react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { CommentSection } from "@/components/comments/CommentSection";
import { StrategyVotingSection } from "@/components/strategy/StrategyVotingSection";
import { useNavigate } from "react-router-dom";

export default function StrategyPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useSession();
  const navigate = useNavigate();
  const { data: strategy, isLoading, error } = useStrategy(id!);

  if (!id) {
    return <Navigate to="/strategies" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="border-x border-border min-h-screen bg-white">
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-border">
              <div className="px-6 py-4">
                <Skeleton className="h-6 w-32" />
              </div>
            </div>
            <div className="px-6 py-8 space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !strategy) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="border-x border-border min-h-screen bg-white">
            <div className="px-6 py-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Strategy Not Found</h2>
                <p className="text-gray-600 mb-4">
                  The strategy you're looking for doesn't exist or you don't have permission to view it.
                </p>
                <Button onClick={() => window.history.back()}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === strategy.user_id;

  const handleProfileClick = () => {
    if (strategy.profile?.username) {
      navigate(`/u/${strategy.profile.username}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="border-x border-border min-h-screen bg-white">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-border">
            <div className="px-6 py-4">
              <Button 
                variant="ghost" 
                onClick={() => window.history.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Strategies
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8 space-y-8">
            {/* Strategy Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-gray-600">Strategy</span>
                  </div>
                  <Badge 
                    variant={strategy.is_public ? "default" : "secondary"}
                    className={strategy.is_public ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
                  >
                    {strategy.is_public ? "Published" : "Draft"}
                  </Badge>
                  {strategy.voting_status && strategy.voting_status !== 'pending' && (
                    <Badge 
                      variant={strategy.voting_status === 'approved' ? "default" : "destructive"}
                      className={
                        strategy.voting_status === 'approved' 
                          ? "bg-blue-100 text-blue-800" 
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {strategy.voting_status === 'approved' ? 'Community Approved' : 'Community Rejected'}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(strategy.created_at), "MMM d, yyyy")}
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900">{strategy.name}</h1>

              {/* Author Info */}
              {strategy.profile && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">by</span>
                  <button 
                    onClick={handleProfileClick}
                    className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    @{strategy.profile.username}
                  </button>
                </div>
              )}

              {/* Strategy Stats */}
              <div className="flex items-center gap-6 text-sm text-gray-600">
                {strategy.win_rate && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>{strategy.win_rate}% Win Rate</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{strategy.likes_count || 0} likes</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>{strategy.comments_count || 0} comments</span>
                </div>
              </div>

              {/* Tags */}
              {strategy.tags && strategy.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {strategy.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-blue-600 border-blue-200">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Strategy Image */}
            {strategy.image_path && (
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <img 
                  src={strategy.image_path} 
                  alt={strategy.name}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            {/* Strategy Content */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl">Strategy Details</CardTitle>
              </CardHeader>
              <CardContent>
                {strategy.content_markdown ? (
                  <div className="prose prose-gray max-w-none">
                    <ReactMarkdown>{strategy.content_markdown}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No strategy details provided.</p>
                )}
              </CardContent>
            </Card>

            {/* Voting Section - Only show if strategy is not published and user is not the owner */}
            {!strategy.is_public && !isOwner && (
              <StrategyVotingSection strategy={strategy} />
            )}

            {/* Comments Section */}
            <CommentSection strategyId={strategy.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
