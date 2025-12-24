"use client";

import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { extractMetadata } from '@/lib/metadata';
import UploadItem from './UploadItem';
import Button from '@/components/Button';
import { FaArrowUpFromBracket, FaCloudArrowUp, FaPlus } from 'react-icons/fa6';

export interface BatchItem {
    id: string;
    file: File;
    lyricsFile?: File;
    title: string;
    artists: string[];
    album: string;
    image?: File | string;
    duration: number;
    status: 'idle' | 'processing' | 'uploading' | 'completed' | 'error';
}

const BatchUploadForm = () => {
    const [items, setItems] = useState<BatchItem[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(-1);

    const onFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Separate audio and lyric files
        const audioFiles = files.filter(f => f.type.startsWith('audio/'));
        const lyricFiles = files.filter(f => f.name.endsWith('.lrc'));

        if (items.length + audioFiles.length > 10) {
            toast.error("Maximum 10 songs per batch");
            return;
        }

        const newItems: BatchItem[] = [];

        for (const file of audioFiles) {
            const id = crypto.randomUUID();
            toast.loading(`Extracting metadata for ${file.name}...`, { id: `meta-${id}` });

            const meta = await extractMetadata(file);

            // Auto-pair lyrics by filename (ignoring extension)
            const baseName = file.name.replace(/\.[^/.]+$/, "");
            const lyricsFile = lyricFiles.find(l => l.name.replace(/\.[^/.]+$/, "") === baseName);

            newItems.push({
                id,
                file,
                lyricsFile,
                title: meta.title || baseName,
                artists: meta.artists,
                album: meta.album || "",
                duration: meta.duration || 0,
                // If meta.image exists, we'll handle it in UploadItem for preview
                image: undefined, // Will be set by metadata if available
                status: 'idle'
            });

            toast.success(`Metadata ready!`, { id: `meta-${id}` });
        }

        setItems(prev => [...prev, ...newItems]);
        // Clear the input
        e.target.value = '';
    };

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const updateItem = (id: string, updates: Partial<BatchItem>) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const handleUpload = async () => {
        if (items.length === 0 || isUploading) return;
        setIsUploading(true);
        setCurrentIndex(0);
        toast.loading("Starting batch upload...", { id: 'batch-upload' });
    };

    // Sequential process manager
    const onProcessComplete = useCallback((_id: string, _success: boolean) => {
        setCurrentIndex(prev => prev + 1);
    }, []);

    // Watch for batch completion
    useEffect(() => {
        if (isUploading && currentIndex !== -1 && currentIndex >= items.length) {
            setIsUploading(false);
            setCurrentIndex(-1);
            toast.success("Batch processing complete", { id: 'batch-upload' });
        }
    }, [currentIndex, items.length, isUploading]);

    return (
        <div className="flex flex-col h-full gap-y-2">
            <div className="flex items-end justify-end">
                <div className="flex items-center">
                    {items.length > 0 && items.length < 10 && !isUploading && (
                        <label className="px-4 py-2 border border-border bg-secondary text-secondary-foreground rounded-xl flex flex-row text-sm font-medium items-center gap-x-1 cursor-pointer hover:bg-secondary/80 transition mr-2">
                            <FaPlus className="text-xs" /> Add
                            <input
                                type="file"
                                multiple
                                accept="audio/*,.lrc"
                                className="hidden"
                                onChange={onFilesSelected}
                            />
                        </label>
                    )}
                    {items.length > 0 && (
                        <Button
                            disabled={isUploading}
                            onClick={handleUpload}
                            className="px-4 py-1 bg-foreground text-background rounded-xl flex flex-row text-base font-medium items-center gap-x-1"
                        >
                            <FaArrowUpFromBracket /> {isUploading ? 'Uploading...' : 'Upload'} {items.length} {items.length === 1 ? 'track' : 'tracks'}
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4 min-h-0">
                {items.length === 0 ? (
                    <label className="group h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-foreground/50 transition-all duration-300">
                        <FaCloudArrowUp size={48} className="mb-4 opacity-20 group-hover:opacity-60 group-hover:text-foreground transition-all duration-300" />
                        <p className="font-medium opacity-60 group-hover:opacity-100 uppercase transition-opacity duration-300">Drop your tracks here or click to browse</p>
                        <p className="text-sm opacity-60 group-hover:opacity-100 uppercase transition-opacity duration-300">Up to 10 songs + 10 lyric files</p>

                        <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-3 text-[10px] uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity duration-300 max-w-[400px]">
                            <div className="flex items-center gap-x-2">
                                <span className="h-1 w-1 rounded-full" />
                                Metadata Extraction
                            </div>
                            <div className="flex items-center gap-x-2">
                                <span className="h-1 w-1 rounded-full" />
                                112 kbps MP3 Encoding
                            </div>
                            <div className="flex items-center gap-x-2">
                                <span className="h-1 w-1 rounded-full" />
                                Lyric Auto-pairing
                            </div>
                            <div className="flex items-center gap-x-2">
                                <span className="h-1 w-1 rounded-full" />
                                Sequential Processing
                            </div>
                        </div>
                        <input
                            type="file"
                            multiple
                            accept="audio/*,.lrc"
                            className="hidden"
                            onChange={onFilesSelected}
                        />
                    </label>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        {items.map((item, index) => (
                            <UploadItem
                                key={item.id}
                                item={item}
                                onRemove={() => removeItem(item.id)}
                                onUpdate={(updates) => updateItem(item.id, updates)}
                                isUploading={isUploading}
                                shouldStart={index === currentIndex}
                                onComplete={(success) => onProcessComplete(item.id, success)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BatchUploadForm;