
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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionProvider";
import { NewTradeDialog } from "@/components/trade/NewTradeDialog";
import { format } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export default function Journal() {
  const { user } = useSession();
  const [isNewTradeDialogOpen, setIsNewTradeDialogOpen] = useState(false);
  const {
    data: trades,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["trades", user?.id],
    queryFn: () => fetchTrades(user?.id),
    enabled: !!user,
  });

  return (
    <>
      <div className="flex justify-end items-center mb-4">
        <Button variant="default" onClick={() => setIsNewTradeDialogOpen(true)}>
          New Trade
        </Button>
      </div>
      <div className="bg-card rounded-lg shadow p-4 mb-4 flex gap-3 flex-wrap items-center">
        <Button size="sm" variant="outline">
          All
        </Button>
        <Button size="sm" variant="outline">
          Long
        </Button>
        <Button size="sm" variant="outline">
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
            {trades && trades.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-7">
                  No trades yet.
                </TableCell>
              </TableRow>
            )}
            {trades?.map((trade) => (
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
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
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
    </>
  );
}
