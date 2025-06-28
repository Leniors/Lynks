"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ID, account, databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import { useUser } from "@/context/UserContext";
import { Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;

//  Username schema: no spaces, min length, etc.
const UsernameSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed"),
});

export default function SetUsernamePage() {
  const router = useRouter();
  const { refreshUser } = useUser();

  const [pendingUser, setPendingUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  //  RHF setup
  const form = useForm<z.infer<typeof UsernameSchema>>({
    resolver: zodResolver(UsernameSchema),
    defaultValues: {
      username: "",
    },
  });

  //  Load Appwrite user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await account.get();
        setPendingUser(user);
      } catch {
        router.replace("/auth/login");
      }
    };
    loadUser();
  }, []);

  const onSubmit = async (values: z.infer<typeof UsernameSchema>) => {
    if (!pendingUser) return;

    setLoading(true);

    try {
      //  Check if username exists
      const existing = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal("username", values.username)]
      );

      if (existing.total > 0) {
        form.setError("username", {
          type: "manual",
          message: "Username is already taken.",
        });
        setLoading(false);
        return;
      }

      const avatarUrl = `https://cloud.appwrite.io/v1/avatars/initials?name=${encodeURIComponent(
        pendingUser.name || ""
      )}`;

      await databases.createDocument(DATABASE_ID, USERS_COLLECTION_ID, ID.unique(), {
        userId: pendingUser.$id,
        name: pendingUser.name,
        email: pendingUser.email,
        username: values.username,
        avatarUrl,
      });

      await refreshUser();
      router.replace("/dashboard");
    } catch (err: any) {
      console.error(err);
      form.setError("username", {
        type: "manual",
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-950">
      <div className="w-full max-w-md bg-zinc-900 rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-semibold text-center text-blue-400 mb-6">
          Choose a Username
        </h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. johndoe_23"
                      className="bg-zinc-800 text-white"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full py-2 px-4 rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center mt-8" disabled={loading}>
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
