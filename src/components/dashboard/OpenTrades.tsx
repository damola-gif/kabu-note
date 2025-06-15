
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, X, Filter } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { useState, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface OpenTradesProps {
  trades: Tables<"trades">[];
  onEdit: (trade: Tables<"trades">) => void;
  onClose: (trade: Tables<"trades">) => void;
  onDelete: (tradeId: string) => void;
  onViewDetails: (trade: Tables<"trades">) => void;
  isDeleting: boolean;
}

export function OpenTrades({ 
  trades, 
  onEdit, 
  onClose, 
  onDelete, 
  onViewDetails, 
  isDeleting 
}: OpenTradesProps) {
  const [filterAsset, setFilterAsset] = useState<string>("all");

  const filteredTrades = useMemo(() => {
    if (filterAsset === "all") return trades;
    return trades.filter(trade => trade.symbol === filterAsset);
  }, [trades, filterAsset]);

  const uniqueAssets = useMemo(() => {
    const assets = [...new Set(trades.map(trade => trade.symbol))];
    return assets.sort();
  }, [trades]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#1E2A4E]">Your Open Trades</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterAsset("all")}>
              All Assets
            </DropdownMenuItem>
            {uniqueAssets.map((asset) => (
              <DropdownMenuItem key={asset} onClick={() => setFilterAsset(asset)}>
                {asset}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {filteredTrades.length > 0 ? (
        <div className="space-y-4">
          {filteredTrades.map((trade) => (
            <div key={trade.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Asset</p>
                    <p className="font-semibold">{trade.symbol}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Side</p>
                    <p className={`font-medium capitalize ${
                      trade.side === 'long' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {trade.side}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Entry</p>
                    <p className="font-medium">${trade.entry_price}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Size</p>
                    <p className="font-medium">{trade.size}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-[#2AB7CA]/10 text-[#2AB7CA] border-[#2AB7CA]/20">
                    Open
                  </Badge>
                  <Button size="sm" variant="ghost" onClick={() => onViewDetails(trade)}>
                    View
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onEdit(trade)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onClose(trade)}
                    className="bg-[#2AB7CA] text-white hover:bg-[#2AB7CA]/90"
                  >
                    Close
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => onDelete(trade.id)}
                    disabled={isDeleting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {(trade.stop_loss || trade.take_profit) && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {trade.stop_loss && (
                      <div>
                        <p className="text-gray-600">Stop Loss</p>
                        <p className="font-medium text-red-600">${trade.stop_loss}</p>
                      </div>
                    )}
                    {trade.take_profit && (
                      <div>
                        <p className="text-gray-600">Take Profit</p>
                        <p className="font-medium text-green-600">${trade.take_profit}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No open trades found</p>
          <p className="text-sm text-gray-400 mt-1">
            {filterAsset !== "all" ? `No open trades for ${filterAsset}` : "Start trading to see your positions here"}
          </p>
        </div>
      )}
    </div>
  );
}
