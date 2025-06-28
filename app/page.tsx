export const metadata = {
  title: "Lynks — Share Your Links with Style",
  description: "Create a beautiful link-in-bio for your profile. Showcase your work, social links, and more with Lynks.",
  openGraph: {
    title: "Lynks — Developer Link-in-Bio Tool",
    description: "Create a stunning public profile with links, bio, and custom branding. Built for everyone.",
    url: "https://lynks.vercel.app",
    siteName: "Lynks",
    images: [
      {
        url: "https://lynks.vercel.app/og-home.png", // Add a real OG image later
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lynks — Share Your Links with Style",
    description: "Create a beautiful link-in-bio for your profile.",
    images: ["https://lynks.vercel.app/og-home.png"],
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-6 pt-6 pb-15">
      <div className="max-w-3xl mt-7 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-blue-400 leading-tight">
          Your Links, <span className="text-white">Beautifully Organized</span>
        </h1>
        <p className="mt-6 text-lg text-gray-400">
          Lynks is the easiest way for developers and creators to manage and share all their links in one place. Clean, customizable, and always yours.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <a
            href="/auth/register"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full shadow-md transition"
          >
            Get Started Free
          </a>
          <a
            href="/user/demo"
            className="border border-gray-400 hover:border-white text-white font-semibold py-3 px-6 rounded-full transition"
          >
            See Demo
          </a>
        </div>
      </div>

      <div className="mt-20 max-w-4xl w-full">
        <h2 className="text-2xl font-bold text-center text-blue-300 mb-6">What Makes Lynks Different?</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-md">
            <h3 className="text-lg font-semibold text-white mb-2">Simple & Fast</h3>
            <p className="text-gray-400">Add, customize, and share your links in seconds. No clutter, no confusion.</p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-md">
            <h3 className="text-lg font-semibold text-white mb-2">Creator First</h3>
            <p className="text-gray-400">We built this with creators in mind — clean UI, markdown-friendly bios, emojis, and more.</p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-md">
            <h3 className="text-lg font-semibold text-white mb-2">Customizable</h3>
            <p className="text-gray-400">Pick colors, add icons, and order your links the way you want. Your profile, your style.</p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-md">
            <h3 className="text-lg font-semibold text-white mb-2">Open Source</h3>
            <p className="text-gray-400">We&apos;re transparent and community-driven. Built with modern tech, and constantly improving.</p>
          </div>
        </div>
      </div>

      <footer className="mt-24 text-sm text-gray-500 text-center">
        © {new Date().getFullYear()} Lynks. Crafted with love by Leeroy Mokua.
      </footer>
    </div>
  );
}
