"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { account } from "@/lib/appwrite";
import { getUserById } from "@/lib/actions";

type User = {
  userId: string;
  name: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  email?: string;
} | null;

type UserContextType = {
  user: User;
  loading: boolean;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      await new Promise((res) => setTimeout(res, 300)); // small delay helps in local dev
      const authUser = await account.get();
      const dbUser = await getUserById(authUser.$id);

      if (dbUser) {
        setUser(dbUser);
        localStorage.setItem("lynks-user", JSON.stringify(dbUser));
      } else {
        setUser(null);
        localStorage.removeItem("lynks-user");
      }
    } catch {
      setUser(null);
      localStorage.removeItem("lynks-user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem("lynks-user");
    if (cached) {
      try {
        setUser(JSON.parse(cached));
      } catch {
        localStorage.removeItem("lynks-user");
      }
    }
    refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
