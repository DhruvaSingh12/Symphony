import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const useCacheManager = () => {
    const [usage, setUsage] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const queryClient = useQueryClient();

    const formatBytes = (bytes: number, decimals = 2) => {
        if (!+bytes) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    const calculateSize = useCallback(async () => {
        let totalUsage = 0;

        if ('storage' in navigator && 'estimate' in navigator.storage) {
            try {
                const estimate = await navigator.storage.estimate();
                totalUsage += estimate.usage || 0;
            } catch (error) {
                console.error('Error calculating storage usage:', error);
            }
        }

        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    const value = localStorage.getItem(key);
                    totalUsage += (key.length + (value?.length || 0)) * 2; 
                }
            }
        } catch (e) {
            console.error('Error reading localStorage', e);
        }

        try {
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key) {
                    const value = sessionStorage.getItem(key);
                    totalUsage += (key.length + (value?.length || 0)) * 2;
                }
            }
        } catch (e) {
            console.error('Error reading sessionStorage', e);
        }

        setUsage(totalUsage);
    }, []);

    useEffect(() => {
        calculateSize();
    }, [calculateSize]);

    const clearCache = async () => {
        setIsLoading(true);
        try {
            await queryClient.cancelQueries();
            queryClient.clear();

            localStorage.removeItem('quivery-playback-settings');
            localStorage.removeItem('quivery-player-storage');

            const keysToRemove: string[] = [];
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key && key.startsWith('scroll-')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => sessionStorage.removeItem(key));

            await calculateSize();
            
            toast.success('Cache cleared successfully. Reloading...');
            
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (error) {
            console.error('Error clearing cache:', error);
            toast.error('Failed to clear cache');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        usage,
        formattedUsage: formatBytes(usage),
        clearCache,
        isLoading
    };
};