import { getUserByUsername } from "@/lib/actions";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
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
      images: [user.avatarUrl || "https://your-domain.com/default-avatar.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: `${user.name} (@${user.username}) | Lynks`,
      description: user.bio || "Check out this profile on Lynks",
      images: [user.avatarUrl || "https://your-domain.com/default-avatar.png"],
    },
  };
}
