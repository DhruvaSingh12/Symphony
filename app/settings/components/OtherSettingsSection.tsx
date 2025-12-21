"use client";

import { useRouter } from "next/navigation";
import { Trash2, Shield, ChevronRight, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import toast from "react-hot-toast";
import { useCacheManager } from "@/hooks/utils/useCacheManager";

const OtherSettingsSection = () => {
    const router = useRouter();

    const { formattedUsage, clearCache, isLoading } = useCacheManager();

    const handleComingSoon = () => {
        toast("Coming soon!", { icon: "🚀" });
    };

    return (
        <div className="space-y-2">
            <Card className="border-border bg-card/60">
                <CardContent className="p-3">
                    <button
                        onClick={clearCache}
                        disabled={isLoading}
                        className="w-full flex items-center justify-between py-3 px-1 hover:bg-muted/50 rounded-md transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="flex items-center gap-3">
                            <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                            <div className="text-left">
                                <p className="text-sm font-medium">Clear Cache</p>
                                <p className="text-xs text-muted-foreground">Free up storage space</p>
                            </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {isLoading ? 'Clearing...' : formattedUsage}
                        </span>
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

export default OtherSettingsSection;
