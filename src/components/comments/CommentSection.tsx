
import { useState } from 'react';
import { useComments, useCreateComment } from '@/hooks/useComments';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import { useSession } from '@/contexts/SessionProvider';

interface CommentSectionProps {
  strategyId: string;
}

export function CommentSection({ strategyId }: CommentSectionProps) {
  const { user } = useSession();
  const { data: comments = [], isLoading } = useComments(strategyId);
  const createCommentMutation = useCreateComment();
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleSubmitComment = async (content: string) => {
    if (!user) return;
    
    await createCommentMutation.mutateAsync({
      strategyId,
      content,
    });
    setIsFormVisible(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Comments ({comments.length})
          </div>
          {user && !isFormVisible && (
            <button
              onClick={() => setIsFormVisible(true)}
              className="text-sm text-primary hover:underline"
            >
              Add Comment
            </button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isFormVisible && (
          <CommentForm
            onSubmit={handleSubmitComment}
            onCancel={() => setIsFormVisible(false)}
            isSubmitting={createCommentMutation.isPending}
          />
        )}
        
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">
            Loading comments...
          </div>
        ) : (
          <CommentList comments={comments} />
        )}
      </CardContent>
    </Card>
  );
}
