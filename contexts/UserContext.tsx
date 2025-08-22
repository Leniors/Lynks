// contexts/UserContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { Loader } from "lucide-react";

type UserProfile = {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar?: string | null;
  bio?: string | null;
  theme?: string | null;
};

type UserContextType = {
  user: UserProfile | null;
  loading: boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
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

          // Redirect to complete-profile if missing username
          if (!profile.username && pathname !== "/complete-profile") {
            router.push("/complete-profile");
          }
        }
      }

      setLoading(false);
    };

    fetchUser();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [pathname, router]);

  // Show a full-page loader while fetching
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-ful bg-background">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
