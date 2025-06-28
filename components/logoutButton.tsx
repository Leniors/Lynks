"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/actions";

export default function ClientLogoutButton() {
  const { user, refreshUser, loading } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Fix hydration: wait until component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    await refreshUser(); // clear context
    router.push("/auth/login");
  };

  if (!mounted || loading || !user) return null; // ❌ don't render on SSR or before context loads

  return (
    <div className="fixed hidden md:block bottom-5 left-10 text-center mt-8 z-50">
      <button
        className="relative inline-flex w-25 h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
        onClick={handleLogout}
      >
        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#ff8a8a_0%,#b20000_50%,#ff8a8a_100%)]" />
        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-zinc-950 px-4 py-1 text-sm font-bold text-white backdrop-blur-3xl">
          Logout
        </span>
      </button>
    </div>
  );
}
