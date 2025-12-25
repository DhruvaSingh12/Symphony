"use client";

import { useUser } from "@/hooks/auth/useUser";
import BatchUploadForm from "./BatchUploadForm";
import { Card } from "@/components/ui/card";

const UploadContent = () => {
    const { user, isLoading } = useUser();

    if (isLoading || !user) {
        return null;
    }

    return (
        <Card className="border-border h-full flex flex-col overflow-auto scrollbar-hide relative bg-card/60 p-3 md:p-4">
            <BatchUploadForm />
        </Card>
    );
}

export default UploadContent;