"use client";

import useAuthModal from "@/hooks/useAuthModal";
import { useUser } from "@/hooks/useUser";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useLikeSong, useIsLiked } from "@/hooks/mutations/useLikeSong";
import { useLikedSongs } from "@/hooks/queries/useLikedSongs";

interface LikeButtonProps {
    songId: number;
    className?: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({
    songId,
    className
}) => {
    const authModal = useAuthModal();
    const { user } = useUser();
    useLikedSongs();

    const isLiked = useIsLiked(songId);
    const likeMutation = useLikeSong();

    const handleLike = () => {
        if (!user) {
            return authModal.onOpen();
        }

        likeMutation.mutate({
            songId,
            isCurrentlyLiked: isLiked
        });
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        type="button"
                        onClick={handleLike}
                        size="icon"
                        variant="ghost"
                        className={cn("hover:opacity-75 transition rounded-full", className)}
                        aria-label={isLiked ? "Unlike" : "Like"}
                        disabled={likeMutation.isPending}
                    >
                        <Heart className={cn("h-5 w-5", isLiked ? "fill-primary text-primary" : "text-muted-foreground")} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    {isLiked ? "Remove from liked songs" : "Add to liked songs"}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

export default LikeButton;