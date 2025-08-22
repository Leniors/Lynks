// /stores/userStore.ts
import { create } from "zustand";
import { supabase } from "@/utils/supabase/client";

export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar?: string | null;
  bio?: string | null;
  theme?: string | null;
}

interface UserStore {
  user: UserProfile | null;
  loading: boolean;
  usernameAvailable: boolean | null;
  checkUsername: (username: string) => Promise<void>;
  fetchUser: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
  updating: boolean;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  loading: true,
  usernameAvailable: null,

  fetchUser: async () => {
    set({ loading: true });

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
        set({ user: profile, loading: false });

        // 🔹 Redirect to complete-profile if no username
        if (
          !profile.username &&
          typeof window !== "undefined" &&
          window.location.pathname !== "/complete-profile"
        ) {
          window.location.href = "/complete-profile";
        }
      } else {
        set({ user: null, loading: false });
      }
    } else {
      set({ user: null, loading: false });
    }
  },

  checkUsername: async (username) => {
    if (!username) {
      set({ usernameAvailable: null });
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking username:", error);
      set({ usernameAvailable: false });
      return;
    }

    // If data is null => username not taken
    set({ usernameAvailable: !data });
  },

  setUser: (user) => set({ user }),

  updating: false,

  updateProfile: async (data: Partial<UserProfile>) => {
    set({ updating: true });
    try {
      // 🔹 Get the user ID from the session within the store
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        throw new Error("User not found. Please log in again.");
      }

      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", session.user.id); // 🔹 Use the session's user ID

      if (error) throw error;

      const currentUser = get().user;
      if (currentUser?.id === session.user.id) {
        set({ user: { ...currentUser, ...data } });
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error updating profile:", err.message);
      } else {
        console.error("Error updating profile:", err);
      }
      // You can add state to handle errors
    } finally {
      set({ updating: false });
    }
  },
}));
