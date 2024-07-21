"use client";

import React, { useState, useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import toast from "react-hot-toast";
import useLoadAvatar from "@/hooks/useLoadAvatar";
import { UserDetails } from "@/types";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { FaUser, FaBirthdayCake, FaTransgender } from "react-icons/fa";
import DetailsForm from "./DetailsForm";

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
        setUserDetails(data);
        setIsNewUser(!data.first_name || !data.last_name || !data.gender || !data.dateOfBirth);
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setGender(data.gender || "");
        setDateOfBirth(data.dateOfBirth || "");
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
    <div className="bg-neutral-900 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">User Details</h2>
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
        <div className="flex items-center space-x-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="h-32 w-32 rounded-full"
            />
          ) : (
            <div className="h-32 w-32 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <FaUser className="text-gray-300" />
              <span className="text-lg font-medium text-gray-300">
                {userDetails?.first_name} {userDetails?.last_name}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <FaBirthdayCake className="text-gray-300" />
              <span className="text-lg text-gray-300">{userDetails?.dateOfBirth}</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaTransgender className="text-gray-300" />
              <span className="text-lg text-gray-300">{userDetails?.gender}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsContent;
