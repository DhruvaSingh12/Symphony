"use client";

import { Headphones, Zap, Volume2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import usePlaybackSettings from "@/hooks/data/usePlaybackSettings";

const PlaybackSection = () => {
    // Playback settings from global store
    const {
        autoplay, setAutoplay,
        rememberVolume, setRememberVolume,
    } = usePlaybackSettings();

    return (
        <Card className="border-border bg-card/60">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Headphones className="h-5 w-5 text-primary" />
                    Playback
                </CardTitle>
                <CardDescription>
                    Manage how your music plays
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Autoplay</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Continue playing similar songs
                        </p>
                    </div>
                    <Switch
                        checked={autoplay}
                        onCheckedChange={setAutoplay}
                    />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <Volume2 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Consistent Volume</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Maintain your preferred volume level across tracks
                        </p>
                    </div>
                    <Switch
                        checked={rememberVolume}
                        onCheckedChange={setRememberVolume}
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default PlaybackSection;
