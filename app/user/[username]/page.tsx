// In app/user/[username]/page.tsx

import { Metadata } from "next";
import UserPage from "./UserPage";
import { getUserByUsername } from "@/lib/actions";

const defaultImage = "https://your-domain.com/default-avatar.png";

// ✅ INLINE PARAMS — now expected to be a Promise in Next.js 15
export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>; // params is now a Promise
}): Promise<Metadata> {
  const resolvedParams = await params; // Await the params
  const user = await getUserByUsername(resolvedParams.username); // Use resolvedParams.username

  if (!user) {
    return {
      title: "User Not Found | Lynks",
      description: "This profile does not exist on Lynks.",
    };
  }

  return {
    title: `${user.name} (@${user.username}) | Lynks`,
    description: user.bio || "Check out this profile on Lynks",
    openGraph: {
      images: [user.avatarUrl || defaultImage],
    },
    twitter: {
      images: [user.avatarUrl || defaultImage],
    },
  };
}

// ✅ PAGE FUNCTION — params is also a Promise here
export default async function Page({ // Page component needs to be async too
  params,
}: {
  params: Promise<{ username: string }>; // params is a Promise
}) {
  const resolvedParams = await params; // Await the params
  return <UserPage username={resolvedParams.username} />;
}