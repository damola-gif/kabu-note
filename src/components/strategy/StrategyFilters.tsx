
import * as React from "react"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { Calendar as CalendarIcon, X } from "lucide-react"

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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface StrategyFiltersProps {
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    winRateRange: [number, number];
    onWinRateChange: (range: [number, number]) => void;
    dateRange: DateRange | undefined;
    onDateChange: (range: DateRange | undefined) => void;
    authorFilter: string;
    onAuthorFilterChange: (filter: string) => void;
    selectedTags: string[];
    onTagsChange: (tags: string[]) => void;
    className?: string;
}

// Mock tags for now - in a real app, these would come from the database
const availableTags = [
    "breakout",
    "mean-reversion", 
    "momentum",
    "scalping",
    "swing-trading",
    "day-trading",
    "trend-following",
    "contrarian"
];

export function StrategyFilters({
    searchTerm,
    onSearchTermChange,
    winRateRange,
    onWinRateChange,
    dateRange,
    onDateChange,
    authorFilter,
    onAuthorFilterChange,
    selectedTags,
    onTagsChange,
    className,
}: StrategyFiltersProps) {

    const handleTagToggle = (tag: string) => {
        if (selectedTags.includes(tag)) {
            onTagsChange(selectedTags.filter(t => t !== tag));
        } else {
            onTagsChange([...selectedTags, tag]);
        }
    };

    const clearAllTags = () => {
        onTagsChange([]);
    };

  return (
    <div className={cn("space-y-6", className)}>
        <div>
            <Label htmlFor="search">Search</Label>
            <Input
                id="search"
                type="search"
                placeholder="Search by name or keyword..."
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                className="mt-1"
            />
        </div>

        <Separator />

        <div>
            <div className="flex items-center justify-between mb-2">
                <Label>Tags</Label>
                {selectedTags.length > 0 && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearAllTags}
                        className="h-auto p-1 text-xs"
                    >
                        Clear all
                    </Button>
                )}
            </div>
            <div className="space-y-2">
                {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {selectedTags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                                <X 
                                    className="ml-1 h-3 w-3 cursor-pointer" 
                                    onClick={() => handleTagToggle(tag)}
                                />
                            </Badge>
                        ))}
                    </div>
                )}
                <div className="flex flex-wrap gap-1">
                    {availableTags.filter(tag => !selectedTags.includes(tag)).map((tag) => (
                        <Badge 
                            key={tag}
                            variant="outline" 
                            className="cursor-pointer hover:bg-secondary text-xs"
                            onClick={() => handleTagToggle(tag)}
                        >
                            {tag}
                        </Badge>
                    ))}
                </div>
            </div>
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
