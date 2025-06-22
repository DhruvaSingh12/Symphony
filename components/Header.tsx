"use client";

import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { RxCaretLeft, RxCaretRight } from "react-icons/rx";
import { HiHome } from "react-icons/hi";
import { BiSearch } from "react-icons/bi";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import useAuthModal from "@/hooks/useAuthModal";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useUser } from "@/hooks/useUser";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import useLoadAvatar from "@/hooks/useLoadAvatar";
import { UserDetails } from "@/types";
import { cn } from "@/lib/utils";

interface HeaderProps {
  children: React.ReactNode;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ children, className }) => {
  const authModal = useAuthModal();
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  const { user } = useUser();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const avatarUrl = useLoadAvatar(userDetails);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string>("/images/default-avatar.png");

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data, error } = await supabaseClient
          .from("users")
          .select("id, avatar_url, first_name, last_name, gender, dateOfBirth")
          .eq("id", user.id)
          .single();

        if (error) {
          toast.error(error.message);
        } else {
          const userDetails: UserDetails = {
            id: data?.id || "",
            first_name: data?.first_name,
            last_name: data?.last_name,
            avatar_url: data?.avatar_url,
            gender: data?.gender,
            dateOfBirth: data?.dateOfBirth,
          };

          setUserDetails(userDetails);
        }
      }
    };

    fetchUserProfile();
  }, [user, supabaseClient]);

  useEffect(() => {
    if (avatarUrl) {
      setCurrentAvatarUrl(avatarUrl);
    }
  }, [avatarUrl]);

  const handleLogout = async () => {
    const { error } = await supabaseClient.auth.signOut();
    router.refresh();

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Logged out successfully");
    }
  };

  return (
    <div className={twMerge("px-5 pb-5 pt-2 rounded-lg bg-background/20 backdrop-blur-sm", className, "w-full h-full")}>
      <div className="w-full mb-4 flex items-center justify-between">
        <div className="hidden md:flex gap-x-2 items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full bg-foreground/10 hover:bg-foreground/20 transition"
          >
            <RxCaretLeft className="text-foreground" size={35} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.forward()}
            className="rounded-full bg-foreground/10 hover:bg-foreground/20 transition"
          >
            <RxCaretRight className="text-foreground" size={35} />
          </Button>
        </div>
        <div className="flex md:hidden gap-x-2 items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="rounded-full bg-foreground/10 hover:bg-foreground/20 transition"
          >
            <HiHome className="text-foreground" size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/search")}
            className="rounded-full bg-foreground/10 hover:bg-foreground/20 transition"
          >
            <BiSearch className="text-foreground" size={20} />
          </Button>
        </div>
        <div className="flex items-center gap-x-4">
          {user ? (
            <div className="flex gap-x-1 items-center">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="bg-foreground/10 hover:bg-foreground/20 text-foreground border-foreground/20"
              >
                Logout
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={currentAvatarUrl} alt="User Avatar" />
                      <AvatarFallback>
                        {userDetails?.first_name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-sm">
                  <DropdownMenuItem onClick={() => router.push("/account")}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex gap-x-4 items-center">
              <Button
                variant="outline"
                onClick={authModal.onOpen}
                className="bg-foreground/10 hover:bg-foreground/20 text-foreground border-foreground/20"
              >
                Log In
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="flex-grow h-full">{children}</div>
    </div>
  );
};

export default Header;
