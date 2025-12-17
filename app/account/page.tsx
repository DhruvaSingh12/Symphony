import Header from "@/components/Header";
import SettingsContent from "./components/SettingsContent";
import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import { getUserDetails } from "@/lib/api/users";

const SettingsPage = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const userDetails = await getUserDetails(supabase);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="flex-none px-2 md:px-0 md:pr-2 pt-2">
        <Header className="bg-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-4">
              <div className="flex flex-col">
                <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
                  Settings
                </h1>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  Manage your account and preferences
                </p>
              </div>
            </div>
          </div>
        </Header>
      </div>
      <div className="flex-1 min-h-0 mt-2 px-2 md:px-0 md:pr-2 pb-2">
        <div className="h-full w-full overflow-auto scrollbar-hide">
          <div className="max-w-2xl mx-auto">
            <SettingsContent userDetails={userDetails} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;