
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tables } from "@/integrations/supabase/types";
import { EditTradeForm } from "./EditTradeForm";

interface EditTradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trade: Tables<"trades">;
}

export function EditTradeDialog({ open, onOpenChange, trade }: EditTradeDialogProps) {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Trade</DialogTitle>
          <DialogDescription>
            Update the details of your trade. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        {trade && <EditTradeForm trade={trade} onSuccess={handleClose} onCancel={handleClose} />}
      </DialogContent>
    </Dialog>
  );
}
