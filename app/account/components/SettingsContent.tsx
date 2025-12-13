"use client";

import React, { useState, useEffect } from "react";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import useLoadAvatar from "@/hooks/useLoadAvatar";
import { UserDetails } from "@/types";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { User, Cake, Users, ChevronRight, Shield, Pencil, Mail, Volume2, Trash2, Music, Headphones, Radio, Zap, Globe } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import toast from "react-hot-toast";

const SettingsContent = () => {
    const supabaseClient = useSupabaseClient();
    const router = useRouter();
    const { user } = useUser();
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    const avatarUrl = useLoadAvatar(userDetails);

    // Profile editing states
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [gender, setGender] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Playback settings (stored locally for now)
    const [autoplay, setAutoplay] = useState(true);
    const [crossfade, setCrossfade] = useState(false);
    const [normalizeVolume, setNormalizeVolume] = useState(true);
    const [audioQuality, setAudioQuality] = useState("high");

    useEffect(() => {
        const fetchUserDetails = async () => {
            const { data, error } = await supabaseClient
                .from("users")
                .select("id, first_name, last_name, gender, dateOfBirth, avatar_url")
                .single();

            if (error) {
                console.error(error.message);
            } else if (data) {
                const typedData = data as unknown as UserDetails;
                setUserDetails(typedData);
                setFirstName(typedData.first_name || "");
                setLastName(typedData.last_name || "");
                setGender(typedData.gender || "");
                setDateOfBirth(typedData.dateOfBirth || "");
            }
        };

        if (user) {
            fetchUserDetails();
        }
    }, [supabaseClient, user]);

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
            const fileName = `public/${userDetails?.id}-${Date.now()}`;
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
            gender,
            dateOfBirth,
            avatar_url: newAvatarUrl || null,
        };

        const { error: updateError } = await supabaseClient.from("users").upsert(updates);
        if (updateError) {
            toast.error(updateError.message);
        } else {
            toast.success("Profile updated successfully");
            setUserDetails({ ...userDetails, ...updates } as UserDetails);
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

    const handleComingSoon = () => {
        toast("Coming soon!", { icon: "🚀" });
    };

    const isNewUser = !userDetails?.first_name || !userDetails?.last_name;

    return (
        <div className="space-y-2">
            {/* Profile Section */}
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
                                    <Avatar className="h-20 w-20 border-2 border-border">
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
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gender">Gender</Label>
                                    <Select value={gender} onValueChange={setGender}>
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
                                <Avatar className="h-16 w-16 border-2 border-border">
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

            {/* Playback Section */}
            <Card className="border-border bg-card/60">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Headphones className="h-5 w-5 text-primary" />
                        Playback
                    </CardTitle>
                    <CardDescription>Customize your listening experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                            <Zap className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Autoplay</p>
                                <p className="text-xs text-muted-foreground">Play similar songs when queue ends</p>
                            </div>
                        </div>
                        <Switch checked={autoplay} onCheckedChange={setAutoplay} />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                            <Radio className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Crossfade</p>
                                <p className="text-xs text-muted-foreground">Smooth transition between songs</p>
                            </div>
                        </div>
                        <Switch checked={crossfade} onCheckedChange={setCrossfade} />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                            <Volume2 className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Normalize Volume</p>
                                <p className="text-xs text-muted-foreground">Keep volume consistent across tracks</p>
                            </div>
                        </div>
                        <Switch checked={normalizeVolume} onCheckedChange={setNormalizeVolume} />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                            <Music className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Audio Quality</p>
                                <p className="text-xs text-muted-foreground">Higher quality uses more data</p>
                            </div>
                        </div>
                        <Select value={audioQuality} onValueChange={setAudioQuality}>
                            <SelectTrigger className="w-28">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="lossless">Lossless</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border bg-card/60">
                <CardContent className="p-3">
                    <button
                        onClick={handleComingSoon}
                        className="w-full flex items-center justify-between py-3 px-1 hover:bg-muted/50 rounded-md transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                            <div className="text-left">
                                <p className="text-sm font-medium">Clear Cache</p>
                                <p className="text-xs text-muted-foreground">Free up storage space</p>
                            </div>
                        </div>
                        <span className="text-xs text-muted-foreground">0 MB</span>
                    </button>
                </CardContent>
            </Card>

            <Card className="border-border bg-card/60">
                <CardContent className="p-3">
                    <button
                        onClick={() => router.push("/privacypolicy")}
                        className="w-full flex items-center justify-between py-3 px-1 hover:bg-muted/50 rounded-md transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <Shield className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                            <span className="text-sm">Privacy Policy</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button
                        onClick={handleComingSoon}
                        className="w-full flex items-center justify-between py-3 px-1 hover:bg-muted/50 rounded-md transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <Globe className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                            <span className="text-sm">Open Source Licenses</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                </CardContent>
            </Card>
        </div>
    );
};

export default SettingsContent;