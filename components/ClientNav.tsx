"use client";

import { usePathname } from "next/navigation";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { useUser } from "@/context/UserContext";

export function ClientNav() {
  const pathname = usePathname();
  const { user, loading } = useUser();

  if (loading || !user) return null;

  const navItems = [
    {
      name: "Manage Links",
      link: "/dashboard",
    },
    {
      name: "Settings",
      link: "/dashboard/settings",
    },
    {
      name: "Profile",
      link: `/user/${user.username}`,
    },
  ];

  return <FloatingNav key={pathname} navItems={navItems} />;
}
