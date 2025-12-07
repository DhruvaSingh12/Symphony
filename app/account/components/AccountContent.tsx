"use client";

import React, { useState, useEffect } from "react";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import toast from "react-hot-toast";
import useLoadAvatar from "@/hooks/useLoadAvatar";
import { UserDetails } from "@/types";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { User, Cake, Users } from "lucide-react";
import DetailsForm from "./DetailsForm";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AccountsContent = () => {
  const supabaseClient = useSupabaseClient();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const avatarUrl = useLoadAvatar(userDetails);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  const router = useRouter();
  const { isLoading, user } = useUser();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const { data, error } = await supabaseClient
        .from("users")
        .select("id, first_name, last_name, gender, dateOfBirth, avatar_url")
        .single();

      if (error) {
        toast.error(error.message);
      } else if (data) {
        const typedData = data as unknown as UserDetails;
        setUserDetails(typedData);
        setIsNewUser(!typedData.first_name || !typedData.last_name || !typedData.gender || !typedData.dateOfBirth);
        setFirstName(typedData.first_name || "");
        setLastName(typedData.last_name || "");
        setGender(typedData.gender || "");
        setDateOfBirth(typedData.dateOfBirth || "");
      }
    };

    fetchUserDetails();
  }, [supabaseClient]);

  const handleSave = async () => {
    if (!firstName || !lastName || !gender || !dateOfBirth || !image) {
      toast.error("Please fill in all details.");
      return;
    }

    let newAvatarUrl = avatarUrl;

    if (image) {
      const { data, error } = await supabaseClient.storage
        .from("avatar")
        .upload(`public/${userDetails?.id}`, image);
      if (error) {
        toast.error(error.message);
        return;
      }
      newAvatarUrl = data?.path;
    }

    const updates = {
      id: userDetails?.id || '',
      first_name: firstName,
      last_name: lastName,
      gender,
      dateOfBirth,
      avatar_url: newAvatarUrl || null,
    };

    const { error: updateError, data: updatedUserData } = await supabaseClient.from("users").upsert(updates);
    if (updateError) {
      toast.error(updateError.message);
    } else {
      toast.success("Profile updated successfully");
      if (updatedUserData) {
        setUserDetails(updatedUserData[0]); 
      }
    }
  };

  return (
    <Card className="bg-card border-border">
      {isNewUser ? (
        <DetailsForm
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          gender={gender}
          setGender={setGender}
          dateOfBirth={dateOfBirth}
          setDateOfBirth={setDateOfBirth}
          setImage={setImage}
          handleSave={handleSave}
        />
      ) : (
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src={avatarUrl || undefined} alt="Avatar" />
              <AvatarFallback>
                <User className="h-16 w-16" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-lg font-medium">
                  {userDetails?.first_name} {userDetails?.last_name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Cake className="h-4 w-4 text-muted-foreground" />
                <span className="text-lg">{userDetails?.dateOfBirth}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-lg">{userDetails?.gender}</span>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default AccountsContent;
