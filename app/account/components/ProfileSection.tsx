"use client";

import React, { useState } from "react";
import { UserDetails } from "@/types";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import useLoadAvatar from "@/hooks/useLoadAvatar";
import { User, Cake, Users, Pencil, Mail } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";

interface ProfileSectionProps {
    userDetails: UserDetails | null;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ userDetails }) => {
    const supabaseClient = useSupabaseClient();
    const { user, refreshUserDetails } = useUser();
    const avatarUrl = useLoadAvatar(userDetails);

    // Profile editing states
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [firstName, setFirstName] = useState(userDetails?.first_name || "");
    const [lastName, setLastName] = useState(userDetails?.last_name || "");
    const [gender, setGender] = useState(userDetails?.gender || "");
    const [dateOfBirth, setDateOfBirth] = useState(userDetails?.dateOfBirth || "");
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        if (!firstName || !lastName) {
            toast.error("First name and last name are required.");
            return;
        }

        setIsSaving(true);
        let newAvatarUrl = userDetails?.avatar_url;

        if (image) {
            const fileName = `public/${userDetails?.id || user?.id}-${Date.now()}`;
            const { data, error } = await supabaseClient.storage
                .from("avatar")
                .upload(fileName, image, { upsert: true });
            if (error) {
                toast.error(error.message);
                setIsSaving(false);
                return;
            }
            newAvatarUrl = data?.path;
        }

        const updates = {
            id: userDetails?.id || user?.id || '',
            first_name: firstName,
            last_name: lastName,
            // Only include gender/dob if they weren't set before
            ...(!userDetails?.gender && { gender }),
            ...(!userDetails?.dateOfBirth && { dateOfBirth }),
            avatar_url: newAvatarUrl || null,
        };

        const { error: updateError } = await supabaseClient.from("users").upsert(updates);
        if (updateError) {
            toast.error(updateError.message);
        } else {
            toast.success("Profile updated successfully");
            await refreshUserDetails();
            setIsEditing(false);
            setImage(null);
            setImagePreview(null);
        }
        setIsSaving(false);
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return "Not set";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const isNewUser = !userDetails?.first_name || !userDetails?.last_name;

    return (
        <Card className="border-border bg-card/60">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Profile
                </CardTitle>
                <CardDescription>
                    {isNewUser ? "Complete your profile to get started" : "Your personal information"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isEditing || isNewUser ? (
                    // Edit Mode
                    <div className="space-y-6">
                        {/* Avatar Upload */}
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <Avatar className="h-20 w-20 border-border border-2">
                                    <AvatarImage src={imagePreview || avatarUrl || undefined} alt="Avatar" className="object-cover" />
                                    <AvatarFallback className="bg-muted">
                                        <User className="h-10 w-10 text-muted-foreground" />
                                    </AvatarFallback>
                                </Avatar>
                                <label
                                    htmlFor="avatar-upload"
                                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                    <Pencil className="h-5 w-5 text-white" />
                                </label>
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Profile Photo</p>
                                <p className="text-xs text-muted-foreground">Click to upload a new photo</p>
                            </div>
                        </div>

                        <Separator />

                        {/* Form Fields */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    placeholder="Enter first name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    placeholder="Enter last name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="dob">Date of Birth</Label>
                                <Input
                                    id="dob"
                                    type="date"
                                    value={dateOfBirth}
                                    onChange={(e) => setDateOfBirth(e.target.value)}
                                    disabled={!!userDetails?.dateOfBirth}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gender">Gender</Label>
                                <Select value={gender} onValueChange={setGender} disabled={!!userDetails?.gender}>
                                    <SelectTrigger id="gender">
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                            {!isNewUser && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setImage(null);
                                        setImagePreview(null);
                                        setFirstName(userDetails?.first_name || "");
                                        setLastName(userDetails?.last_name || "");
                                        setGender(userDetails?.gender || "");
                                        setDateOfBirth(userDetails?.dateOfBirth || "");
                                    }}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </Button>
                            )}
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                ) : (
                    // View Mode
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 border-border border-2">
                                <AvatarImage src={avatarUrl || undefined} alt="Avatar" className="object-cover" />
                                <AvatarFallback className="bg-muted">
                                    <User className="h-8 w-8 text-muted-foreground" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold">
                                    {userDetails?.first_name} {userDetails?.last_name}
                                </h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {user?.email}
                                </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        </div>

                        <Separator />

                        <div className="space-y-1">
                            <div className="flex items-center justify-between py-2 px-1">
                                <div className="flex items-center gap-3">
                                    <Cake className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Date of Birth</span>
                                </div>
                                <span className="text-sm font-medium">{formatDate(userDetails?.dateOfBirth)}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 px-1">
                                <div className="flex items-center gap-3">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Gender</span>
                                </div>
                                <span className="text-sm font-medium capitalize">{userDetails?.gender || "Not set"}</span>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ProfileSection;