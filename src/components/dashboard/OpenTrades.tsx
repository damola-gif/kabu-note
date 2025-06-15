import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Your Open Trades</CardTitle>
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
      </CardHeader>
      <CardContent>
        {filteredTrades.length > 0 ? (
          <div className="space-y-4">
            {filteredTrades.map((trade) => (
              <div key={trade.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Asset</p>
                      <p className="font-semibold">{trade.symbol}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Side</p>
                      <p className={`font-medium capitalize ${
                        trade.side === 'long' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {trade.side}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Entry</p>
                      <p className="font-medium">${trade.entry_price}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Size</p>
                      <p className="font-medium">{trade.size}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
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
                      className="btn-landing-primary"
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
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {trade.stop_loss && (
                        <div>
                          <p className="text-muted-foreground">Stop Loss</p>
                          <p className="font-medium text-red-600">${trade.stop_loss}</p>
                        </div>
                      )}
                      {trade.take_profit && (
                        <div>
                          <p className="text-muted-foreground">Take Profit</p>
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
            <p className="text-muted-foreground">No open trades found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {filterAsset !== "all" ? `No open trades for ${filterAsset}` : "Start trading to see your positions here"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
