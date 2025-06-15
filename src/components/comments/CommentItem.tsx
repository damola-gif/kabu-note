
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { CommentWithProfile } from '@/hooks/useComments';

interface CommentItemProps {
  comment: CommentWithProfile;
}

export function CommentItem({ comment }: CommentItemProps) {
  return (
    <div className="flex space-x-3 p-3 border rounded-lg">
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.profile?.avatar_url || ''} />
        <AvatarFallback>
          {comment.profile?.username?.[0]?.toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-sm">
            {comment.profile?.username || 'Anonymous'}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {comment.content}
        </p>
      </div>
    </div>
  );
}
