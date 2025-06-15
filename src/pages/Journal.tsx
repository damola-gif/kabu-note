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

  // Check if there are any open trades that would benefit from live data
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

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your trading journal...</p>
          </div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error loading trades</h3>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      );
    }
    
    if (trades && trades.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No trades yet</h3>
          <p className="text-muted-foreground mb-4">Start your trading journey by recording your first trade.</p>
          <Button onClick={() => setIsNewTradeDialogOpen(true)}>
            Record Your First Trade
          </Button>
        </div>
      );
    }
    
    if (filteredTrades.length === 0) {
      return (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No trades match your filters</h3>
          <p className="text-muted-foreground">Try adjusting your filters or date range to see more trades.</p>
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
      />
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="border-x border-border min-h-screen bg-card">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b border-border">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-foreground">Trading Journal</h1>
                  <p className="text-sm text-muted-foreground mt-1">Track and analyze your trading performance</p>
                </div>
                <Button 
                  onClick={() => setIsNewTradeDialogOpen(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Trade
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {!isConnected && hasOpenTrades && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Live Feed Disconnected</AlertTitle>
                <AlertDescription>
                  Could not connect to the real-time price feed from Twelve Data. Live P&L updates for open trades will not be available. This might be due to an API key issue or network connection problem.
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
            <div className="bg-card rounded-lg border border-border">
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
