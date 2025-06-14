
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tables } from "@/integrations/supabase/types";
import { CloseTradeForm } from "./CloseTradeForm";

interface CloseTradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trade: Tables<"trades">;
}

export function CloseTradeDialog({ open, onOpenChange, trade }: CloseTradeDialogProps) {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Close Trade: {trade.symbol}</DialogTitle>
          <DialogDescription>
            Enter the exit price to close this trade. This will calculate the final P/L.
          </DialogDescription>
        </DialogHeader>
        {trade && <CloseTradeForm trade={trade} onSuccess={handleClose} onCancel={handleClose} />}
      </DialogContent>
    </Dialog>
  );
}
