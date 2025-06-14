
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { Tables } from "@/integrations/supabase/types";

interface TradesTableProps {
  trades: Tables<"trades">[];
  onEdit: (trade: Tables<"trades">) => void;
  onDelete: (tradeId: string) => void;
  onViewDetails: (trade: Tables<"trades">) => void;
  isDeleting: boolean;
}

export function TradesTable({ trades, onEdit, onDelete, onViewDetails, isDeleting }: TradesTableProps) {
    return (
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
                {trades.map((trade) => (
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
                                    <DropdownMenuItem onClick={() => onViewDetails(trade)}>View Details</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onEdit(trade)}>
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => onDelete(trade.id)}
                                        disabled={isDeleting}
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
    );
}
