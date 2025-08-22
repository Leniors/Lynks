"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Palette,
  BarChart3,
  Package,
  ShoppingBag,
  QrCode,
  Settings,
  ExternalLink,
  User,
} from "lucide-react";
import { HelmetProvider } from "react-helmet-async";
import { useUserStore } from "@/stores/userStore";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Themes", href: "/dashboard/themes", icon: Palette },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Commerce", href: "/dashboard/commerce", icon: ShoppingBag },
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "QR Codes", href: "/dashboard/qr-codes", icon: QrCode },
  // { name: "Integrations", href: "/dashboard/integrations", icon: Zap },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, fetchUser } = useUserStore();

  // Fetch user on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <img
                src="/2c3d0450-e827-42e6-b4a2-fcb7f96f7070.png"
                alt="Lynx"
                className="h-8 w-8"
              />
              <span className="hidden font-bold sm:inline-block">Lynx</span>
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none"></div>

            <nav className="flex items-center space-x-2">
              {user && (
                <Button variant="ghost" size="sm" asChild>
                  <Link
                    href={`/user/${user.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Profile
                  </Link>
                </Button>
              )}

              <Button variant="ghost" size="sm">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={user.avatar || ""}
                    alt={user.full_name || ""}
                  />
                  <AvatarFallback>
                    <User className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container p-4 md:p-[1rem] flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border">
          <nav className="flex justify-between px-2 py-2 overflow-x-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center flex-1 px-2 py-1 text-xs font-medium transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 mb-0.5" />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Desktop Sidebar */}
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <div className="h-full py-6 pr-6 lg:py-8">
            <div className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex w-full flex-col overflow-hidden">
          <HelmetProvider>{children}</HelmetProvider>
        </main>
      </div>
    </div>
  );
}
