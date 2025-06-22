"use client";

import useAuthModal from "@/hooks/useAuthModal";
import { useUser } from "@/hooks/useUser";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
    songId: string;
    className?: string;
};

const LikeButton: React.FC<LikeButtonProps> =({
    songId,
    className
}) => {
    const router = useRouter();
    const {supabaseClient} = useSessionContext();

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
            .eq('song_id', songId)
            .single();

            if(!error && data){
                setIsLiked(true);
            }
        };

        fetchData();
    }, [songId, supabaseClient, user?.id]);

    const Icon = isLiked ? AiFillHeart : AiOutlineHeart;

    const handleLike = async () => {
        if(!user){
            return authModal.onOpen();
        }

        if(isLiked) {
            const {error} = await supabaseClient
                .from('liked_songs')
                .delete()
                .eq('user_id', user.id)
                .eq('song_id', songId);

                if(error) {
                    toast.error(error.message);
                } 
                else {
                    setIsLiked(false);
                }
        } 
        else {
            const {error} = await supabaseClient
            .from('liked_songs')
            .insert({
                user_id: user.id,
                song_id: songId
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
        <Button
            variant="ghost"
            size="icon"
            onClick={handleLike}
            className={cn(
                "hover:bg-foreground/10 transition-colors",
                className
            )}
        >
            <Icon 
                className={cn(
                    "h-6 w-6 transition-colors",
                    isLiked ? "text-foreground" : "text-foreground/70"
                )} 
            />
        </Button>
    );
}

export default LikeButton;