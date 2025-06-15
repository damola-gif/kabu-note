
import { StrategyWithProfile } from '@/hooks/useStrategies';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, ThumbsDown, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StrategyVote, useSubmitVote, useUserVote } from '@/hooks/useStrategyVotes';

interface VotingStrategyCardProps {
    strategy: StrategyWithProfile;
}

export function VotingStrategyCard({ strategy }: VotingStrategyCardProps) {
    const navigate = useNavigate();
    const { data: userVote, isLoading: isLoadingUserVote } = useUserVote(strategy.id);
    const submitVoteMutation = useSubmitVote();

    const handleVote = (voteType: 'approve' | 'reject') => {
        submitVoteMutation.mutate({ strategyId: strategy.id, voteType });
    };

    const totalVotes = (strategy.approval_votes || 0) + (strategy.rejection_votes || 0);
    const requiredVotes = strategy.votes_required || 2;

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start gap-2">
                    <div className="flex-grow space-y-1.5 overflow-hidden">
                        <CardTitle className="truncate" title={strategy.name}>{strategy.name}</CardTitle>
                        <CardDescription>
                            by {strategy.profile?.username || '...'}
                        </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/strategies/${strategy.id}`)}>
                        <Eye className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">
                    {strategy.content_markdown || "No content provided."}
                </p>
                <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Votes: {totalVotes} / {requiredVotes}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                        <div className="bg-green-500 h-2 rounded-l-full" style={{ width: `${(strategy.approval_votes || 0) / requiredVotes * 100}%` }}></div>
                        <div className="bg-red-500 h-2 rounded-r-full" style={{ width: `${(strategy.rejection_votes || 0) / requiredVotes * 100}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-green-600">{strategy.approval_votes || 0} Approvals</span>
                        <span className="text-red-600">{strategy.rejection_votes || 0} Rejections</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-4 pt-4 border-t">
                 <div className="flex items-center gap-2 w-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={strategy.profile?.avatar_url || undefined} alt={strategy.profile?.username || 'author'} />
                        <AvatarFallback>{strategy.profile?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{strategy.profile?.username}</span>
                </div>
                {isLoadingUserVote ? <p className="text-sm text-muted-foreground">Loading vote...</p> : (
                    userVote ? (
                        <div className='w-full'>
                            <p className="text-sm text-center font-medium">You voted to <span className={userVote.vote_type === 'approve' ? 'text-green-600' : 'text-red-600'}>{userVote.vote_type}</span>.</p>
                            <Button variant="link" className="w-full h-auto p-1 text-xs" onClick={() => handleVote(userVote.vote_type === 'approve' ? 'reject' : 'approve')}>Change vote</Button>
                        </div>
                    ) : (
                        <div className="flex gap-2 w-full">
                            <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleVote('approve')} disabled={submitVoteMutation.isPending}>
                                <ThumbsUp className="h-4 w-4 mr-2" /> Approve
                            </Button>
                            <Button className="flex-1" variant="destructive" onClick={() => handleVote('reject')} disabled={submitVoteMutation.isPending}>
                                <ThumbsDown className="h-4 w-4 mr-2" /> Reject
                            </Button>
                        </div>
                    )
                )}
            </CardFooter>
        </Card>
    )
}
