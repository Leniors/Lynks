"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { uploadAvatar, getAvatarUrl, updateUserInDB, getUserByUsername } from "@/lib/actions";
import RequireUser from "@/components/RequireUser";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

const settingsSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "No spaces or special characters allowed"),
  bio: z.string().max(160, "Bio must be under 160 characters").optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const router = useRouter();
  const { user, refreshUser } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: "",
      username: "",
      bio: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        username: user.username,
        bio: user.bio || "",
      });
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [user, form]);

  const onSubmit = async (values: SettingsFormValues) => {
    setLoading(true);
    let finalAvatarUrl = avatarUrl;

    try {
      if (file) {
        const uploaded = await uploadAvatar(file);
        if (!uploaded) throw new Error("Avatar upload failed");
        finalAvatarUrl = getAvatarUrl(uploaded.$id);
      }

      if (values.username !== user?.username) {
        const existing = await getUserByUsername(values.username);
        if (existing && existing.$id !== user.$id) {
          toast.error("Username already taken");
          setLoading(false);
          return;
        }
      }

      const updated = await updateUserInDB(user.$id, {
        ...values,
        avatarUrl: finalAvatarUrl,
      });

      if (updated) {
        toast.success(" Profile updated successfully!");
        await refreshUser();
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("Update failed. Try again.");
    } finally {
      setLoading(false);
      setFile(null);
    }
  };

  return (
    <RequireUser>
      <div className="min-h-screen bg-zinc-950 text-white p-6">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-bold text-blue-400 mb-6">Profile Settings</h1>

          {avatarUrl && (
            <div className="mb-4 text-center">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover mx-auto"
              />
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="text-sm border border-gray-600 bg-zinc-800 text-white rounded px-2 py-2"
                />
                <label className="block mb-1 text-sm text-gray-400">
                  Change Profile
                </label>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-zinc-800 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-zinc-800 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        rows={3}
                        className="w-full px-4 py-2 rounded bg-zinc-800 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </RequireUser>
  );
}
