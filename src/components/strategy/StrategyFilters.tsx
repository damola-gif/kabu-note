
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DateRange } from 'react-day-picker';
import { useStrategyTags } from '@/hooks/useStrategies';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface StrategyFiltersProps {
    searchTerm: string;
    onSearchTermChange: (value: string) => void;
    winRateRange: [number, number];
    onWinRateChange: (value: [number, number]) => void;
    dateRange: DateRange | undefined;
    onDateChange: (range: DateRange | undefined) => void;
    authorFilter: string;
    onAuthorFilterChange: (value: string) => void;
    selectedTags: string[];
    onTagsChange: (tags: string[]) => void;
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
    selectedTags,
    onTagsChange
}: StrategyFiltersProps) {
    const { data: availableTags = [] } = useStrategyTags();

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
        <div className="space-y-6">
            <div>
                <Label htmlFor="search" className="text-sm font-medium">Search Strategies</Label>
                <Input
                    id="search"
                    type="text"
                    placeholder="Search by name or keyword..."
                    value={searchTerm}
                    onChange={(e) => onSearchTermChange(e.target.value)}
                    className="mt-1"
                />
            </div>

            <div>
                <Label className="text-sm font-medium">Tags</Label>
                <div className="mt-2 space-y-2">
                    {selectedTags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {selectedTags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                    <button
                                        onClick={() => handleTagToggle(tag)}
                                        className="ml-1 hover:text-destructive"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                            <button
                                onClick={clearAllTags}
                                className="text-xs text-muted-foreground hover:text-foreground underline"
                            >
                                Clear all
                            </button>
                        </div>
                    )}
                    {availableTags.length > 0 && (
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                            {availableTags.map(tag => (
                                <div key={tag} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`tag-${tag}`}
                                        checked={selectedTags.includes(tag)}
                                        onCheckedChange={() => handleTagToggle(tag)}
                                    />
                                    <Label htmlFor={`tag-${tag}`} className="text-sm cursor-pointer">
                                        {tag}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div>
                <Label className="text-sm font-medium">Win Rate Range</Label>
                <div className="mt-2">
                    <Slider
                        value={winRateRange}
                        onValueChange={(value) => onWinRateChange(value as [number, number])}
                        max={100}
                        min={0}
                        step={5}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{winRateRange[0]}%</span>
                        <span>{winRateRange[1]}%</span>
                    </div>
                </div>
            </div>

            <div>
                <Label className="text-sm font-medium">Date Created</Label>
                <div className="mt-2">
                    <DatePickerWithRange
                        date={dateRange}
                        onDateChange={onDateChange}
                    />
                </div>
            </div>

            <div>
                <Label className="text-sm font-medium">Author</Label>
                <div className="mt-2">
                    <Select value={authorFilter} onValueChange={onAuthorFilterChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by author" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Strategies</SelectItem>
                            <SelectItem value="me">My Strategies</SelectItem>
                            <SelectItem value="following">From Following</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
