"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { account, databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import { useUser } from "@/context/UserContext";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;

export default function OAuthCallbackPage() {
  const router = useRouter();
  const { refreshUser } = useUser();

  useEffect(() => {
    const handleOAuth = async () => {
      try {
        // 1. Get the logged-in OAuth user
        const user = await account.get();

        // 2. Check if a user with this email exists in our DB
        const existing = await databases.listDocuments(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          [Query.equal("email", user.email)]
        );

        if (existing.total > 0) {
          //  User exists, proceed to dashboard
          await refreshUser();
          router.replace("/dashboard");
        } else {
          // ❌ User not in DB, save name/email in sessionStorage and redirect to set-username
          sessionStorage.setItem(
            "pendingOAuthUser",
            JSON.stringify({
              name: user.name,
              email: user.email,
            })
          );
          router.replace("/auth/set-username");
        }
      } catch (err) {
        console.error("OAuth Callback Error:", err);
        router.replace("/auth/login");
      }
    };

    handleOAuth();
  }, []);

  return (
    <div className="text-white p-6 text-center">
      Setting up your account...
    </div>
  );
}
