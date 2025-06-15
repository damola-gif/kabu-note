
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface VoteFormProps {
  selectedVote: 'approve' | 'reject';
  onSubmit: (comment?: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function VoteForm({ selectedVote, onSubmit, onCancel, isSubmitting }: VoteFormProps) {
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    onSubmit(comment || undefined);
    setComment('');
  };

  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-center gap-2">
        {selectedVote === 'approve' ? (
          <ThumbsUp className="h-4 w-4 text-green-600" />
        ) : (
          <ThumbsDown className="h-4 w-4 text-red-600" />
        )}
        <span className="font-medium">
          {selectedVote === 'approve' ? 'Approving' : 'Rejecting'} this strategy
        </span>
      </div>
      <Textarea
        placeholder="Add a comment (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
      />
      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Vote'}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
