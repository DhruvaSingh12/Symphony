import UploadedPageClient from "./components/UploadedPageClient";
import { fetchUserSongs } from "@/lib/api/songs";
import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";

export const revalidate = 60;

const UploadedPage = async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/?auth=true");
    }

    const songs = await fetchUserSongs(supabase);

    return <UploadedPageClient songs={songs || []} />;
};

export default UploadedPage;