import { useSupabaseClient } from "@/providers/SupabaseProvider";
import { UserDetails } from "@/types";

const useLoadAvatar = (user: UserDetails | null) => {
  const supabaseClient = useSupabaseClient();

  if (!user || !user.avatar_url) {
    return null;
  }

  const { data: avatarData } = supabaseClient
    .storage
    .from('avatar')
    .getPublicUrl(user.avatar_url);

  return avatarData.publicUrl || null;
};

export default useLoadAvatar;
