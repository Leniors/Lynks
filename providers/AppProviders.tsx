"use client";

import { useEffect } from "react";
import { useUserStore } from "@/stores/userStore";
import { useLinksStore } from "@/stores/linksStore";
import { supabase } from "@/utils/supabase/client";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const fetchUser = useUserStore((state) => state.fetchUser);
  const user = useUserStore((state) => state.user);
  const fetchLinks = useLinksStore((state) => state.fetchLinks);

  // Auth + user fetching
  useEffect(() => {
    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [fetchUser]);

  // Fetch links when user changes
  useEffect(() => {
    if (user?.id) {
      fetchLinks();
    }
  }, [user?.id, fetchLinks]);

  return <>{children}</>;
}
