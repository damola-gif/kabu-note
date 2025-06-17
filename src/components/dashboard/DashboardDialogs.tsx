
import { Tables } from "@/integrations/supabase/types";
import { EditTradeDialog } from "@/components/trade/EditTradeDialog";
import { CloseTradeDialog } from "@/components/trade/CloseTradeDialog";
import { TradeDetailsSheet } from "@/components/trade/TradeDetailsSheet";

interface DashboardDialogsProps {
  editingTrade: Tables<"trades"> | null;
  closingTrade: Tables<"trades"> | null;
  viewingTrade: Tables<"trades"> | null;
  onEditingTradeChange: (trade: Tables<"trades"> | null) => void;
  onClosingTradeChange: (trade: Tables<"trades"> | null) => void;
  onViewingTradeChange: (trade: Tables<"trades"> | null) => void;
}

export function DashboardDialogs({
  editingTrade,
  closingTrade,
  viewingTrade,
  onEditingTradeChange,
  onClosingTradeChange,
  onViewingTradeChange
}: DashboardDialogsProps) {
  return (
    <>
      {editingTrade && (
        <EditTradeDialog
          trade={editingTrade}
          open={!!editingTrade}
          onOpenChange={(open) => !open && onEditingTradeChange(null)}
        />
      )}

      {closingTrade && (
        <CloseTradeDialog
          trade={closingTrade}
          open={!!closingTrade}
          onOpenChange={(open) => !open && onClosingTradeChange(null)}
        />
      )}

      {viewingTrade && (
        <TradeDetailsSheet
          trade={viewingTrade}
          open={!!viewingTrade}
          onOpenChange={(open) => !open && onViewingTradeChange(null)}
        />
      )}
    </>
  );
}
