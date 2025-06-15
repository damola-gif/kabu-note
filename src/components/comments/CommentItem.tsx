
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { CommentWithProfile } from '@/hooks/useComments';
import { useNavigate } from 'react-router-dom';

interface CommentItemProps {
  comment: CommentWithProfile;
}

export function CommentItem({ comment }: CommentItemProps) {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (comment.profile?.username) {
      navigate(`/u/${comment.profile.username}`);
    }
  };

  return (
    <div className="flex space-x-3 p-3 border rounded-lg">
      <div 
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={handleProfileClick}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.profile?.avatar_url || ''} />
          <AvatarFallback>
            {comment.profile?.username?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleProfileClick}
            className="font-medium text-sm hover:underline text-blue-600 hover:text-blue-800 transition-colors"
          >
            @{comment.profile?.username || 'Anonymous'}
          </button>
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
