import { create } from "zustand";
import { supabase } from "@/utils/supabase/client";
import { useUserStore } from "./userStore";

export type Product = {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  price: number;
  currency: "usd" | "eur" | "gbp";
  imageUrl?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

type ProductsState = {
  products: Product[];
  loading: boolean;
  fetchProducts: () => Promise<void>;
  addProduct: (
    p: Omit<Product, "id" | "user_id" | "createdAt" | "updatedAt" | "imageUrl"> & {
      imageFile?: File | null;
    }
  ) => Promise<Product | null>;
  updateProduct: (
    id: string,
    updates: Partial<Omit<Product, "id" | "user_id" | "createdAt">> & {
      imageFile?: File | null;
    }
  ) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  togglePublished: (id: string) => Promise<void>;
};

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  loading: false,

  fetchProducts: async () => {
    const { user } = useUserStore.getState();
    if (!user) return;

    set({ loading: true });
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
    } else {
      set({
        products: (data || []).map((d) => ({
          ...d,
          imageUrl: d.image_url,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        })),
      });
    }
    set({ loading: false });
  },

  addProduct: async (p) => {
    const { user } = useUserStore.getState();
    if (!user) return null;

    let imageUrl: string | undefined = undefined;
    if (p.imageFile) {
      const fileName = `${user.id}/${Date.now()}-${p.imageFile.name}`;
      const { error: uploadErr } = await supabase.storage
        .from("images")
        .upload(fileName, p.imageFile);

      if (uploadErr) {
        console.error("Upload failed:", uploadErr);
        return null;
      }
      const { data: publicUrlData } = supabase.storage
        .from("images")
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;
    }

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("products")
      .insert({
        user_id: user.id,
        name: p.name,
        description: p.description,
        price: p.price,
        currency: p.currency,
        image_url: imageUrl,
        published: p.published,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding product:", error);
      return null;
    }

    const newProduct: Product = {
      ...data,
      imageUrl: data.image_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    set({ products: [newProduct, ...get().products] });
    return newProduct;
  },

  updateProduct: async (id, updates) => {
    let imageUrlUpdate: string | undefined = undefined;

    if (updates.imageFile) {
      const { user } = useUserStore.getState();
      if (!user) return;

      const fileName = `${user.id}/${Date.now()}-${updates.imageFile.name}`;
      const { error: uploadErr } = await supabase.storage
        .from("images")
        .upload(fileName, updates.imageFile);

      if (uploadErr) {
        console.error("Upload failed:", uploadErr);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("images")
        .getPublicUrl(fileName);

      imageUrlUpdate = publicUrlData.publicUrl;
    }

    const { error, data } = await supabase
      .from("products")
      .update({
        ...updates,
        ...(imageUrlUpdate ? { image_url: imageUrlUpdate } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating product:", error);
      return;
    }

    set({
      products: get().products.map((p) =>
        p.id === id
          ? {
              ...p,
              ...updates,
              ...(imageUrlUpdate ? { imageUrl: imageUrlUpdate } : {}),
              updatedAt: data.updated_at,
            }
          : p
      ),
    });
  },

  deleteProduct: async (id) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      console.error("Error deleting product:", error);
      return;
    }
    set({ products: get().products.filter((p) => p.id !== id) });
  },

  togglePublished: async (id) => {
    const product = get().products.find((p) => p.id === id);
    if (!product) return;

    const { error, data } = await supabase
      .from("products")
      .update({
        published: !product.published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error toggling published:", error);
      return;
    }

    set({
      products: get().products.map((p) =>
        p.id === id
          ? { ...p, published: data.published, updatedAt: data.updated_at }
          : p
      ),
    });
  },
}));
