"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ActionCardProps {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    description?: string;
}

const ActionCard: React.FC<ActionCardProps> = ({
    label,
    icon: Icon,
    onClick,
    description
}) => {
    return (
        <div
            onClick={onClick}
            className="group flex flex-col gap-y-3 p-3 rounded-md hover:bg-accent/50 cursor-pointer w-full flex-shrink-0 transition"
        >
            <div className="relative aspect-square w-full rounded-md overflow-hidden shadow-lg bg-secondary flex items-center justify-center group-hover:bg-background transition">
                <Icon className="w-1/3 h-1/3 text-muted-foreground group-hover:text-foreground transition transform" />
            </div>
            <div>
                <div className="font-semibold text-sm md:text-base truncate">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="text-sm text-foreground cursor-pointer truncate">
                                    {label}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{label}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                {description && (
                    <p className="text-xs md:text-sm text-muted-foreground truncate">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ActionCard;
