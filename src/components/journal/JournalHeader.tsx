
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

export function JournalHeader({ filter, onFilterChange, dateRange, onDateRangeChange }: JournalHeaderProps) {
    return (
        <div className="flex flex-wrap gap-3 items-center justify-between">
          {/* Filter Buttons */}
          <div className="flex gap-2">
            <Button
                size="sm"
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => onFilterChange("all")}
                className={cn(
                  filter === "all" 
                    ? "bg-blue-500 text-white hover:bg-blue-600" 
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                )}
            >
                All Trades
            </Button>
            <Button
                size="sm"
                variant={filter === "long" ? "default" : "outline"}
                onClick={() => onFilterChange("long")}
                className={cn(
                  filter === "long" 
                    ? "bg-green-500 text-white hover:bg-green-600" 
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                )}
            >
                Long Positions
            </Button>
            <Button
                size="sm"
                variant={filter === "short" ? "default" : "outline"}
                onClick={() => onFilterChange("short")}
                className={cn(
                  filter === "short" 
                    ? "bg-red-500 text-white hover:bg-red-600" 
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                )}
            >
                Short Positions
            </Button>
          </div>

          {/* Date Range Picker */}
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    "w-auto lg:w-[280px] justify-start text-left font-normal border-gray-300",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM dd")} -{" "}
                        {format(dateRange.to, "MMM dd, yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "MMM dd, yyyy")
                    )
                  ) : (
                    <span>Filter by date range</span>
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
            
            {dateRange && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDateRangeChange(undefined)}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
    );
}
