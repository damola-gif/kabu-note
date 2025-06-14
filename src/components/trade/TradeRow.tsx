import React, { useState, useEffect, useMemo } from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
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
import { useTwelveData } from '@/contexts/TwelveDataProvider';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface TradeRowProps {
  trade: Tables<"trades">;
  onEdit: (trade: Tables<"trades">) => void;
  onDelete: (tradeId: string) => void;
  onViewDetails: (trade: Tables<"trades">) => void;
  isDeleting: boolean;
}

export function TradeRow({ trade, onEdit, onDelete, onViewDetails, isDeleting }: TradeRowProps) {
    const { subscribe, unsubscribe, isConnected } = useTwelveData();
    const [livePrice, setLivePrice] = useState<number | null>(null);
    const [priceChange, setPriceChange] = useState<"up" | "down" | "none">("none");

    const isOpen = !trade.closed_at;

    useEffect(() => {
        if (isOpen && isConnected) {
            const handlePriceUpdate = (price: number) => {
                setLivePrice(prevPrice => {
                    if (prevPrice !== null) {
                        if (price > prevPrice) setPriceChange('up');
                        else if (price < prevPrice) setPriceChange('down');
                    }
                    return price;
                });
                setTimeout(() => setPriceChange('none'), 500); // Reset color after animation
            };
            
            subscribe(trade.symbol, handlePriceUpdate);
            
            return () => {
                unsubscribe(trade.symbol, handlePriceUpdate);
            };
        }
    }, [isOpen, isConnected, trade.symbol, subscribe, unsubscribe]);
    
    const livePnl = useMemo(() => {
        if (!isOpen || livePrice === null) return null;

        if (trade.side === 'long') {
            return (livePrice - trade.entry_price) * trade.size;
        } else { // short
            return (trade.entry_price - livePrice) * trade.size;
        }
    }, [isOpen, livePrice, trade.side, trade.entry_price, trade.size]);

    const displayPnl = livePnl !== null ? livePnl : trade.pnl;

    const pnlClass = displayPnl === null ? "" : displayPnl >= 0 ? "text-green-600" : "text-red-600";
    const priceChangeClass = priceChange === 'up' ? 'text-green-500' : priceChange === 'down' ? 'text-red-500' : '';

    return (
        <TableRow>
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
                {trade.entry_price} → {isOpen ? <span className={cn('transition-colors duration-300', priceChangeClass)}>{livePrice?.toFixed(2) ?? '...'}</span> : trade.exit_price}
            </TableCell>
            <TableCell className={pnlClass}>
                {isOpen && <Badge variant="outline" className="mr-2 border-green-500 text-green-500 animate-pulse">Live</Badge>}
                {displayPnl !== null
                    ? `${displayPnl >= 0 ? '+' : ''}$${displayPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : '–'}
            </TableCell>
            <TableCell>
                {format(new Date(trade.opened_at), "MMM d, yyyy")}
            </TableCell>
            <TableCell>
                {trade.closed_at
                    ? format(new Date(trade.closed_at), "MMM d, yyyy")
                    : <Badge variant="secondary">Open</Badge>}
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
    );
}
