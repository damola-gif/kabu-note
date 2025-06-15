
import { StrategyWithProfile } from '@/hooks/useStrategies';
import { Tables } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal, Eye, Edit, Trash2, Copy, Globe, Lock, ThumbsUp, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UseMutationResult } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface StrategyCardProps {
    strategy: StrategyWithProfile;
    isOwnStrategy: boolean;
    canFollow: boolean;
    isFollowing: boolean;
    isLiked: boolean;
    onEdit: (strategy: Tables<'strategies'>) => void;
    onDelete: (strategy: Tables<'strategies'>) => void;
    onFork: (strategy: Tables<'strategies'>) => void;
    onFollowToggle: (profileId: string, isCurrentlyFollowing: boolean) => void;
    onLikeToggle: (strategyId: string, isLiked: boolean) => void;
    forkMutation: UseMutationResult<any, Error, Tables<'strategies'>, unknown>;
    followMutation: UseMutationResult<void, Error, string, unknown>;
    unfollowMutation: UseMutationResult<void, Error, string, unknown>;
}

export function StrategyCard({
    strategy,
    isOwnStrategy,
    canFollow,
    isFollowing,
    isLiked,
    onEdit,
    onDelete,
    onFork,
    onFollowToggle,
    onLikeToggle,
    forkMutation,
    followMutation,
    unfollowMutation
}: StrategyCardProps) {
    const navigate = useNavigate();
    const imageUrl = strategy.image_path ? supabase.storage.from('strategy_images').getPublicUrl(strategy.image_path).data.publicUrl : null;

    return (
        <Card key={strategy.id} className="flex flex-col">
            {imageUrl && (
                <div className="aspect-video w-full border-b">
                    <img src={imageUrl} alt={strategy.name} className="w-full h-full object-cover" />
                </div>
            )}
            <CardHeader>
                <div className="flex justify-between items-start gap-2">
                    <div className="flex-grow space-y-1.5 overflow-hidden">
                        <div className="flex items-center gap-2">
                            <span title={strategy.is_public ? "Public" : "Private"}>
                                {strategy.is_public ? <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                            </span>
                            <CardTitle className="truncate" title={strategy.name}>{strategy.name}</CardTitle>
                        </div>
                        <CardDescription className="flex items-center gap-2">
                            {strategy.win_rate && (
                                <Badge variant="outline" className="border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                                    {strategy.win_rate}% Win Rate
                                </Badge>
                            )}
                        </CardDescription>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="flex-shrink-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/strategies/${strategy.id}`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {isOwnStrategy ? (
                                <>
                                    <DropdownMenuItem onClick={() => onEdit(strategy)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        <span>Edit</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onDelete(strategy)} className="text-destructive focus:text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <span>Delete</span>
                                    </DropdownMenuItem>
                                </>
                            ) : (
                                strategy.is_public && (
                                    <DropdownMenuItem onClick={() => onFork(strategy)} disabled={forkMutation.isPending}>
                                        <Copy className="mr-2 h-4 w-4" />
                                        <span>{forkMutation.isPending ? 'Forking...' : 'Fork'}</span>
                                    </DropdownMenuItem>
                                )
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">
                    {strategy.content_markdown || "No content."}
                </p>
            </CardContent>
            <CardFooter className={cn("flex flex-col items-start gap-4 pt-4")}>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Button variant="ghost" size="sm" className="flex items-center gap-1 px-2" onClick={() => onLikeToggle(strategy.id, isLiked)}>
                         <ThumbsUp className={cn("h-4 w-4", isLiked && "fill-blue-500 text-blue-500")} />
                         <span>{strategy.likes_count ?? 0}</span>
                    </Button>
                     <div className="flex items-center gap-1">
                         <MessageCircle className="h-4 w-4" />
                         <span>{strategy.comments_count ?? 0}</span>
                     </div>
                </div>
                {canFollow && (
                    <div className="flex items-center justify-between w-full pt-4 border-t">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={strategy.profile?.avatar_url || undefined} alt={strategy.profile?.username || 'author'} />
                                <AvatarFallback>{strategy.profile?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{strategy.profile?.username}</span>
                        </div>
                        <Button
                            variant={isFollowing ? 'secondary' : 'outline'}
                            size="sm"
                            onClick={() => onFollowToggle(strategy.profile!.id, !!isFollowing)}
                            disabled={followMutation.isPending || unfollowMutation.isPending}
                        >
                            {isFollowing ? 'Unfollow' : 'Follow'}
                        </Button>
                    </div>
                )}
            </CardFooter>
        </Card>
    )
}
