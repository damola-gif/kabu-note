
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
import clsx from "clsx";
import { useSession } from "@/contexts/SessionProvider";
import { useStrategies, useUpdateStrategy } from "@/hooks/useStrategies";
import { toast } from "@/hooks/use-toast";
import { ImageEditor } from "@/components/common/ImageEditor";

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

  // Styling tokens
  const cardBg = "bg-[#23202a] bg-opacity-90 border-none shadow-lg";
  const strongAccentColor = "text-orange-400";
  const fadedText = "text-zinc-400";
  const panelRadius = "rounded-xl";
  const buttonPrimary = "bg-gradient-to-tr from-orange-500 via-orange-400 to-yellow-400 text-white font-bold shadow-orange-500/30 hover:from-orange-400 hover:to-yellow-200";
  const buttonOutline = "border-orange-400 text-orange-400 hover:bg-orange-500/10";
  const tabBg = "bg-gradient-to-br from-[#19141c] via-[#191920] to-[#16111b]";

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

  // Journal View/Edit
  const renderJournal = () => {
    if (strategiesLoading) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto mb-3"></div>
            <p className={clsx(fadedText)}>Loading your journals...</p>
          </div>
        </div>
      );
    }
    if (!ownDraftStrategies.length) {
      return (
        <div className={clsx("text-center py-12", cardBg, panelRadius)}>
          <BookOpen className="mx-auto mb-3 h-8 w-8 text-orange-400" />
          <h3 className={clsx("text-xl font-extrabold mb-2", strongAccentColor)}>No Journals Yet</h3>
          <p className={fadedText}>Your personal trading journals will appear here. Create a new one or start from your trades!</p>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {ownDraftStrategies.map((strategy) => (
          <div
            key={strategy.id}
            className={clsx(
              cardBg,
              panelRadius,
              "p-5 flex flex-col gap-2 relative border border-orange-900/40 hover:shadow-orange-400/10 transition-shadow"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className={clsx("font-bold text-lg", strongAccentColor)}>
                  {strategy.name || "Untitled Journal"}
                </span>
                {strategy.voting_status === 'pending' && (
                  <span className="ml-2 px-2 py-1 bg-orange-900/60 text-orange-400 rounded uppercase text-xs font-bold">
                    In Voting
                  </span>
                )}
                {!strategy.is_public && !strategy.voting_status && (
                  <span className="ml-2 px-2 py-1 bg-zinc-800 text-orange-300 rounded uppercase text-xs">
                    Draft
                  </span>
                )}
                {strategy.voting_status === "approved" && (
                  <span className="ml-2 px-2 py-1 bg-green-900/60 text-green-300 rounded uppercase text-xs font-bold">
                    Approved
                  </span>
                )}
                {strategy.voting_status === "rejected" && (
                  <span className="ml-2 px-2 py-1 bg-red-900/60 text-red-300 rounded uppercase text-xs font-bold">
                    Rejected
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm"
                  className={buttonOutline}
                  onClick={() => setEditingJournal(strategy.id)}
                >Edit</Button>
                {!strategy.is_public && (!strategy.voting_status || strategy.voting_status === 'rejected') && (
                  <Button
                    onClick={() => handlePublishStrategy(strategy)}
                    className={buttonPrimary + " px-4 py-2 text-sm"}
                    size="sm"
                  >
                    <UploadCloud className="h-4 w-4 mr-1" />
                    Submit for Voting
                  </Button>
                )}
              </div>
            </div>
            {/* Image section: preview and editor */}
            {strategy.image_path && (
              <div className="mb-2">
                <ImageEditor
                  imageUrl={
                    strategy.image_path.startsWith("http")
                      ? strategy.image_path
                      : `https://nprkhqxhvergyikusvbc.supabase.co/storage/v1/object/public/strategy_images/${strategy.image_path}`
                  }
                  width={380}
                  height={220}
                  onEdit={(dataUrl) => {
                    // optionally prompt user to save image (not persisted until form submit)
                    setEditorImageUrl(dataUrl);
                  }}
                />
              </div>
            )}
            <div className={clsx("prose prose-invert text-base", fadedText)}>
              {strategy.content_markdown?.slice(0, 340) || <span className="text-sm text-muted-foreground">No content</span>}
              {(strategy.content_markdown?.length ?? 0) > 340 && <span>…</span>}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {(strategy.tags || []).map(tag =>
                <span key={tag} className="bg-orange-800 text-orange-100 px-2 py-1 rounded-full text-xs font-mono">{tag}</span>
              )}
            </div>
            {editingJournal === strategy.id && (
              <EditTradeDialog
                open={true}
                onOpenChange={() => setEditingJournal(null)}
                trade={undefined}
                // Optionally, you can pass updated image or annotate/save logic here
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Main content tabs: Journals or Trades
  const [tab, setTab] = useState<'journal' | 'trades'>('journal');

  return (
    <div className={clsx("min-h-screen w-full", tabBg, "pb-8")}>
      <div className="max-w-5xl mx-auto">
        <div className={clsx("min-h-screen border-x", cardBg, panelRadius, "border-orange-600/30")}>
          {/* Header */}
          <div className={clsx("sticky top-0 z-20", "bg-[#19141c]/90 border-b border-orange-700/30 backdrop-blur-lg", panelRadius)}>
            <div className="px-8 py-7 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-orange-300 drop-shadow-sm tracking-tight">Trading Journal</h1>
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
            <div className="flex px-8 pb-3 gap-2">
              <button
                onClick={() => setTab('journal')}
                className={clsx(
                  "py-2 px-6 rounded-t-lg font-bold focus:outline-none transition border-b-2",
                  tab === 'journal'
                    ? "border-orange-500 text-orange-400 bg-orange-900/20"
                    : "border-transparent text-zinc-500 hover:text-orange-400 hover:bg-orange-900/10"
                )}
              >
                Journals
              </button>
              <button
                onClick={() => setTab('trades')}
                className={clsx(
                  "py-2 px-6 rounded-t-lg font-bold focus:outline-none transition border-b-2",
                  tab === 'trades'
                    ? "border-orange-500 text-orange-400 bg-orange-900/20"
                    : "border-transparent text-zinc-500 hover:text-orange-400 hover:bg-orange-900/10"
                )}
              >
                Trades
              </button>
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
            {tab === 'journal' && (
              <div>
                <div className="mb-6">
                  <h2 className={clsx("text-lg font-semibold", strongAccentColor)}>
                    Your Private Journals
                  </h2>
                  <p className={fadedText + " text-sm mb-4"}>
                    Only you can view and edit your journals. Submit one to promote it as a strategy for voting.
                  </p>
                  <Button
                    className={clsx(buttonPrimary, "mb-2")}
                    onClick={() => setEditingJournal("NEW")}
                  >
                    <BookOpen className="w-4 h-4 mr-1" /> New Journal Entry
                  </Button>
                </div>
                {renderJournal()}
              </div>
            )}
            {tab === 'trades' && (
              <div className={clsx("rounded-2xl border border-orange-900/30 shadow-lg p-2 bg-[#201920]/90", panelRadius)}>
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
                  onDelete={(tradeId) => deleteMutation.mutate(tradeId)}
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
    </div>
  );
}

// helper handlers
function handleEditClick(trade: Tables<'trades'>) {}
function handleCloseClick(trade: Tables<'trades'>) {}
function handleViewDetailsClick(trade: Tables<'trades'>) {}
