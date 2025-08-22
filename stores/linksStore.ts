// /stores/linksStore.ts
import { create } from "zustand";
import { supabase } from "@/utils/supabase/client";
import { useUserStore } from "@/stores/userStore";
import { UserLink } from "@/types";


interface LinksStore {
  links: UserLink[];
  loading: boolean;
  fetchLinks: () => Promise<void>;
  addingLink: boolean;
  addLink: (link: Omit<UserLink, "id" | "created_at" | "clicks">) => Promise<void>;
  updateLink: (id: string, updates: Partial<UserLink>) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;
  reorderLinks: (links: UserLink[]) => Promise<void>;
  toggleLinkVisibility: (id: string) => Promise<void>;
  incrementLinkClicks: (id: string) => Promise<void>;
}

const getVisitorId = () => {
  if (typeof window === "undefined") return "server"; // SSR guard
  let id = localStorage.getItem("visitor_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("visitor_id", id);
  }
  return id;
};

export const useLinksStore = create<LinksStore>((set, get) => ({
  links: [],
  loading: false,

  fetchLinks: async () => {
    set({ loading: true });
    const { user } = useUserStore.getState();
    if (!user) {
      set({ links: [], loading: false });
      return;
    }

    const { data, error } = await supabase
      .from("links")
      .select("*")
      .eq("user_id", user.id) // ✅ ensure this matches your schema
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching links:", error);
    } else {
      set({ links: data as UserLink[] });
    }
    set({ loading: false });
  },

  addingLink: false,

  addLink: async (linkData) => {
    set({ addingLink: true });
    const { user } = useUserStore.getState();
    if (!user) return;

    const { data, error } = await supabase
      .from("links")
      .insert({
        user_id: user.id,
        title: linkData.title,
        url: linkData.url,
        icon: linkData.icon,
        color: linkData.color,
        is_visible: linkData.is_visible,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding link:", error);
      set({ addingLink: false });
      return;
    }
    set((state) => ({ links: [...state.links, data as UserLink] }));
    set({ addingLink: false });
  },

  updateLink: async (id, updates) => {
    const { error, data } = await supabase
      .from("links")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating link:", error);
      return;
    }

    set((state) => ({
      links: state.links.map((link) =>
        link.id === id ? (data as UserLink) : link
      ),
    }));
  },

  deleteLink: async (id) => {
    const { error } = await supabase.from("links").delete().eq("id", id);
    if (error) {
      console.error("Error deleting link:", error);
      return;
    }
    set((state) => ({ links: state.links.filter((link) => link.id !== id) }));
  },

  reorderLinks: async (links) => {
    // ⚠️ Only updates local state unless you add "order" column
    set({ links });
  },

  toggleLinkVisibility: async (id) => {
    const link = get().links.find((l) => l.id === id);
    if (!link) return;

    await get().updateLink(id, { is_visible: !link.is_visible });
  },

  incrementLinkClicks: async (id) => {
    const visitorId = getVisitorId();
    const link = get().links.find((l) => l.id === id);
    if (!link) return;

    // ✅ safe SQL update: increment clicks
    const { error: updateError, data } = await supabase
      .from("links")
      .update({ clicks: (link.clicks ?? 0) + 1 })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error incrementing clicks:", updateError);
      return;
    }

    // Log click event
    const { error: insertError } = await supabase.from("link_clicks").insert({
      link_id: id,
      visitor_id: visitorId,
    });

    if (insertError) {
      console.error("Error logging click:", insertError);
    }

    set((state) => ({
      links: state.links.map((l) => (l.id === id ? (data as UserLink) : l)),
    }));
  },
}));
