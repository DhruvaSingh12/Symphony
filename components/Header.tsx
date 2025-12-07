"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RxCaretLeft, RxCaretRight } from "react-icons/rx";
import { HiHome } from "react-icons/hi";
import { BiSearch } from "react-icons/bi";
import { LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useAuthModal from "@/hooks/useAuthModal";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { useUser } from "@/hooks/useUser";
import toast from "react-hot-toast";
import useLoadAvatar from "@/hooks/useLoadAvatar";
import { UserDetails } from "@/types";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
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
          const typedData = data as unknown as UserDetails;
          const userDetails: UserDetails = {
            id: typedData?.id || "",
            first_name: typedData?.first_name,
            last_name: typedData?.last_name,
            avatar_url: typedData?.avatar_url,
            gender: typedData?.gender,
            dateOfBirth: typedData?.dateOfBirth,
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
    <div className={cn("px-5 pb-5 pt-2 rounded-lg bg-gradient-to-b from-neutral-100/80 via-neutral-200 to-neutral-300 dark:from-neutral-900/90 dark:via-neutral-950 dark:to-neutral-900", className, "w-full h-full")}>
      <div className="w-full mb-4 flex items-center justify-between">
        <div className="hidden md:flex gap-x-2 items-center">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => router.back()}
            className="rounded-full bg-background/80 border-border"
          >
            <RxCaretLeft className="h-6 w-6" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => router.forward()}
            className="rounded-full bg-background/80 border-border"
          >
            <RxCaretRight className="h-6 w-6" />
          </Button>
        </div>
        <div className="flex md:hidden gap-x-2 items-center">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => router.push("/")}
            className="rounded-full"
          >
            <HiHome className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => router.push("/search")}
            className="rounded-full"
          >
            <BiSearch className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex items-center gap-x-3">
          <ThemeToggleButton />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 p-0">
                  <Avatar className="h-10 w-10 border-2 border-border">
                    <AvatarImage
                      src={currentAvatarUrl}
                      alt={userDetails?.first_name || "User"}
                    />
                    <AvatarFallback>
                      {userDetails?.first_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>
                  {userDetails?.first_name
                    ? `${userDetails.first_name} ${userDetails.last_name || ""}`
                    : "My Account"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/account")}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={authModal.onOpen} variant="default" className="rounded-full px-6 py-2">
              Log In
            </Button>
          )}
        </div>
      </div>
      <div className="flex-grow h-full">{children}</div>
    </div>
  );
};

export default Header;
