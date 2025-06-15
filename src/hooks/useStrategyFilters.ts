
import { useState, useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { StrategyWithProfile } from './useStrategies';
import { useSession } from '@/contexts/SessionProvider';

export function useStrategyFilters(allStrategies: StrategyWithProfile[], followingIds?: string[], isLoadingFollowing?: boolean) {
    const [searchTerm, setSearchTerm] = useState("");
    const [winRateRange, setWinRateRange] = useState<[number, number]>([0, 100]);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [authorFilter, setAuthorFilter] = useState("all");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    
    const { user } = useSession();

    const filteredStrategies = useMemo(() => allStrategies.filter((strategy) => {
        // Search term match
        const searchMatch = searchTerm === "" || 
            strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (strategy.content_markdown && strategy.content_markdown.toLowerCase().includes(searchTerm.toLowerCase()));

        const winRate = (strategy.win_rate ?? 0) as number;
        const winRateMatch = winRate >= winRateRange[0] && winRate <= winRateRange[1];

        const createdAt = strategy.created_at ? new Date(strategy.created_at) : null;
        let dateMatch = true;

        if (dateRange && createdAt) {
            if (dateRange.from && createdAt < dateRange.from) {
                dateMatch = false;
            }
            if (dateRange.to && dateMatch) {
                const toDate = new Date(dateRange.to);
                toDate.setHours(23, 59, 59, 999);
                if (createdAt > toDate) {
                    dateMatch = false;
                }
            }
        } else if (dateRange && (dateRange.from || dateRange.to)) {
            dateMatch = false;
        }

        let authorMatch = true;
        if (authorFilter === 'me') {
            authorMatch = strategy.user_id === user?.id;
        } else if (authorFilter === 'following') {
            if (isLoadingFollowing || !followingIds) {
                return searchMatch && winRateMatch && dateMatch;
            }
            authorMatch = !!strategy.profile?.id && followingIds.includes(strategy.profile.id);
        }

        // Tag filtering
        const tagMatch = selectedTags.length === 0 || 
            (strategy.tags && selectedTags.some(tag => strategy.tags?.includes(tag)));

        return searchMatch && winRateMatch && dateMatch && authorMatch && tagMatch;
    }), [allStrategies, searchTerm, winRateRange, dateRange, authorFilter, selectedTags, user?.id, followingIds, isLoadingFollowing]);

    const isFiltering = searchTerm !== "" || winRateRange[0] !== 0 || winRateRange[1] !== 100 || dateRange !== undefined || authorFilter !== "all" || selectedTags.length > 0;

    return {
        searchTerm,
        setSearchTerm,
        winRateRange,
        setWinRateRange,
        dateRange,
        setDateRange,
        authorFilter,
        setAuthorFilter,
        selectedTags,
        setSelectedTags,
        filteredStrategies,
        isFiltering
    };
}
