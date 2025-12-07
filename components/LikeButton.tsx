"use client";

import useAuthModal from "@/hooks/useAuthModal";
import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
    songId: string;
    className?: string;
}

const LikeButton: React.FC<LikeButtonProps> =({
    songId,
    className
}) => {
    const router = useRouter();
    const supabaseClient = useSupabaseClient();

    const authModal = useAuthModal();
    const {user} = useUser();

    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        if(!user?.id){
            return;
        }

        const fetchData = async () => {
            const {data, error} = await supabaseClient
            .from('liked_songs')
            .select('*')
            .eq('user_id', user.id)
            .eq('song_id', Number(songId))
            .single();

            if(!error && data){
                setIsLiked(true);
            }
        };

        fetchData();
    }, [songId, supabaseClient, user?.id]);

    const handleLike = async () => {
        if(!user){
            return authModal.onOpen();
        }

        if(isLiked) {
            const {error} = await supabaseClient
                .from('liked_songs')
                .delete()
                .eq('user_id', user.id)
                .eq('song_id', Number(songId));

                if(error) {
                    toast.error(error.message);
                } 
                else {
                    setIsLiked(false);
                    toast.success('Removed from Liked Songs');
                }
        } 
        else {
            const {error} = await supabaseClient
            .from('liked_songs')
            .insert({
                user_id: user.id,
                song_id: Number(songId)
            });

            if(error) {
                toast.error(error.message);
            }
            else {
                setIsLiked(true);
                toast.success('Added to Liked Songs!');
            }
        }

        router.refresh();
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