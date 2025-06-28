// app/user/[username]/page.tsx
import UserPage from "./UserPage";
import { getUserByUsername } from "@/lib/actions";

const defaultImage = "https://your-domain.com/default-avatar.png";

type Props = {
  params: { username: string };
};

export async function generateMetadata({ params }: Props) {
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

export default function Page({ params }: Props) {
  return <UserPage username={params.username} />;
}
