
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { Tables } from "@/integrations/supabase/types";
import { TradeRow } from './TradeRow';

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
                    <TradeRow 
                        key={trade.id}
                        trade={trade}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onViewDetails={onViewDetails}
                        isDeleting={isDeleting}
                    />
                ))}
            </TableBody>
        </Table>
    );
}
