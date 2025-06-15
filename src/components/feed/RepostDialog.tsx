
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface RepostDialogProps {
  open: boolean;
  onClose: () => void;
  onRepost: (comment: string) => void;
  loading: boolean;
}

export function RepostDialog({ open, onClose, onRepost, loading }: RepostDialogProps) {
  const [comment, setComment] = useState("");

  const handleRepost = () => {
    onRepost(comment);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Post</DialogTitle>
        </DialogHeader>
        <textarea
          className="w-full min-h-24 rounded border p-2 text-sm focus:outline-none focus:ring"
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Add an optional comment..."
          maxLength={280}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleRepost} loading={loading}>
            Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
