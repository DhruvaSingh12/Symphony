"use client";

import Header from "@/components/Header";
import { Settings } from "lucide-react";
import Box from "@/components/Box";
import { BounceLoader } from "react-spinners";
import SettingsContent from "./components/SettingsContent";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";

const SettingsPage = () => {
  const router = useRouter();
  const { user, isLoading: isLoadingUser } = useUser();

  useEffect(() => {
    if (!isLoadingUser && !user) {
      router.replace("/");
    }
  }, [isLoadingUser, user, router]);

  if (isLoadingUser || (!user && !isLoadingUser)) {
    return (
      <Box className="flex h-full w-full scrollbar-hide items-center justify-center">
        <BounceLoader className="text-foreground" size={40} />
      </Box>
    );
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="flex-none px-2 md:px-0 md:pr-2 pt-2">
        <Header className="bg-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-4">
              <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl bg-gradient-to-br from-muted-foreground/20 to-muted/40 flex items-center justify-center">
                <Settings className="h-6 w-6 md:h-7 md:w-7 text-foreground" />
              </div>
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
        <Card className="border-border h-full flex flex-col overflow-hidden relative">
          <div className="h-full w-full overflow-auto scrollbar-hide">
            <div className="max-w-2xl mx-auto p-4 md:p-6">
              <SettingsContent />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;