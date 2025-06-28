// app/user/[username]/page.tsx
import { Metadata } from "next";
import UserPage from "./UserPage";
import { getUserByUsername } from "@/lib/actions";

const defaultImage = "https://your-domain.com/default-avatar.png";

// ✅ No custom types, just inline everything
export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const user = await getUserByUsername(params.username);

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
      title: `${user.name} (@${user.username}) | Lynks`,
      description: user.bio || "Check out this profile on Lynks",
      images: [user.avatarUrl || defaultImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `${user.name} (@${user.username}) | Lynks`,
      description: user.bio || "Check out this profile on Lynks",
      images: [user.avatarUrl || defaultImage],
    },
  };
}

// ✅ Inline type on the component too
export default function Page({
  params,
}: {
  params: { username: string };
}) {
  return <UserPage username={params.username} />;
}
