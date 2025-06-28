"use client";

import React, { JSX } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { account } from "@/lib/appwrite"; // Make sure this is your client-side Appwrite
import { toast } from "sonner";

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: JSX.Element;
    element?: JSX.Element;
  }[];
  className?: string;
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const visible = true;

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      toast.success("Logged out successfully");
      router.push("/auth/login");
    } catch (err: any) {
      toast.error("Logout failed");
      console.error(err);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 1, y: -100 }}
        animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "fixed z-[5000] flex items-center px-4 py-2 space-x-4 border border-white/[0.2] bg-black shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]",
          "w-full bottom-0 justify-between", // mobile
          "md:w-fit md:bottom-auto md:top-10 md:right-10 md:rounded-lg md:justify-center", // desktop
          className
        )}
      >
        {navItems.map((navItem, idx) => {
          const isActive = pathname === navItem.link;

          return (
            <div
              key={`link-${idx}`}
              className="text-center mx-auto md:mx-2 py-2"
            >
              {navItem.element ?? (
                <Link
                  href={navItem.link}
                  className={cn(
                    "flex items-center justify-center text-sm transition-colors",
                    isActive
                      ? "text-blue-400 font-semibold border-b-2 border-blue-400"
                      : "text-neutral-50 hover:text-neutral-300"
                  )}
                >
                  {navItem.icon && <span className="mr-1">{navItem.icon}</span>}
                  <span>{navItem.name}</span>
                </Link>
              )}
            </div>
          );
        })}

        <button
          onClick={handleLogout}
          className="md:hidden border text-sm font-medium relative border-white/[0.2] text-white px-4 py-2 rounded-full"
        >
          <span>Logout</span>
          <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-blue-500 to-transparent h-px" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
