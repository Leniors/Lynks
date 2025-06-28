"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { FcGoogle } from "react-icons/fc";
// import { FaApple } from "react-icons/fa";
import { OAuthProvider } from "appwrite";

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    account
      .get()
      .then(() => {
        router.push("/dashboard");
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      toast.error("Email and password are required.");
      setLoading(false);
      return;
    }

    try {
      await account.createEmailPasswordSession(email, password);
      await refreshUser(); //  update context after login
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-zinc-950">
      <div className="w-full max-w-md bg-zinc-900 rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-semibold text-center text-blue-400 mb-6">
          Login to your account
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-400">
          Don&apos;t have an account?{" "}
          <a href="/auth/register" className="text-blue-400 hover:underline">
            Register
          </a>
        </p>

        {/* OAuth buttons inside the same container */}
        <div className="mt-6 text-center text-white w-full">
          <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent" />
          <div className="flex flex-col w-full mt-2 space-y-3">
            <button
              onClick={() => {
                account.createOAuth2Session(
                  OAuthProvider.Google,
                  `${window.location.origin}/auth/oauth-callback`,
                  `${window.location.origin}/auth/login`
                );
              }}
              className="w-full px-4 py-2 bg-zinc-600 rounded cursor-pointer font-bold flex items-center justify-center gap-2"
            >
              <FcGoogle size={20} />
              Google
            </button>
            
            {/* <button
              onClick={() => {
                account.createOAuth2Session(
                  OAuthProvider.Apple,
                  `${window.location.origin}/auth/oauth-callback`,
                  `${window.location.origin}/auth/login`
                );
              }}
              className="w-full px-4 py-2 bg-zinc-600 rounded cursor-pointer font-bold flex items-center justify-center gap-2"
            >
              <FaApple size={20} />
              Apple
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
}
