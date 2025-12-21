"use client";

import useAuthModal from "@/hooks/ui/useAuthModal";
import { useUser } from "@/hooks/auth/useUser";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
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

    // Ensure liked songs are fetched and cached
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
        <Button
            type="button"
            onClick={handleLike}
            size="icon"
            variant="ghost"
            className={cn("hover:opacity-75 transition rounded-full", className)}
            aria-label={isLiked ? "Unlike" : "Like"}
            disabled={likeMutation.isPending}
        >
            <Heart className={cn("md:h-5 md:w-5 h-4 w-4", isLiked ? "fill-primary text-primary" : "text-muted-foreground")} />
        </Button>
    );
}

export default LikeButton;