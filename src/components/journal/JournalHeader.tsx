
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export type TradeFilter = "all" | "long" | "short";

interface JournalHeaderProps {
    filter: TradeFilter;
    onFilterChange: (filter: TradeFilter) => void;
    onNewTrade: () => void;
    dateRange: DateRange | undefined;
    onDateRangeChange: (date: DateRange | undefined) => void;
}

export function JournalHeader({ filter, onFilterChange, onNewTrade, dateRange, onDateRangeChange }: JournalHeaderProps) {
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
                <div className={cn("grid gap-2")}>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                          "w-auto lg:w-[300px] justify-start text-left font-normal",
                          !dateRange && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "LLL dd, y")} -{" "}
                              {format(dateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={onDateRangeChange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
            </div>
        </>
    );
}
