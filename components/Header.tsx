"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RxCaretLeft, RxCaretRight, RxPerson } from "react-icons/rx";
import { HiHome } from "react-icons/hi";
import { BiSearch } from "react-icons/bi";
import { Heart, Library, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import useAuthModal from "@/hooks/useAuthModal";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { useUser } from "@/hooks/useUser";
import toast from "react-hot-toast";
import useLoadAvatar from "@/hooks/useLoadAvatar";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { Progress } from "@/components/ui/progress";

interface HeaderProps {
  children: React.ReactNode;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ children }) => {
  const authModal = useAuthModal();
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  const { user, userDetails } = useUser();
  const avatarUrl = useLoadAvatar(userDetails);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    const { error } = await supabaseClient.auth.signOut();
    router.refresh();

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Logged out successfully!");
    }
    setIsLoading(false);
  };

  return (
    <div className="w-full px-5 pb-5 pt-5 rounded-lg border border-border relative">
      {isLoading && (
        <div className="absolute top-0 left-0 right-0 z-50 rounded-t-lg overflow-hidden">
          <Progress value={undefined} className="h-1 rounded-none" />
        </div>
      )}
      <div className="w-full mb-2 flex items-center justify-between">
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
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => router.push("/library")}
            className="rounded-full"
          >
            <Library className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => router.push("/liked")}
            className="rounded-full"
          >
            <Heart className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => router.push("/artists")}
            className="rounded-full"
          >
            <RxPerson className="h-5 w-5" />
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
                      src={avatarUrl || undefined}
                      alt={userDetails?.full_name || "User"}
                      className="object-cover"
                    />
                    <AvatarFallback>
                      {userDetails?.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>
                  {userDetails?.full_name || "My Account"}
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