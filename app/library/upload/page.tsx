import type { Metadata } from "next";
import Header from "@/components/Header";
import UploadContent from "./components/UploadContent";
import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Upload Music | Quivery",
    description: "Share your music with the world on Quivery.",
};

const UploadPage = async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/?auth=true&next=/library/upload");
    }

    return (
        <div className="h-full w-full flex flex-col overflow-hidden">
            <div className="flex-none px-2 md:px-0 md:pr-2 pt-2">
                <Header className="bg-transparent">
                    <div className="flex flex-col gap-y-2">
                        <h1 className="text-3xl font-semibold text-foreground">
                            Upload Music
                        </h1>
                    </div>
                </Header>
            </div>
            <div className="flex-1 min-h-0 mt-2 px-2 md:px-0 md:pr-2 pb-2">
                <UploadContent />
            </div>
        </div>
    );
}

export default UploadPage;