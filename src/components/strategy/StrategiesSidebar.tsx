
import { StrategyFilters } from './StrategyFilters';
import { DateRange } from 'react-day-picker';

interface StrategiesSidebarProps {
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

export function StrategiesSidebar(props: StrategiesSidebarProps) {
    return (
        <aside className="md:col-span-1">
            <div className="sticky top-4">
                <h2 className="text-lg font-semibold mb-4">Filters</h2>
                <StrategyFilters {...props} />
            </div>
        </aside>
    );
}
