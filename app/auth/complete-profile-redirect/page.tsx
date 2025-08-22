"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";

export default function CompleteProfileRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Session is available, redirect to the profile completion page
        router.replace("/complete-profile");
      } else {
        // No session found, redirect to login with an error message
        router.replace("/auth/login?error=Session not found");
      }
    }

    checkSession();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-4" />
      <p className="text-muted-foreground">
        Securing your session...
      </p>
    </div>
  );
}