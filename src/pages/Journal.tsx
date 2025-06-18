
import { useState, useMemo } from "react";
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
import { AlertCircle, Plus, BookOpen, UploadCloud, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/contexts/SessionProvider";
import { useStrategies, useUpdateStrategy } from "@/hooks/useStrategies";
import { toast } from "@/hooks/use-toast";
import { ImageEditor } from "@/components/common/ImageEditor";
import { StrategyEditorDialog } from "@/components/strategy/StrategyEditorDialog";

export default function Journal() {
  const [isNewTradeDialogOpen, setIsNewTradeDialogOpen] = useState(false);
  const [isEditTradeDialogOpen, setIsEditTradeDialogOpen] = useState(false);
  const [isCloseTradeDialogOpen, setIsCloseTradeDialogOpen] = useState(false);
  const [isTradeDetailsSheetOpen, setIsTradeDetailsSheetOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Tables<'trades'> | null>(null);
  const [filter, setFilter] = useState<TradeFilter>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [editingJournal, setEditingJournal] = useState<string | null>(null);

  const { isConnected } = useTwelveData();
  const { user } = useSession();
  const { data: strategyPages, isLoading: strategiesLoading } = useStrategies();
  const [editorImageUrl, setEditorImageUrl] = useState<string | undefined>();

  // Only fetch own draft and private strategies
  const ownDraftStrategies = useMemo(() => {
    if (!strategyPages || !user) return [];
    return strategyPages.pages.flat().filter(
      (s) => s.user_id === user.id && (!s.is_public || s.is_draft)
    );
  }, [strategyPages, user]);

  const { data: trades, isLoading, error } = useTrades();
  const deleteMutation = useDeleteTrade();
  const updateStrategy = useUpdateStrategy();

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

  // Journal (draft strategy) publishing
  const handlePublishStrategy = (strategy) => {
    if (strategy.is_public || strategy.voting_status === 'pending') return;
    updateStrategy.mutate(
      {
        id: strategy.id,
        values: {
          ...strategy,
          is_public: true,
        },
        originalImagePath: strategy.image_path,
      },
      {
        onSuccess: () => {
          toast({ title: "Journal submitted for community voting! Need majority approval from 50% of your followers." });
        },
        onError: (err) => {
          toast({ title: "Error submitting for voting: " + err.message });
        },
      }
    );
  };

  // Helper handlers for trade actions
  const handleEditClick = (trade: Tables<'trades'>) => {
    setSelectedTrade(trade);
    setIsEditTradeDialogOpen(true);
  };

  const handleCloseClick = (trade: Tables<'trades'>) => {
    setSelectedTrade(trade);
    setIsCloseTradeDialogOpen(true);
  };

  const handleViewDetailsClick = (trade: Tables<'trades'>) => {
    setSelectedTrade(trade);
    setIsTradeDetailsSheetOpen(true);
  };

  const handleDeleteTrade = (tradeId: string) => {
    if (confirm("Are you sure you want to delete this trade?")) {
      deleteMutation.mutate(tradeId);
    }
  };

  // Main content tabs: Journals or Trades
  const [tab, setTab] = useState<'journal' | 'trades'>('journal');

  return (
    <div className="min-h-screen w-full bg-gray-50 pb-8">
      <div className="max-w-5xl mx-auto">
        <div className="min-h-screen bg-white shadow-sm rounded-lg">
          {/* Header */}
          <div className="sticky top-0 z-20 bg-white border-b border-gray-200 rounded-t-lg">
            <div className="px-8 py-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Trading Journal</h1>
                <p className="text-gray-600 mt-1">Track, analyze, and own your trading performance</p>
              </div>
              <Button 
                onClick={() => setIsNewTradeDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Trade
              </Button>
            </div>
            <div className="flex px-8 pb-3 gap-2">
              <button
                onClick={() => setTab('journal')}
                className={`py-2 px-6 rounded-t-lg font-medium focus:outline-none transition border-b-2 ${
                  tab === 'journal'
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                Journals
              </button>
              <button
                onClick={() => setTab('trades')}
                className={`py-2 px-6 rounded-t-lg font-medium focus:outline-none transition border-b-2 ${
                  tab === 'trades'
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                Trades
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            {!isConnected && hasOpenTrades && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Live Feed Disconnected</AlertTitle>
                <AlertDescription>
                  Could not connect to the real-time price feed from Twelve Data. Live P&L updates for open trades will not be available.
                </AlertDescription>
              </Alert>
            )}

            {tab === 'journal' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Your Private Journals
                  </h2>
                  <p className="text-gray-600 text-sm mb-4">
                    Only you can view and edit your journals. Submit one to promote it as a strategy for voting.
                  </p>
                  <Button
                    onClick={() => setEditingJournal("NEW")}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <BookOpen className="w-4 h-4 mr-2" /> New Journal Entry
                  </Button>
                </div>

                {/* Journal Entries List */}
                {strategiesLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                      <p className="text-gray-600">Loading your journals...</p>
                    </div>
                  </div>
                ) : !ownDraftStrategies.length ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <BookOpen className="mx-auto mb-3 h-8 w-8 text-gray-400" />
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">No Journals Yet</h3>
                    <p className="text-gray-600">Your personal trading journals will appear here. Create a new one or start from your trades!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ownDraftStrategies.map((strategy) => (
                      <div
                        key={strategy.id}
                        className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-semibold text-lg text-gray-900">
                              {strategy.name || "Untitled Journal"}
                            </span>
                            {strategy.voting_status === 'pending' && (
                              <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                                In Voting
                              </span>
                            )}
                            {!strategy.is_public && !strategy.voting_status && (
                              <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                Draft
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm"
                              onClick={() => setEditingJournal(strategy.id)}
                            >Edit</Button>
                            {!strategy.is_public && (!strategy.voting_status || strategy.voting_status === 'rejected') && (
                              <Button
                                onClick={() => handlePublishStrategy(strategy)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                size="sm"
                              >
                                <UploadCloud className="h-4 w-4 mr-1" />
                                Submit for Voting
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {strategy.image_path && (
                          <div className="mb-3">
                            <ImageEditor
                              imageUrl={
                                strategy.image_path.startsWith("http")
                                  ? strategy.image_path
                                  : `https://nprkhqxhvergyikusvbc.supabase.co/storage/v1/object/public/strategy_images/${strategy.image_path}`
                              }
                              width={380}
                              height={220}
                              onEdit={() => {}}
                            />
                          </div>
                        )}
                        
                        <div className="text-gray-700">
                          {strategy.content_markdown?.slice(0, 340) || <span className="text-sm text-gray-500">No content</span>}
                          {(strategy.content_markdown?.length ?? 0) > 340 && <span>…</span>}
                        </div>
                        
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(strategy.tags || []).map(tag =>
                            <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{tag}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'trades' && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="mb-6">
                  <JournalHeader 
                    filter={filter}
                    onFilterChange={setFilter}
                    onNewTrade={() => setIsNewTradeDialogOpen(true)}
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                  />
                </div>
                <TradesTable
                  trades={filteredTrades}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteTrade}
                  onViewDetails={handleViewDetailsClick}
                  onClose={handleCloseClick}
                  isDeleting={deleteMutation.isPending}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <NewTradeDialog open={isNewTradeDialogOpen} onOpenChange={setIsNewTradeDialogOpen} />
      {selectedTrade && (
        <EditTradeDialog open={isEditTradeDialogOpen} onOpenChange={setIsEditTradeDialogOpen} trade={selectedTrade} />
      )}
      {selectedTrade && (
        <CloseTradeDialog open={isCloseTradeDialogOpen} onOpenChange={setIsCloseTradeDialogOpen} trade={selectedTrade} />
      )}
      {selectedTrade && (
        <TradeDetailsSheet open={isTradeDetailsSheetOpen} onOpenChange={setIsTradeDetailsSheetOpen} trade={selectedTrade} />
      )}
      
      {/* Dialog for NEW journal entry */}
      {editingJournal === "NEW" && (
        <StrategyEditorDialog
          open={true}
          onOpenChange={() => setEditingJournal(null)}
        />
      )}
      
      {/* Show StrategyEditorDialog for editing existing Journal */}
      {editingJournal && editingJournal !== "NEW" && (
        <StrategyEditorDialog
          open={true}
          onOpenChange={() => setEditingJournal(null)}
          strategy={ownDraftStrategies.find(s => s.id === editingJournal)}
        />
      )}
    </div>
  );
}
