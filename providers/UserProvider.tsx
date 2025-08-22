"use client";

import { useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { create } from "zustand";

// ---- Types ----
export type UserProfile = {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar?: string | null;
  bio?: string | null;
  theme?: string | null;
};

type UserStore = {
  user: UserProfile | null;
  loading: boolean;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
};

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
}));

// ---- Provider Component ----
export function UserProvider({ children }: { children: ReactNode }) {
  const { setUser, setLoading } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setUser(profile);

          // Redirect if missing username
          if (!profile.username && pathname !== "/complete-profile") {
            router.push("/complete-profile");
          }
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    };

    fetchUser();

    // Listen for login/logout/session changes
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [pathname, router, setUser, setLoading]);

  return <>{children}</>;
}
