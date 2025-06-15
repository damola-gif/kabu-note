
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen } from "lucide-react";
import clsx from "clsx";

interface JournalTabsHeaderProps {
  tab: 'journal' | 'trades';
  setTab: (tab: 'journal' | 'trades') => void;
  onNewTrade: () => void;
  onNewJournal: () => void;
  cardBg: string;
  panelRadius: string;
  fadedText: string;
  strongAccentColor: string;
  buttonPrimary: string;
}

export const JournalTabsHeader: React.FC<JournalTabsHeaderProps> = ({
  tab,
  setTab,
  onNewTrade,
  onNewJournal,
  cardBg,
  panelRadius,
  fadedText,
  strongAccentColor,
  buttonPrimary,
}) => (
  <div className={clsx("sticky top-0 z-20", "bg-[#19141c]/90 border-b border-orange-700/30 backdrop-blur-lg", panelRadius)}>
    <div className="px-8 py-7 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-extrabold text-orange-300 drop-shadow-sm tracking-tight">Trading Journal</h1>
        <p className={clsx("text-base mt-1", fadedText)}>Track, analyze, and own your trading performance</p>
      </div>
      <Button 
        onClick={onNewTrade}
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
);
