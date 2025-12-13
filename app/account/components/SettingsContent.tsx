"use client";

import React, { useState, useEffect } from "react";
import { useSupabaseClient } from "@/providers/SupabaseProvider";
import toast from "react-hot-toast";
import useLoadAvatar from "@/hooks/useLoadAvatar";
import { UserDetails } from "@/types";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { useTheme } from "next-themes";
import {
    User,
    Cake,
    Users,
    ChevronRight,
    LogOut,
    Shield,
    FileText,
    Pencil,
    Mail,
    Info,
    Volume2,
    Bell,
    BellOff,
    Moon,
    Sun,
    Palette,
    HardDrive,
    Trash2,
    Download,
    Music,
    Headphones,
    Radio,
    Clock,
    Zap,
    Globe,
    Lock,
    Eye,
    EyeOff,
    Smartphone,
    Monitor,
    Wifi,
    WifiOff
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const SettingsContent = () => {
    const supabaseClient = useSupabaseClient();
    const router = useRouter();
    const { isLoading, user, userDetails: contextUserDetails } = useUser();
    const { theme, setTheme } = useTheme();
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

    // Notification settings
    const [pushNotifications, setPushNotifications] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(false);
    const [newMusicAlerts, setNewMusicAlerts] = useState(true);

    // Privacy settings
    const [privateProfile, setPrivateProfile] = useState(false);
    const [showListeningActivity, setShowListeningActivity] = useState(true);

    // Data & Storage
    const [offlineMode, setOfflineMode] = useState(false);

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

    const handleLogout = async () => {
        const { error } = await supabaseClient.auth.signOut();
        router.refresh();
        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Logged out successfully!");
            router.push("/");
        }
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
        <div className="space-y-6">
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
                                        <AvatarImage src={imagePreview || avatarUrl || undefined} alt="Avatar" />
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
                                    <AvatarImage src={avatarUrl || undefined} alt="Avatar" />
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

            {/* Appearance Section */}
            <Card className="border-border bg-card/60">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Palette className="h-5 w-5 text-primary" />
                        Appearance
                    </CardTitle>
                    <CardDescription>Customize how Quivery looks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {theme === "dark" ? (
                                <Moon className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <Sun className="h-4 w-4 text-muted-foreground" />
                            )}
                            <div>
                                <p className="text-sm font-medium">Theme</p>
                                <p className="text-xs text-muted-foreground">Choose your preferred theme</p>
                            </div>
                        </div>
                        <Select value={theme} onValueChange={setTheme}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
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

            {/* Notifications Section */}
            <Card className="border-border bg-card/60">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Bell className="h-5 w-5 text-primary" />
                        Notifications
                    </CardTitle>
                    <CardDescription>Control how you receive updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                            <Smartphone className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Push Notifications</p>
                                <p className="text-xs text-muted-foreground">Get notified on your device</p>
                            </div>
                        </div>
                        <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Email Notifications</p>
                                <p className="text-xs text-muted-foreground">Receive updates via email</p>
                            </div>
                        </div>
                        <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                            <Music className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">New Music Alerts</p>
                                <p className="text-xs text-muted-foreground">Get notified about new releases</p>
                            </div>
                        </div>
                        <Switch checked={newMusicAlerts} onCheckedChange={setNewMusicAlerts} />
                    </div>
                </CardContent>
            </Card>

            {/* Privacy Section */}
            <Card className="border-border bg-card/60">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Lock className="h-5 w-5 text-primary" />
                        Privacy
                    </CardTitle>
                    <CardDescription>Control your privacy settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                            {privateProfile ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                            <div>
                                <p className="text-sm font-medium">Private Profile</p>
                                <p className="text-xs text-muted-foreground">Only you can see your profile</p>
                            </div>
                        </div>
                        <Switch checked={privateProfile} onCheckedChange={setPrivateProfile} />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                            <Headphones className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Show Listening Activity</p>
                                <p className="text-xs text-muted-foreground">Let others see what you're playing</p>
                            </div>
                        </div>
                        <Switch checked={showListeningActivity} onCheckedChange={setShowListeningActivity} />
                    </div>
                </CardContent>
            </Card>

            {/* Data & Storage Section */}
            <Card className="border-border bg-card/60">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <HardDrive className="h-5 w-5 text-primary" />
                        Data & Storage
                    </CardTitle>
                    <CardDescription>Manage your data and downloads</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                            {offlineMode ? (
                                <WifiOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <Wifi className="h-4 w-4 text-muted-foreground" />
                            )}
                            <div>
                                <p className="text-sm font-medium">Offline Mode</p>
                                <p className="text-xs text-muted-foreground">Only play downloaded songs</p>
                            </div>
                        </div>
                        <Switch checked={offlineMode} onCheckedChange={setOfflineMode} />
                    </div>

                    <Separator />

                    <button
                        onClick={handleComingSoon}
                        className="w-full flex items-center justify-between py-3 px-1 hover:bg-muted/50 rounded-md transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <Download className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                            <div className="text-left">
                                <p className="text-sm font-medium">Download Music</p>
                                <p className="text-xs text-muted-foreground">Manage offline downloads</p>
                            </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>

                    <Separator />

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

            {/* About Section */}
            <Card className="border-border bg-card/60">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        About
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
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
                            <FileText className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                            <span className="text-sm">Terms of Service</span>
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
                    <div className="flex items-center justify-between py-3 px-1">
                        <div className="flex items-center gap-3">
                            <Info className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">App Version</span>
                        </div>
                        <span className="text-sm text-muted-foreground">v0.1.0</span>
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/30 bg-card/60">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </CardTitle>
                    <CardDescription>
                        Sign out of your account on this device
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        variant="destructive"
                        onClick={handleLogout}
                        className="w-full sm:w-auto"
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default SettingsContent;
