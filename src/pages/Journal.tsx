import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionProvider";
import { NewTradeDialog } from "@/components/trade/NewTradeDialog";
import { EditTradeDialog } from "@/components/trade/EditTradeDialog";
import { TradeDetailsSheet } from "@/components/trade/TradeDetailsSheet";
import { format } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";

async function fetchTrades(userId: string | undefined) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", userId)
    .order("opened_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

type TradeFilter = "all" | "long" | "short";

export default function Journal() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [isNewTradeDialogOpen, setIsNewTradeDialogOpen] = useState(false);
  const [isEditTradeDialogOpen, setIsEditTradeDialogOpen] = useState(false);
  const [isTradeDetailsSheetOpen, setIsTradeDetailsSheetOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Tables<'trades'> | null>(null);
  const [filter, setFilter] = useState<TradeFilter>("all");

  const {
    data: trades,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["trades", user?.id],
    queryFn: () => fetchTrades(user?.id),
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (tradeId: string) => {
      const { error } = await supabase.from("trades").delete().eq("id", tradeId);
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Trade deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["trades", user?.id] });
    },
    onError: (error) => {
      toast.error(`Error deleting trade: ${error.message}`);
    },
  });

  const filteredTrades =
    trades?.filter((trade) => {
      if (filter === "all") return true;
      return trade.side === filter;
    }) ?? [];

  const handleEditClick = (trade: Tables<'trades'>) => {
    setSelectedTrade(trade);
    setIsEditTradeDialogOpen(true);
  };

  const handleViewDetailsClick = (trade: Tables<'trades'>) => {
    setSelectedTrade(trade);
    setIsTradeDetailsSheetOpen(true);
  };

  return (
    <>
      <div className="flex justify-end items-center mb-4">
        <Button variant="default" onClick={() => setIsNewTradeDialogOpen(true)}>
          New Trade
        </Button>
      </div>
      <div className="bg-card rounded-lg shadow p-4 mb-4 flex gap-3 flex-wrap items-center">
        <Button
          size="sm"
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          size="sm"
          variant={filter === "long" ? "default" : "outline"}
          onClick={() => setFilter("long")}
        >
          Long
        </Button>
        <Button
          size="sm"
          variant={filter === "short" ? "default" : "outline"}
          onClick={() => setFilter("short")}
        >
          Short
        </Button>
        {/* TODO: Date range picker */}
      </div>
      <div className="bg-card rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Side</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Entry–Exit</TableHead>
              <TableHead>P/L</TableHead>
              <TableHead>Opened</TableHead>
              <TableHead>Closed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Loading trades...
                </TableCell>
              </TableRow>
            )}
            {error && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-destructive">
                  Error loading trades: {error.message}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !error && trades && trades.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-7">
                  No trades yet.
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !error && trades && trades.length > 0 && filteredTrades.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-7">
                  No trades match the current filter.
                </TableCell>
              </TableRow>
            )}
            {filteredTrades.map((trade) => (
              <TableRow key={trade.id}>
                <TableCell className="font-medium">{trade.symbol}</TableCell>
                <TableCell
                  className={
                    trade.side === "long" ? "text-green-600" : "text-red-600"
                  }
                >
                  {trade.side}
                </TableCell>
                <TableCell>{trade.size}</TableCell>
                <TableCell>
                  {trade.entry_price} → {trade.exit_price ?? "–"}
                </TableCell>
                <TableCell>{trade.pnl ?? "–"}</TableCell>
                <TableCell>
                  {format(new Date(trade.opened_at), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  {trade.closed_at
                    ? format(new Date(trade.closed_at), "MMM d, yyyy")
                    : "Open"}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetailsClick(trade)}>View Details</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditClick(trade)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => deleteMutation.mutate(trade.id)}
                        disabled={deleteMutation.isPending}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
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
        <TradeDetailsSheet
            open={isTradeDetailsSheetOpen}
            onOpenChange={setIsTradeDetailsSheetOpen}
            trade={selectedTrade}
        />
      )}
    </>
  );
}
