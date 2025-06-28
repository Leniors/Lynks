import { Metadata } from "next";
import UserPage from "./UserPage";
import { getUserByUsername } from "@/lib/actions";

const defaultImage = "https://your-domain.com/default-avatar.png"; // Make sure this URL is correct and accessible

// generateMetadata is an async function that receives params directly
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
      images: [user.avatarUrl || defaultImage],
    },
    twitter: {
      images: [user.avatarUrl || defaultImage],
    },
  };
}

// The Page component receives params directly for dynamic routes
export default function Page({
  params,
}: {
  params: { username: string };
}) {
  // UserPage component will fetch user data based on the username param
  return <UserPage username={params.username} />;
}