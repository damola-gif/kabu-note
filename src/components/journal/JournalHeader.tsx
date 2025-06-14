
import { Button } from "@/components/ui/button";

export type TradeFilter = "all" | "long" | "short";

interface JournalHeaderProps {
    filter: TradeFilter;
    onFilterChange: (filter: TradeFilter) => void;
    onNewTrade: () => void;
}

export function JournalHeader({ filter, onFilterChange, onNewTrade }: JournalHeaderProps) {
    return (
        <>
            <div className="flex justify-end items-center mb-4">
                <Button variant="default" onClick={onNewTrade}>
                    New Trade
                </Button>
            </div>
            <div className="bg-card rounded-lg shadow p-4 mb-4 flex gap-3 flex-wrap items-center">
                <Button
                    size="sm"
                    variant={filter === "all" ? "default" : "outline"}
                    onClick={() => onFilterChange("all")}
                >
                    All
                </Button>
                <Button
                    size="sm"
                    variant={filter === "long" ? "default" : "outline"}
                    onClick={() => onFilterChange("long")}
                >
                    Long
                </Button>
                <Button
                    size="sm"
                    variant={filter === "short" ? "default" : "outline"}
                    onClick={() => onFilterChange("short")}
                >
                    Short
                </Button>
                {/* TODO: Date range picker */}
            </div>
        </>
    );
}
