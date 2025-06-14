import { useState } from "react";
import { NewTradeDialog } from "@/components/trade/NewTradeDialog";
import { EditTradeDialog } from "@/components/trade/EditTradeDialog";
import { TradeDetailsSheet } from "@/components/trade/TradeDetailsSheet";
import { Tables } from "@/integrations/supabase/types";
import { useTrades, useDeleteTrade } from "@/hooks/useTrades";
import { JournalHeader, TradeFilter } from "@/components/journal/JournalHeader";
import { TradesTable } from "@/components/trade/TradesTable";
import { DateRange } from "react-day-picker";
import { startOfDay, endOfDay } from "date-fns";

export default function Journal() {
  const [isNewTradeDialogOpen, setIsNewTradeDialogOpen] = useState(false);
  const [isEditTradeDialogOpen, setIsEditTradeDialogOpen] = useState(false);
  const [isTradeDetailsSheetOpen, setIsTradeDetailsSheetOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Tables<'trades'> | null>(null);
  const [filter, setFilter] = useState<TradeFilter>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const {
    data: trades,
    isLoading,
    error,
  } = useTrades();

  const deleteMutation = useDeleteTrade();

  const filteredTrades =
    trades?.filter((trade) => {
      const sideMatch = filter === "all" || trade.side === filter;

      let dateMatch = true;
      if (dateRange?.from) {
        const tradeDate = new Date(trade.opened_at);
        const fromDate = startOfDay(dateRange.from);
        const toDate = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
        dateMatch = tradeDate >= fromDate && tradeDate <= toDate;
      }
      
      return sideMatch && dateMatch;
    }) ?? [];

  const handleEditClick = (trade: Tables<'trades'>) => {
    setSelectedTrade(trade);
    setIsEditTradeDialogOpen(true);
  };

  const handleViewDetailsClick = (trade: Tables<'trades'>) => {
    setSelectedTrade(trade);
    setIsTradeDetailsSheetOpen(true);
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center text-muted-foreground py-7">Loading trades...</div>;
    }
    if (error) {
      return <div className="text-center text-destructive py-7">Error loading trades: {error.message}</div>;
    }
    if (trades && trades.length === 0) {
      return <div className="text-center text-muted-foreground py-7">No trades yet.</div>;
    }
    if (filteredTrades.length === 0) {
      return <div className="text-center text-muted-foreground py-7">No trades match the current filter.</div>;
    }
    return (
      <TradesTable
        trades={filteredTrades}
        onEdit={handleEditClick}
        onDelete={(tradeId) => deleteMutation.mutate(tradeId)}
        onViewDetails={handleViewDetailsClick}
        isDeleting={deleteMutation.isPending}
      />
    );
  };

  return (
    <>
      <JournalHeader 
        filter={filter}
        onFilterChange={setFilter}
        onNewTrade={() => setIsNewTradeDialogOpen(true)}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />
      
      <div className="bg-card rounded-lg shadow">
        {renderContent()}
      </div>

      <NewTradeDialog
        open={isNewTradeDialogOpen}
        onOpenChange={setIsNewTradeDialogOpen}
      />
      {selectedTrade && (
        <EditTradeDialog
            open={isEditTradeDialogOpen}
            onOpenChange={setIsEditTradeDialogOpen}
            trade={selectedTrade}
        />
      )}
      {selectedTrade && (
        <TradeDetailsSheet
            open={isTradeDetailsSheetOpen}
            onOpenChange={setIsTradeDetailsSheetOpen}
            trade={selectedTrade}
        />
      )}
    </>
  );
}
