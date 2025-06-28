"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { getUserByUsername, fetchLinks } from "@/lib/actions";
import { notFound } from "next/navigation";
import JoinLynksButton from "@/components/JoinLynksButton";
import SharePublicLinkButton from "@/components/SharePublicLinkButton";
import { Loader } from "lucide-react";

type Props = {
  username: string;
};

export default function UserPage({ username }: Props) {
  const { user: loggedInUser } = useUser();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const u = await getUserByUsername(username);
      if (!u) return notFound();
      const l = await fetchLinks(u.userId);
      setProfileUser(u);
      setLinks(l.sort((a, b) => (a.order || 0) - (b.order || 0)));
      setLoading(false);
    };
    load();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <Loader className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const isOwner = loggedInUser?.username === profileUser.username;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 pb-15">
      <div className="max-w-2xl mx-auto text-center">
        {profileUser.avatarUrl && (
          <img
            src={profileUser.avatarUrl}
            alt={profileUser.name}
            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
          />
        )}
        <h1 className="text-2xl font-bold text-blue-400">{profileUser.name}</h1>
        <h2 className="text-sm text-gray-300">@{profileUser.username}</h2>
        {profileUser.bio && (
          <p className="text-gray-400 mt-2">{profileUser.bio}</p>
        )}

        <div className="mt-8 space-y-4">
          {links.length > 0 ? (
            links.map((link) => (
              //   <a
              //     key={link.$id}
              //     href={link.url}
              //     target="_blank"
              //     rel="noopener noreferrer"
              //     className="block w-full px-4 py-3 rounded-md text-white text-lg font-medium transition"
              //     style={{ backgroundColor: link.color || "#3b82f6" }}
              //   >
              //     {link.icon && <span className="mr-2">{link.icon}</span>}
              //     {link.title}
              //   </a>
              <a
                key={link.$id}
                href={`/api/visit/${link.$id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-md text-white text-lg font-medium transition duration-200"
                style={{ backgroundColor: link.color || "#3b82f6" }}
              >
                {link.icon && <span>{link.icon}</span>}
                <span>{link.title}</span>
              </a>
            ))
          ) : isOwner ? (
            <a
              href="/dashboard"
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create your first link
            </a>
          ) : (
            <p className="text-gray-500 mt-4">No links to show.</p>
          )}
        </div>
      </div>

      {!loggedInUser && <JoinLynksButton />}
      <SharePublicLinkButton username={username} />
    </div>
  );
}
