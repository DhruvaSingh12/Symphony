"use client";

import useAuthModal from "@/hooks/ui/useAuthModal";
import { useUser } from "@/hooks/auth/useUser";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLikeSong, useIsLiked } from "@/hooks/mutations/useLikeSong";
import { useState } from "react";
import { Song } from "@/types";

interface LikeButtonProps {
    songId: number;
    song?: Song;
    className?: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({
    songId,
    song,
    className
}) => {
    const authModal = useAuthModal();
    const { user } = useUser();
    const [isAnimate, setIsAnimate] = useState(false);

    const { data: isLiked } = useIsLiked(songId);
    const likeMutation = useLikeSong();

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!user) {
            return authModal.onOpen();
        }

        setIsAnimate(true);
        setTimeout(() => setIsAnimate(false), 200);

        likeMutation.mutate({
            songId,
            isCurrentlyLiked: !!isLiked,
            song
        });
    };

    return (
        <Button
            type="button"
            onClick={handleLike}
            size="icon"
            variant="ghost"
            className={cn(
                "hover:opacity-75 transition rounded-full active:scale-90",
                isAnimate && "scale-125",
                className
            )}
            aria-label={isLiked ? "Unlike" : "Like"}
            disabled={likeMutation.isPending}
        >
            <Heart
                className={cn(
                    "md:h-5 md:w-5 h-4 w-4 transition-all duration-200",
                    isLiked ? "fill-primary text-primary" : "text-muted-foreground"
                )}
            />
        </Button>
    );
}

export default LikeButton;