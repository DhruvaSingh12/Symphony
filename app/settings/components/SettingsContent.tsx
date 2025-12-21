"use client";

import { UserDetails } from "@/types";
import ProfileSection from "./ProfileSection";
import PlaybackSection from "./PlaybackSection";
import OtherSettingsSection from "./OtherSettingsSection";

interface SettingsContentProps {
    userDetails: UserDetails | null;
}

const SettingsContent: React.FC<SettingsContentProps> = ({ userDetails }) => {

    return (
        <div className="space-y-4">
            <ProfileSection userDetails={userDetails} />
            <PlaybackSection />
            <OtherSettingsSection />
        </div>
    );
};

export default SettingsContent;