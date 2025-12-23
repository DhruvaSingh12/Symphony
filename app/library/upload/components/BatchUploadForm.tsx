"use client";

import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { extractMetadata } from '@/lib/metadata';
import UploadItem from './UploadItem';
import Button from '@/components/Button';
import { FaPlus, FaCloudUploadAlt } from 'react-icons/fa';

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
        <div className="flex flex-col h-full gap-y-6">
            <div className="flex items-center justify-between">
                <div className="flex gap-x-2">
                    {items.length > 0 && (
                        <Button
                            disabled={isUploading}
                            onClick={handleUpload}
                            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-x-2"
                        >
                            <FaCloudUploadAlt /> ({items.length})
                        </Button>
                    )}

                    <label className={`
                        cursor-pointer bg-foreground hover:bg-foreground/80 text-background 
                        px-2 py-1 rounded-full font-sm transition flex items-center gap-x-2
                        ${items.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}
                    `}>
                        <FaPlus />
                        {items.length === 0 ? "" : "More"}
                        <input
                            type="file"
                            multiple
                            accept="audio/*,.lrc"
                            className="hidden"
                            onChange={onFilesSelected}
                            disabled={items.length >= 10 || isUploading}
                        />
                    </label>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 min-h-0">
                {items.length === 0 ? (
                    <label className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-secondary/20 transition-colors">
                        <FaCloudUploadAlt size={48} className="mb-4 opacity-20" />
                        <p className="font-medium">Drop your tracks here or click to browse</p>
                        <p className="text-xs mt-1">Up to 10 songs + 10 .lrc files (Max 20 total)</p>
                        <p className="text-xs opacity-60">Standard: 112kbps / 48kHz</p>
                        <input
                            type="file"
                            multiple
                            accept="audio/*,.lrc"
                            className="hidden"
                            onChange={onFilesSelected}
                        />
                    </label>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
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