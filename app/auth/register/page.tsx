"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ID, account, databases } from "@/lib/appwrite";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import { OAuthProvider, Query } from "appwrite";
import { Loader } from "lucide-react";
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
import { FcGoogle } from "react-icons/fc";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const USERS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;

// Zod schema
const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^\S+$/, "Username cannot contain spaces"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useUser();

  useEffect(() => {
    account
      .get()
      .then(() => router.push("/dashboard"))
      .catch(() => {});
  }, []);

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof RegisterSchema>) => {
    try {
      // Check if email or username is taken
      const usernameCheck = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal("username", values.username)]
      );

      if (usernameCheck.total > 0) {
        form.setError("username", {
          type: "manual",
          message: "Username is already taken",
        });
        return;
      }

      // Check email
      const emailCheck = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal("email", values.email)]
      );

      if (emailCheck.total > 0) {
        form.setError("email", {
          type: "manual",
          message: "Email is already registered",
        });
        return;
      }

      // Create Appwrite account
      const user = await account.create(
        ID.unique(),
        values.email,
        values.password,
        values.name
      );
      await account.createEmailPasswordSession(values.email, values.password);

      const avatarUrl = `https://cloud.appwrite.io/v1/avatars/initials?name=${encodeURIComponent(
        values.name
      )}`;

      await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        ID.unique(),
        {
          userId: user.$id,
          name: values.name,
          username: values.username,
          email: values.email,
          avatarUrl,
          bio: "",
        }
      );

      await refreshUser();
      toast.success("Registration successfull.");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Registration failed.");
      await account.deleteSession("current");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-950">
      <div className="w-full max-w-sm bg-zinc-900 rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-semibold text-center text-blue-400 mb-6">
          Create your account
        </h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="bg-zinc-800 text-white"
                      placeholder="John Doe"
                    />
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
                    <Input
                      {...field}
                      className="bg-zinc-800 text-white"
                      placeholder="johndoe"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      className="bg-zinc-800 text-white"
                      placeholder="you@example.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      className="bg-zinc-800 text-white"
                      placeholder="••••••••"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full py-2 px-4 rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center mt-5"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </form>
        </Form>

        <p className="mt-4 text-sm text-center text-gray-400">
          Already have an account?{" "}
          <a href="/auth/login" className="text-blue-400 hover:underline">
            Login
          </a>
        </p>

        <div className="mt-6 text-center text-white w-full">
          <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent" />
          <div className="flex flex-col w-full mt-2 space-y-3">
            <button
              onClick={() =>
                account.createOAuth2Session(
                  OAuthProvider.Google,
                  `${window.location.origin}/auth/oauth-callback`,
                  `${window.location.origin}/auth/login`
                )
              }
              className="w-full px-4 py-2 bg-zinc-600 rounded cursor-pointer font-bold flex items-center justify-center gap-2"
            >
              <FcGoogle size={20} />
              Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
