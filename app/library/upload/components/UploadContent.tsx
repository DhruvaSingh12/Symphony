"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/auth/useUser";
import useAuthModal from "@/hooks/ui/useAuthModal";
import BatchUploadForm from "./BatchUploadForm";
import { Card } from "@/components/ui/card";

const UploadContent = () => {
    const { user, isLoading } = useUser();
    const router = useRouter();
    const authModal = useAuthModal();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/?auth=true');
            authModal.onOpen();
        }
    }, [user, isLoading, router, authModal]);

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