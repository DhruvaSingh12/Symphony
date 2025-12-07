"use client";

import { useSupabaseClient, useSupabaseSession } from "@/providers/SupabaseProvider";
import { useRouter } from "next/navigation";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import useAuthModal from "@/hooks/useAuthModal";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AuthModal = () => {
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const session = useSupabaseSession();
  const { isOpen, onClose } = useAuthModal();

  useEffect(() => {
    if (session) {
      router.refresh();
      onClose();
    }
  }, [session, router, onClose]);

  const handleChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Welcome</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Login to your account or create a new one
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Auth
            theme="dark"
            magicLink
            providers={["google"]}
            supabaseClient={supabaseClient}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary))',
                  },
                },
              },
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
