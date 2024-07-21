"use client";

import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { RxCaretLeft, RxCaretRight } from "react-icons/rx";
import { HiHome } from "react-icons/hi";
import { BiSearch } from "react-icons/bi";
import Button from "./Button";
import useAuthModal from "@/hooks/useAuthModal";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useUser } from "@/hooks/useUser";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { FaUserAlt } from "react-icons/fa";
import useLoadAvatar from "@/hooks/useLoadAvatar";
import { UserDetails } from "@/types";

interface HeaderProps {
  children: React.ReactNode;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ children, className }) => {
  const authModal = useAuthModal();
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  const { user } = useUser();
  const [bgColor, setBgColor] = useState<string>("");
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const avatarUrl = useLoadAvatar(userDetails);

  const colors = [
    ["from-red-700", "to-yellow-700"],
    ["from-green-700", "to-blue-700"],
    ["from-indigo-700", "to-purple-700"],
    ["from-pink-700", "to-orange-700"],
    ["from-teal-700", "to-cyan-700"],
    ["from-lime-700", "to-amber-700"],
    ["from-emerald-700", "to-violet-700"],
    ["from-fuchsia-700", "to-rose-700"],
    ["from-sky-700", "to-teal-900"],
    ["from-red-700", "to-pink-700"],
    ["from-purple-700", "to-indigo-700"],
    ["from-blue-700", "to-cyan-700"],
    ["from-green-700", "to-lime-700"],
    ["from-amber-700", "to-orange-700"],
    ["from-emerald-700", "to-fuchsia-700"],
    ["from-indigo-700", "to-teal-700"],
    ["from-red-700", "to-amber-700"],
    ["from-purple-700", "to-pink-700"],
    ["from-green-700", "to-fuchsia-700"],
  ];

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    setBgColor(`bg-gradient-to-b ${colors[randomIndex][0]} ${colors[randomIndex][1]}`);
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data, error } = await supabaseClient
          .from("users")
          .select("avatar_url, first_name, last_name, gender, dateOfBirth")
          .eq("id", user.id)
          .single();

        if (error) {
          toast.error(error.message);
        } else {
          setUserDetails(data);
        }
      }
    };

    fetchUserProfile();
  }, [user, supabaseClient]);

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
    <div className={twMerge(`${bgColor} px-5 pb-5 pt-2 rounded-lg`, className, "w-full h-full")}>
      <div className="w-full mb-4 flex items-center justify-between">
        <div className="hidden md:flex gap-x-2 items-center">
          <button
            onClick={() => router.back()}
            className="rounded-full bg-black flex items-center justify-center hover:opacity-75 transition"
          >
            <RxCaretLeft className="text-white" size={35} />
          </button>
          <button
            onClick={() => router.forward()}
            className="rounded-full bg-black flex items-center justify-center hover:opacity-75 transition"
          >
            <RxCaretRight className="text-white" size={35} />
          </button>
        </div>
        <div className="flex md:hidden gap-x-2 items-center">
          <button
            onClick={() => router.push("/")}
            className="rounded-full bg-white p-2 flex items-center justify-center hover:opacity-75 transition"
          >
            <HiHome className="text-black" size={20} />
          </button>
          <button
            onClick={() => router.push("/search")}
            className="rounded-full bg-white p-2 flex items-center justify-center hover:opacity-75 transition"
          >
            <BiSearch className="text-black" size={20} />
          </button>
        </div>
        <div className="flex items-center gap-x-4">
          {user ? (
            <div className="flex gap-x-1 items-center">
              <Button onClick={handleLogout} className="bg-white px-4 py-2 text-black rounded-full">
                Logout
              </Button>
              <Button onClick={() => router.push("/account")} className="bg-transparent px-2 py-2 rounded-full">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="User Avatar"
                    className="h-12 w-12 rounded-full"
                  />
                ) : (
                  <FaUserAlt />
                )}
              </Button>
            </div>
          ) : (
            <div className="flex gap-x-4 items-center">
              <Button onClick={authModal.onOpen} className="bg-white text-black rounded-full px-6 py-2">
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
