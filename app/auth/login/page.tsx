"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import { OAuthProvider } from "appwrite";
import { FcGoogle } from "react-icons/fc";
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

// Zod schema
const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useUser();

  useEffect(() => {
    account
      .get()
      .then(() => router.push("/dashboard"))
      .catch(() => {});
  }, []);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    try {
      await account.createEmailPasswordSession(values.email, values.password);
      await refreshUser();
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Login failed. Check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-zinc-950">
      <div className="w-full max-w-md bg-zinc-900 rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-semibold text-center text-blue-400 mb-6">
          Login to your account
        </h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      placeholder="you@example.com"
                      className="bg-zinc-800 text-white"
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
                      placeholder="••••••••"
                      className="bg-zinc-800 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full py-2 px-4 rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center mt-5"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </Form>

        <p className="mt-4 text-sm text-center text-gray-400">
          Don&apos;t have an account?{" "}
          <a href="/auth/register" className="text-blue-400 hover:underline">
            Register
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
