
import React from "react";
import { JournalHeader, TradeFilter } from "@/components/journal/JournalHeader";
import { TradesTable } from "@/components/trade/TradesTable";
import clsx from "clsx";
import { Tables } from "@/integrations/supabase/types";

interface JournalTradesSectionProps {
  filter: TradeFilter;
  setFilter: (filter: TradeFilter) => void;
  dateRange: any;
  setDateRange: (range: any) => void;
  filteredTrades: Tables<'trades'>[];
  deleteMutation: any;
  isDeleting: boolean;
  handleEditClick: (trade: Tables<'trades'>) => void;
  handleDelete: (tradeId: string) => void;
  handleViewDetailsClick: (trade: Tables<'trades'>) => void;
  handleCloseClick: (trade: Tables<'trades'>) => void;
  panelRadius: string;
}

export const JournalTradesSection: React.FC<JournalTradesSectionProps> = ({
  filter,
  setFilter,
  dateRange,
  setDateRange,
  filteredTrades,
  deleteMutation,
  isDeleting,
  handleEditClick,
  handleDelete,
  handleViewDetailsClick,
  handleCloseClick,
  panelRadius
}) => {
  return (
    <div className={clsx("rounded-2xl border border-orange-900/30 shadow-lg p-2 bg-[#201920]/90", panelRadius)}>
      <div className="mb-6">
        <JournalHeader 
          filter={filter}
          onFilterChange={setFilter}
          onNewTrade={() => {}} // Could expose
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>
      <TradesTable
        trades={filteredTrades}
        onEdit={handleEditClick}
        onDelete={handleDelete}
        onViewDetails={handleViewDetailsClick}
        onClose={handleCloseClick}
        isDeleting={isDeleting}
      />
    </div>
  );
};
