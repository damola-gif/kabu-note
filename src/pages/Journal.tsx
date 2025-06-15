
import { useState } from "react";
import { NewTradeDialog } from "@/components/trade/NewTradeDialog";
import { EditTradeDialog } from "@/components/trade/EditTradeDialog";
import { CloseTradeDialog } from "@/components/trade/CloseTradeDialog";
import { TradeDetailsSheet } from "@/components/trade/TradeDetailsSheet";
import { Tables } from "@/integrations/supabase/types";
import { useTrades, useDeleteTrade } from "@/hooks/useTrades";
import { JournalHeader, TradeFilter } from "@/components/journal/JournalHeader";
import { TradesTable } from "@/components/trade/TradesTable";
import { DateRange } from "react-day-picker";
import { startOfDay, endOfDay } from "date-fns";
import { useTwelveData } from "@/contexts/TwelveDataProvider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";

export default function Journal() {
  const [isNewTradeDialogOpen, setIsNewTradeDialogOpen] = useState(false);
  const [isEditTradeDialogOpen, setIsEditTradeDialogOpen] = useState(false);
  const [isCloseTradeDialogOpen, setIsCloseTradeDialogOpen] = useState(false);
  const [isTradeDetailsSheetOpen, setIsTradeDetailsSheetOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Tables<'trades'> | null>(null);
  const [filter, setFilter] = useState<TradeFilter>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const { isConnected } = useTwelveData();

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

  const hasOpenTrades = filteredTrades.some(trade => !trade.closed_at);

  const handleEditClick = (trade: Tables<'trades'>) => {
    if (!trade) {
      console.error('Trade is undefined');
      return;
    }
    setSelectedTrade(trade);
    setIsEditTradeDialogOpen(true);
  };

  const handleCloseClick = (trade: Tables<'trades'>) => {
    if (!trade) {
      console.error('Trade is undefined');
      return;
    }
    setSelectedTrade(trade);
    setIsCloseTradeDialogOpen(true);
  };

  const handleViewDetailsClick = (trade: Tables<'trades'>) => {
    if (!trade) {
      console.error('Trade is undefined');
      return;
    }
    setSelectedTrade(trade);
    setIsTradeDetailsSheetOpen(true);
  };

  // Custom theme classes for cyber/crypto orange style
  const bg = "bg-gradient-to-br from-[#19141c] via-[#191920] to-[#16111b]";
  const cardBg = "bg-[#23202a] bg-opacity-90 border-none shadow-lg";
  const cardAccent = "border-orange-500";
  const strongAccentColor = "text-orange-400";
  const buttonPrimary = "bg-gradient-to-tr from-orange-500 via-orange-400 to-yellow-400 text-white font-bold shadow-orange-500/30 hover:from-orange-400 hover:to-yellow-200";
  const buttonOutline = "border-orange-400 text-orange-400 hover:bg-orange-500/10";
  const fadedText = "text-zinc-400";
  const panelRadius = "rounded-xl";

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto mb-3"></div>
            <p className={clsx(fadedText)}>Loading your trading journal...</p>
          </div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className={clsx("text-lg font-semibold mb-2", strongAccentColor)}>Error loading trades</h3>
          <p className={fadedText}>{error.message}</p>
        </div>
      );
    }
    
    if (trades && trades.length === 0) {
      return (
        <div className={clsx("text-center py-16", cardBg, panelRadius)}>
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-orange-900/30 shadow-xl">
            <Plus className="h-7 w-7 text-orange-400" />
          </div>
          <h3 className={clsx("text-xl font-extrabold mb-2", strongAccentColor)}>No trades yet</h3>
          <p className={clsx(fadedText, "mb-4")}>Start your trading journey by recording your first trade!</p>
          <Button 
            onClick={() => setIsNewTradeDialogOpen(true)}
            className={clsx(buttonPrimary, "px-7 py-2 text-base")}
            size="lg"
          >
            Record Your First Trade
          </Button>
        </div>
      );
    }
    
    if (filteredTrades.length === 0) {
      return (
        <div className={clsx("text-center py-16", cardBg, panelRadius)}>
          <h3 className={clsx("text-lg font-semibold mb-2", strongAccentColor)}>No trades match your filters</h3>
          <p className={fadedText}>Try adjusting your filters or date range to see more trades.</p>
        </div>
      );
    }
    
    return (
      <TradesTable
        trades={filteredTrades}
        onEdit={handleEditClick}
        onDelete={(tradeId) => deleteMutation.mutate(tradeId)}
        onViewDetails={handleViewDetailsClick}
        onClose={handleCloseClick}
        isDeleting={deleteMutation.isPending}
        tableClassName={clsx("rounded-xl shadow-lg", cardBg, "overflow-x-auto")}
      />
    );
  };

  return (
    <div className={clsx("min-h-screen w-full", bg, "pb-8")}>
      <div className="max-w-5xl mx-auto">
        <div className={clsx("min-h-screen border-x", cardBg, panelRadius, "border-orange-600/30")}>
          {/* Header */}
          <div className={clsx("sticky top-0 z-20", "bg-[#19141c]/90 border-b border-orange-700/30 backdrop-blur-lg", panelRadius)}>
            <div className="px-8 py-7 flex items-center justify-between">
              <div>
                <h1 className={clsx("text-2xl font-extrabold text-orange-300 drop-shadow-sm tracking-tight")}>Trading Journal</h1>
                <p className={clsx("text-base mt-1", fadedText)}>Track, analyze, and own your trading performance</p>
              </div>
              <Button 
                onClick={() => setIsNewTradeDialogOpen(true)}
                className={clsx(buttonPrimary, "ml-2 px-5 py-2 text-base")}
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Trade
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            {!isConnected && hasOpenTrades && (
              <Alert variant="destructive" className="mb-7 rounded-lg bg-[#2b2020] border-orange-400/40 text-orange-200">
                <AlertCircle className="h-5 w-5 text-orange-400" />
                <AlertTitle className={clsx(strongAccentColor)}>Live Feed Disconnected</AlertTitle>
                <AlertDescription>
                  Could not connect to the real-time price feed from Twelve Data. Live P&L updates for open trades will not be available.<br />
                  <span className={clsx("text-orange-300")}>Check your API key or network connection.</span>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Filters */}
            <div className="mb-6">
              <JournalHeader 
                filter={filter}
                onFilterChange={setFilter}
                onNewTrade={() => setIsNewTradeDialogOpen(true)}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            </div>
            
            {/* Trades Content */}
            <div className={clsx("rounded-2xl border border-orange-900/30 shadow-lg p-2 bg-[#201920]/90", panelRadius)}>
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
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
        <CloseTradeDialog
            open={isCloseTradeDialogOpen}
            onOpenChange={setIsCloseTradeDialogOpen}
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
    </div>
  );
}
