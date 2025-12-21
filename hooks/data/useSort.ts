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
                comparison = (valA[0] || '').toString().localeCompare((valB[0] || '').toString());
            } else if (typeof valA === 'number' && typeof valB === 'number') {
                comparison = valA - valB;
            } else if (valA instanceof Date && valB instanceof Date) {
                comparison = valA.getTime() - valB.getTime();
            } else {
                comparison = String(valA).localeCompare(String(valB));
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
