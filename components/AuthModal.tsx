"use client";

import { useSupabaseClient, useSupabaseSession } from "@/providers/SupabaseProvider";
import { useRouter } from "next/navigation";
import useAuthModal from "@/hooks/ui/useAuthModal";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SignInForm from "./auth/SignInForm";
import SignUpForm from "./auth/SignUpForm";

interface WelcomeSectionProps {
  activeTab: string;
}

const WelcomeSection = ({ activeTab }: WelcomeSectionProps) => (
  <div className="bg-muted relative hidden md:flex items-center justify-center p-8" aria-hidden="true">
    <div className="flex flex-col items-center justify-center text-center space-y-6 z-10">
      <div className="flex items-center justify-center">
        <span
          className="text-8xl font-black"
          style={{ fontFamily: 'var(--league-spartan)', letterSpacing: '-0.05em' }}
        >
          <span className="text-foreground">quivery.</span>
        </span>
      </div>
      <div className="space-y-2">
        <p className="text-muted-foreground max-w-xs">
          {activeTab === "signin"
            ? "Sign in to access your music library and continue listening to your favorite tracks."
            : "Create your account and start building your personal music collection. Upload, organize, and enjoy your music anywhere."}
        </p>
      </div>
    </div>
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
  </div>
);

const AuthModal = () => {
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const session = useSupabaseSession();
  const { isOpen, onClose } = useAuthModal();
  const [isLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");

  useEffect(() => {
    if (session) {
      router.refresh();
      onClose();
    }
  }, [session, router, onClose]);

  const handleChange = (open: boolean) => {
    // Prevent closing while loading
    if (!open && !isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleChange}>
      <DialogContent
        className="sm:max-w-[900px] p-0 overflow-hidden"
        onPointerDownOutside={(e) => {
          // Prevent closing when clicking outside
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          // Prevent closing on Escape
          e.preventDefault();
        }}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Authentication</DialogTitle>
          <DialogDescription>
            Sign in to your account or create a new account to access all features
          </DialogDescription>
        </DialogHeader>

        <Card className="overflow-hidden border-0 shadow-none">
          <CardContent className="grid p-0 md:grid-cols-2">
            {activeTab === "signin" && <WelcomeSection activeTab={activeTab} />}

            <Tabs defaultValue="signin" onValueChange={setActiveTab} className="p-6 md:px-8 md:py-12">
              <TabsList className="grid w-full grid-cols-2 mb-6" aria-label="Authentication options">
                <TabsTrigger value="signin" aria-label="Sign in to existing account">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" aria-label="Create new account">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-0">
                <SignInForm supabaseClient={supabaseClient} onClose={onClose} />
              </TabsContent>

              <TabsContent value="signup" className="mt-0">
                <SignUpForm supabaseClient={supabaseClient} onClose={onClose} />
              </TabsContent>
            </Tabs>

            {activeTab === "signup" && <WelcomeSection activeTab={activeTab} />}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;