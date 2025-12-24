import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc';

interface UseSortProps<T> {
    data: T[];
    initialField?: keyof T | null;
    initialDirection?: SortDirection;
}

export function useSort<T>({ data, initialField = null, initialDirection = 'asc' }: UseSortProps<T>) {
    const [sortField, setSortField] = useState<keyof T | null>(initialField);
    const [sortDirection, setSortDirection] = useState<SortDirection>(initialDirection);

    const handleSort = (field: keyof T) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedData = useMemo(() => {
        if (!sortField) return data;

        return [...data].sort((a, b) => {
            const valA = a[sortField];
            const valB = b[sortField];

            let comparison = 0;

            if (typeof valA === 'string' && typeof valB === 'string') {
                comparison = valA.localeCompare(valB);
            } else if (Array.isArray(valA) && Array.isArray(valB)) {
                // Handle collections (like artists)
                const firstA = valA[0];
                const firstB = valB[0];
                
                if (firstA && firstB && typeof firstA === 'object' && 'name' in firstA && typeof firstB === 'object' && 'name' in firstB) {
                    comparison = (firstA.name as string).localeCompare(firstB.name as string);
                } else {
                    comparison = (firstA || '').toString().localeCompare((firstB || '').toString());
                }
            } else if (typeof valA === 'number' && typeof valB === 'number') {
                comparison = valA - valB;
            } else if (valA instanceof Date && valB instanceof Date) {
                comparison = valA.getTime() - valB.getTime();
            } else if (valA && typeof valA === 'object' && 'title' in valA && valB && typeof valB === 'object' && 'title' in valB) {
                // Handle objects with title (like album)
                comparison = (valA.title as string).localeCompare(valB.title as string);
            } else {
                comparison = String(valA || '').localeCompare(String(valB || ''));
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [data, sortField, sortDirection]);

    return {
        sortField,
        sortDirection,
        handleSort,
        sortedData
    };
}
