"use client";

import { Send } from "lucide-react";
import { toast } from "sonner";

export default function SharePublicLinkButton({
  username,
}: {
  username: string;
}) {
  const handleShare = async () => {
    const url = `https://lynks.vercel.app/user/${username}`;
    const title = `Check out my Lynks profile`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Here's my profile on Lynks 👇`,
          url,
        });
      } catch (err) {
        toast.error("Sharing canceled or failed");
      }
    } else {
      // fallback for unsupported browsers
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard (share not supported)");
    }
  };

  return (
    <div className="fixed top-4 left-4 md:top-10 md:left-10 text-center z-[5000]">
      <button
        className="relative inline-flex w-10 h-10 md:w-35 md:h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
        onClick={handleShare}
      >
        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
          <Send className="md:mr-2 md:h-4 md:w-4" />
          <span className="hidden md:block">Share Profile</span>
        </span>
      </button>
    </div>
  );
}
