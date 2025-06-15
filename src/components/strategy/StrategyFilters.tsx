
import * as React from "react"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface StrategyFiltersProps {
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    winRateRange: [number, number];
    onWinRateChange: (range: [number, number]) => void;
    dateRange: DateRange | undefined;
    onDateChange: (range: DateRange | undefined) => void;
    authorFilter: string;
    onAuthorFilterChange: (filter: string) => void;
    className?: string;
}

export function StrategyFilters({
    searchTerm,
    onSearchTermChange,
    winRateRange,
    onWinRateChange,
    dateRange,
    onDateChange,
    authorFilter,
    onAuthorFilterChange,
    className,
}: StrategyFiltersProps) {

  return (
    <div className={cn("space-y-6", className)}>
        <div>
            <Label htmlFor="search">Search</Label>
            <Input
                id="search"
                type="search"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                className="mt-1"
            />
        </div>

        <Separator />

        <div>
            <Label>Author</Label>
            <Select value={authorFilter} onValueChange={onAuthorFilterChange}>
                <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Filter by author" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Strategies</SelectItem>
                    <SelectItem value="me">My Strategies</SelectItem>
                    <SelectItem value="following">Following</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <Separator />

        <div>
            <Label htmlFor="win-rate-slider">Win Rate ({winRateRange[0]}% - {winRateRange[1]}%)</Label>
            <Slider
                id="win-rate-slider"
                min={0}
                max={100}
                step={1}
                value={winRateRange}
                onValueChange={(value) => onWinRateChange(value as [number, number])}
                className="mt-2"
            />
        </div>
        
        <Separator />

        <div>
            <Label>Date Created</Label>
             <Popover>
                <PopoverTrigger asChild>
                <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                    "w-full justify-start text-left font-normal mt-1",
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
                    onSelect={onDateChange}
                    numberOfMonths={2}
                />
                </PopoverContent>
            </Popover>
        </div>
    </div>
  )
}
