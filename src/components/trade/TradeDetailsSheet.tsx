
import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";

interface TradeDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trade: Tables<"trades"> | null;
}

export function TradeDetailsSheet({ open, onOpenChange, trade }: TradeDetailsSheetProps) {
  if (!trade) {
    return null;
  }

  const formattedOpenedAt = format(new Date(trade.opened_at), "PPP p");
  const formattedClosedAt = trade.closed_at ? format(new Date(trade.closed_at), "PPP p") : "Open";
  const formattedUpdatedAt = format(new Date(trade.updated_at), "PPP p");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Trade Details: {trade.symbol}</SheetTitle>
          <SheetDescription>
            Detailed information about your {trade.side} trade on {trade.symbol}.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="font-semibold text-muted-foreground">Symbol</span>
            <span>{trade.symbol}</span>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="font-semibold text-muted-foreground">Side</span>
            <span className={trade.side === "long" ? "text-green-600" : "text-red-600"}>{trade.side}</span>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="font-semibold text-muted-foreground">Size</span>
            <span>{trade.size}</span>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="font-semibold text-muted-foreground">Entry Price</span>
            <span>${trade.entry_price.toLocaleString()}</span>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="font-semibold text-muted-foreground">Exit Price</span>
            <span>{trade.exit_price ? `$${trade.exit_price.toLocaleString()}` : '–'}</span>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="font-semibold text-muted-foreground">P/L</span>
            <span className={trade.pnl === null ? "" : trade.pnl >= 0 ? "text-green-600" : "text-red-600"}>
              {trade.pnl !== null
                ? `${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : '–'}
            </span>
          </div>
           <div className="grid grid-cols-2 items-center gap-4">
            <span className="font-semibold text-muted-foreground">Opened At</span>
            <span>{formattedOpenedAt}</span>
          </div>
           <div className="grid grid-cols-2 items-center gap-4">
            <span className="font-semibold text-muted-foreground">Closed At</span>
            <span>{formattedClosedAt}</span>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="font-semibold text-muted-foreground">Last Updated</span>
            <span>{formattedUpdatedAt}</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
