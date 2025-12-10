import React from 'react';
import { ArrowDownAZ, ArrowUpAZ, ChevronDown, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Input from "@/app/search/components/Input";
import { cn } from "@/lib/utils";

export type SortOption = 'lastUpdated' | 'nameAsc' | 'nameDesc' | 'songCountAsc' | 'songCountDesc';

interface ArtistControlsProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    sortOption: SortOption;
    onSortChange: (option: SortOption) => void;
    className?: string;
}

const ArtistControls: React.FC<ArtistControlsProps> = ({
    searchTerm,
    onSearchChange,
    sortOption,
    onSortChange,
    className
}) => {
    const sortLabels: Record<SortOption, string> = {
        lastUpdated: "Last Updated",
        nameAsc: "Name (A-Z)",
        nameDesc: "Name (Z-A)",
        songCountAsc: "Least Songs",
        songCountDesc: "Most Songs"
    };

    return (
        <div className={cn("flex flex-col gap-y-4 md:flex-row md:items-center md:gap-x-4", className)}>
            {/* Search Input */}
            <div className="flex-1">
                <Input
                    placeholder="Search artists..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="bg-secondary/50 border-0 focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/50"
                />
            </div>

            {/* Sort Pill */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="h-10 rounded-full bg-secondary hover:bg-secondary/80 px-4 font-normal text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:border-border/50"
                    >
                        <ListFilter className="mr-2 h-4 w-4" />
                        Sort by: <span className="text-foreground ml-1 font-medium">{sortLabels[sortOption]}</span>
                        <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-card border-border p-1">
                    <DropdownMenuItem
                        onClick={() => onSortChange('lastUpdated')}
                        className={cn("cursor-pointer", sortOption === 'lastUpdated' && "bg-accent")}
                    >
                        Last Updated
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() => onSortChange(sortOption === 'nameAsc' ? 'nameDesc' : 'nameAsc')}
                        className={cn("cursor-pointer", (sortOption === 'nameAsc' || sortOption === 'nameDesc') && "bg-accent")}
                    >
                        {sortOption === 'nameDesc' ? (
                            <ArrowUpAZ className="mr-2 h-4 w-4 text-muted-foreground" />
                        ) : (
                            <ArrowDownAZ className="mr-2 h-4 w-4 text-muted-foreground" />
                        )}
                        Name
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() => onSortChange(sortOption === 'songCountDesc' ? 'songCountAsc' : 'songCountDesc')}
                        className={cn("cursor-pointer", (sortOption === 'songCountAsc' || sortOption === 'songCountDesc') && "bg-accent")}
                    >
                        {sortOption === 'songCountAsc' ? (
                            <ArrowUpAZ className="mr-2 h-4 w-4 text-muted-foreground" />
                        ) : (
                            <ArrowDownAZ className="mr-2 h-4 w-4 text-muted-foreground" />
                        )}
                        Song Count
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default ArtistControls;