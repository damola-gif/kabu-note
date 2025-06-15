
import React from "react";
import clsx from "clsx";
import { Tables } from "@/integrations/supabase/types";
import { StrategyEditorDialog } from "@/components/strategy/StrategyEditorDialog";
import { BookOpen, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageEditor } from "@/components/common/ImageEditor";

interface JournalEntriesListProps {
  ownDraftStrategies: Tables<'strategies'>[];
  strategiesLoading: boolean;
  editingJournal: string | null;
  setEditingJournal: (id: string | null) => void;
  handlePublishStrategy: (strategy: Tables<'strategies'>) => void;
  fadedText: string;
  cardBg: string;
  panelRadius: string;
  strongAccentColor: string;
  buttonOutline: string;
  buttonPrimary: string;
}

export const JournalEntriesList: React.FC<JournalEntriesListProps> = ({
  ownDraftStrategies,
  strategiesLoading,
  editingJournal,
  setEditingJournal,
  handlePublishStrategy,
  fadedText,
  cardBg,
  panelRadius,
  strongAccentColor,
  buttonOutline,
  buttonPrimary,
}) => {
  const currentlyEditingStrategy = React.useMemo(() => {
    if (!editingJournal || editingJournal === "NEW") return undefined;
    return ownDraftStrategies.find((s) => s.id === editingJournal);
  }, [editingJournal, ownDraftStrategies]);

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
                onEdit={() => {}}
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
        </div>
      ))}
      
      {/* Show StrategyEditorDialog for editing existing Journal */}
      {currentlyEditingStrategy && (
        <StrategyEditorDialog
          open={true}
          onOpenChange={() => setEditingJournal(null)}
          strategy={currentlyEditingStrategy}
        />
      )}
    </div>
  );
};
