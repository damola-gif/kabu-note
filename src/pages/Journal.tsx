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
import { StrategyEditorDialog } from "@/components/strategy/StrategyEditorDialog";
import { JournalTabsHeader } from "@/components/journal/JournalTabsHeader";
import { JournalEntriesList } from "@/components/journal/JournalEntriesList";
import { JournalTradesSection } from "@/components/journal/JournalTradesSection";

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

  // Main content tabs: Journals or Trades
  const [tab, setTab] = useState<'journal' | 'trades'>('journal');

  return (
    <div className={clsx("min-h-screen w-full", tabBg, "pb-8")}>
      <div className="max-w-5xl mx-auto">
        <div className={clsx("min-h-screen border-x", cardBg, panelRadius, "border-orange-600/30")}>
          {/* Header */}
          <JournalTabsHeader
            tab={tab}
            setTab={setTab}
            onNewTrade={() => setIsNewTradeDialogOpen(true)}
            onNewJournal={() => setEditingJournal("NEW")}
            cardBg={cardBg}
            panelRadius={panelRadius}
            fadedText={fadedText}
            strongAccentColor={strongAccentColor}
            buttonPrimary={buttonPrimary}
          />
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
                <JournalEntriesList
                  ownDraftStrategies={ownDraftStrategies}
                  strategiesLoading={strategiesLoading}
                  editingJournal={editingJournal}
                  setEditingJournal={setEditingJournal}
                  handlePublishStrategy={handlePublishStrategy}
                  fadedText={fadedText}
                  cardBg={cardBg}
                  panelRadius={panelRadius}
                  strongAccentColor={strongAccentColor}
                  buttonOutline={buttonOutline}
                  buttonPrimary={buttonPrimary}
                />
              </div>
            )}
            {tab === 'trades' && (
              <JournalTradesSection
                filter={filter}
                setFilter={setFilter}
                dateRange={dateRange}
                setDateRange={setDateRange}
                filteredTrades={filteredTrades}
                deleteMutation={deleteMutation}
                isDeleting={deleteMutation.isPending}
                handleEditClick={handleEditClick}
                handleDelete={(tradeId) => deleteMutation.mutate(tradeId)}
                handleViewDetailsClick={handleViewDetailsClick}
                handleCloseClick={handleCloseClick}
                panelRadius={panelRadius}
              />
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
