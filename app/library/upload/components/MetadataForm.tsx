"use client";

import { UseFormRegister, FieldValues } from "react-hook-form";
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Command as CommandPrimitive } from "cmdk";
import { Check, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from "react";
import { Artist, Album } from "@/types";

interface MetadataFormProps {
    register: UseFormRegister<FieldValues>;
    isLoading: boolean;
    selectedArtists: (Artist | { name: string })[];
    setSelectedArtists: React.Dispatch<React.SetStateAction<(Artist | { name: string })[]>>;
    selectedAlbum: Album | { title: string } | null;
    setSelectedAlbum: (value: Album | { title: string } | null) => void;
    uniqueArtists: Artist[];
    uniqueAlbums: Album[];
}

const MetadataForm: React.FC<MetadataFormProps> = ({
    register,
    isLoading,
    selectedArtists,
    setSelectedArtists,
    selectedAlbum,
    setSelectedAlbum,
    uniqueArtists,
    uniqueAlbums
}) => {
    const [artistInput, setArtistInput] = useState("");
    const [albumInput, setAlbumInput] = useState("");

    // Refs for clicking outside to close lists
    const artistContainerRef = useRef<HTMLDivElement>(null);
    const albumContainerRef = useRef<HTMLDivElement>(null);

    const [showArtistList, setShowArtistList] = useState(false);
    const [showAlbumList, setShowAlbumList] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (artistContainerRef.current && !artistContainerRef.current.contains(event.target as Node)) {
                setShowArtistList(false);
            }
            if (albumContainerRef.current && !albumContainerRef.current.contains(event.target as Node)) {
                setShowAlbumList(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleArtist = (artist: Artist | { name: string }) => {
        const isSelected = selectedArtists.some(a => a.name === artist.name);
        if (isSelected) {
            setSelectedArtists(prev => prev.filter(a => a.name !== artist.name));
        } else {
            setSelectedArtists(prev => [...prev, artist]);
        }
        setArtistInput("");
        setShowArtistList(false);
    };

    const handleAlbumSelect = (album: Album | { title: string }) => {
        setSelectedAlbum(album);
        setAlbumInput("");
        setShowAlbumList(false);
    };

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Track Title</label>
                <Input
                    id="title"
                    disabled={isLoading}
                    {...register('title', { required: true })}
                    placeholder="e.g. Midnight City"
                    className="bg-transparent border-0 border-b border-border rounded-none px-0 shadow-none focus-visible:ring-0 focus-visible:border-foreground transition-colors text-xs md:text-sm h-6 md:h-8"
                />
            </div>

            <div className="grid grid-cols-2 gap-4 md:gap-6">
                {/* Artist Selection */}
                <div className="space-y-1 flex flex-col relative" ref={artistContainerRef}>
                    <label className="text-sm font-medium text-muted-foreground">Artists</label>
                    <Command className="bg-transparent overflow-visible">
                        <div className="relative">
                            <CommandPrimitive.Input
                                placeholder="Enter artist(s) name"
                                value={artistInput}
                                onValueChange={(val) => {
                                    setArtistInput(val);
                                    setShowArtistList(!!val);
                                }}
                                onFocus={() => {
                                    if (artistInput) setShowArtistList(true);
                                }}
                                className={cn(
                                    "w-full bg-transparent text-foreground placeholder:text-muted-foreground px-0",
                                    "border-0 border-b border-border focus:outline-none focus:border-foreground transition-colors h-6 md:h-8 text-xs md:text-sm"
                                )}
                            />
                        </div>

                        {showArtistList && (
                            <div className="absolute top-full left-0 w-full z-50 bg-popover text-popover-foreground border border-border rounded-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <CommandList>
                                    <CommandEmpty>
                                        <button
                                            type="button"
                                            onClick={() => toggleArtist({ name: artistInput })}
                                            className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition cursor-pointer"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Create &quot;{artistInput}&quot;
                                        </button>
                                    </CommandEmpty>
                                    <CommandGroup>
                                        {uniqueArtists.map((artist) => {
                                            const isSelected = selectedArtists.some(a => a.name === artist.name);
                                            return (
                                                <CommandItem
                                                    key={artist.id}
                                                    value={artist.name}
                                                    onSelect={() => toggleArtist(artist)}
                                                    className="cursor-pointer px-3 py-2 aria-selected:bg-accent aria-selected:text-accent-foreground"
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            isSelected ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {artist.name}
                                                </CommandItem>
                                            );
                                        })}
                                    </CommandGroup>
                                </CommandList>
                            </div>
                        )}
                    </Command>

                    {/* Artist Tags */}
                    <div className="flex flex-wrap gap-2 min-h-[1.5rem]">
                        {selectedArtists.map(artist => (
                            <div key={artist.name} className="flex items-center gap-1 bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-md">
                                {artist.name}
                                <button type="button" onClick={() => toggleArtist(artist)} className="hover:text-foreground transition">
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Album Selection */}
                <div className="space-y-1 flex flex-col relative" ref={albumContainerRef}>
                    <label className="text-sm font-medium text-muted-foreground">Album</label>
                    <Command className="bg-transparent overflow-visible">
                        <div className="relative">
                            <CommandPrimitive.Input
                                placeholder={selectedAlbum?.title || "Enter album name"}
                                value={albumInput}
                                onValueChange={(val) => {
                                    setAlbumInput(val);
                                    setShowAlbumList(!!val);
                                }}
                                onFocus={() => {
                                    if (albumInput) setShowAlbumList(true);
                                }}
                                className={cn(
                                    "w-full bg-transparent text-foreground placeholder:text-muted-foreground px-0",
                                    "border-0 border-b border-border focus:outline-none focus:border-foreground transition-colors h-6 md:h-8 text-xs md:text-sm"
                                )}
                            />
                            {selectedAlbum && !albumInput && (
                                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
                                    <Check className="h-4 w-4 text-primary" />
                                </div>
                            )}
                        </div>

                        {showAlbumList && (
                            <div className="absolute top-full left-0 w-full z-50 mt-1 bg-popover text-popover-foreground border border-border rounded-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <CommandList>
                                    <CommandEmpty>
                                        <button
                                            type="button"
                                            onClick={() => handleAlbumSelect({ title: albumInput })}
                                            className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition cursor-pointer"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Create &quot;{albumInput}&quot;
                                        </button>
                                    </CommandEmpty>
                                    <CommandGroup>
                                        {uniqueAlbums.map((album) => (
                                            <CommandItem
                                                key={album.id}
                                                value={album.title}
                                                onSelect={() => handleAlbumSelect(album)}
                                                className="cursor-pointer px-3 py-2 aria-selected:bg-accent aria-selected:text-accent-foreground"
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedAlbum?.title === album.title ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {album.title}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </div>
                        )}
                    </Command>
                </div>
            </div>
        </div>
    );
}

export default MetadataForm;