"use client";

import { useUser } from "@/hooks/useUser";
import ProfileSection from "./ProfileSection";
import PlaybackSection from "./PlaybackSection";
import OtherSettingsSection from "./OtherSettingsSection";

const SettingsContent = () => {
    const { userDetails } = useUser();

    return (
        <div className="space-y-4">
            <ProfileSection userDetails={userDetails} />
            <PlaybackSection />
            <OtherSettingsSection />
        </div>
    );
};

export default SettingsContent;