"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/userStore";
import { useLinksStore } from "@/stores/linksStore";
import { useThemeStore, prebuiltThemes } from "@/stores/themeStore";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ExternalLink, Eye, Link, Package, Share2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useProductsStore } from "@/stores/productsStore";

export function ProfilePreview() {
  const { user, fetchUser } = useUserStore();
  const { links, fetchLinks, incrementLinkClicks } = useLinksStore();
  const { theme } = useThemeStore();
  const { products: allProducts } = useProductsStore();

  const [totalViews] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<
    "links" | "products" | "subscriptions"
  >("links");

  useEffect(() => {
    fetchUser();
    fetchLinks();
  }, []);

  // Filtered data
  const visibleLinks = links.filter((link) => link.is_visible);
  const publishedProducts = allProducts.filter((p) => p.published);

  // Determine active theme (if user's theme name exists, use its config)
  const activeTheme = useMemo(() => {
    if (user?.theme) {
      const found = prebuiltThemes.find((t) => t.id === user.theme);
      return found ? found.config : theme;
    }
    return theme;
  }, [user?.theme, theme]);

  const formatPrice = (cents: number, currency: "usd" | "eur" | "gbp") => {
    const map: Record<typeof currency, string> = {
      usd: "USD",
      eur: "EUR",
      gbp: "GBP",
    };
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: map[currency],
      }).format((cents || 0) / 100);
    } catch {
      return `$${(cents || 0) / 100}`;
    }
  };

  const handleLinkClick = (linkId: string, url: string) => {
    incrementLinkClicks(linkId);
    window.open(url, "_blank");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast("Link copied! Profile link has been copied to clipboard");
  };

  const applyThemeStyles = (): React.CSSProperties => ({
    background: activeTheme.backgroundColor, // Full-page background
    color: activeTheme.textColor, // Global text
    fontFamily: activeTheme.fontFamily,
  });

  const getLinkCardStyles = (): React.CSSProperties => ({
    backgroundColor: activeTheme.cardBackground, // Card stands out from bg
    borderColor: activeTheme.primaryColor, // Accent border
    borderRadius: activeTheme.borderRadius,
    color: activeTheme.textColor, // Readable text
  });

  const getButtonVariant = ():
    | "default"
    | "outline"
    | "ghost"
    | "gradient"
    | "link"
    | "destructive"
    | "secondary"
    | null
    | undefined => {
    const v = (theme.buttonStyle || "").toLowerCase();
    if (v === "default" || v === "outline" || v === "ghost" || v === "gradient")
      return v as typeof v;
    if (v === "neon") return "gradient";
    if (v === "dark") return "outline";
    return "default";
  };

  if (!user) return null;

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Live Preview
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          This is how your profile appears to visitors
        </p>
      </CardHeader>
      <CardContent className="p-3">
        <main
          className="min-h-screen py-8 px-4 transition-all duration-300 rounded-lg"
          style={applyThemeStyles()}
          role="main"
        >
          <div className="max-w-md mx-auto space-y-6">
            {/* Header with share button */}
            <header className="flex justify-end" role="banner">
              <Button
                variant={getButtonVariant()}
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-2"
                style={{
                  borderColor: activeTheme.primaryColor,
                  color: activeTheme.textColor,
                }}
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </header>

            {/* Profile Header */}
            <div className="text-center space-y-4">
              <Avatar className="w-24 h-24 mx-auto ring-4 ring-offset-4 ring-offset-background">
                <AvatarImage
                  src={user.avatar ?? undefined}
                  alt={`Avatar of ${user.full_name ?? user.username ?? "User"}`}
                  loading="lazy"
                />
                <AvatarFallback
                  className="text-2xl font-bold"
                  style={{
                    backgroundColor: activeTheme.backgroundColor,
                    color: activeTheme.textColor,
                  }}
                >
                  {(
                    user.full_name?.charAt(0) ??
                    user.username?.charAt(0) ??
                    "U"
                  ).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <h1
                  className="text-2xl font-bold"
                  style={{ color: activeTheme.textColor }}
                >
                  {user.full_name || user.username}
                </h1>

                <p className="text-sm opacity-75">@{user.username}</p>

                {user.bio && (
                  <p
                    className="text-base max-w-sm mx-auto leading-relaxed"
                    style={{ color: activeTheme.textColor }}
                  >
                    {user.bio}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="flex justify-center gap-6 pt-4">
                <div className="text-center">
                  <div
                    className="text-xl font-bold"
                    style={{ color: activeTheme.primaryColor }}
                  >
                    {visibleLinks.length}
                  </div>
                  <div className="text-xs opacity-75">Links</div>
                </div>
                <div className="text-center">
                  <div
                    className="text-xl font-bold"
                    style={{ color: activeTheme.primaryColor }}
                  >
                    {totalViews.toLocaleString()}
                  </div>
                  <div className="text-xs opacity-75">Views</div>
                </div>
                <div className="text-center">
                  <div
                    className="text-xl font-bold"
                    style={{ color: activeTheme.primaryColor }}
                  >
                    {links.reduce((sum, link) => sum + link.clicks, 0)}
                  </div>
                  <div className="text-xs opacity-75">Clicks</div>
                </div>
              </div>
            </div>

            {/* Tag list selector */}
            <div className="space-y-4">
              <div className="flex justify-center">
                <ToggleGroup
                  type="single"
                  value={activeTab}
                  onValueChange={(v) =>
                    v &&
                    setActiveTab(v as "links" | "products" | "subscriptions")
                  }
                  className="grid w-full max-w-md grid-cols-3 gap-2"
                >
                  <ToggleGroupItem
                    value="links"
                    aria-label="Show Links"
                    className="flex items-center justify-center gap-2 px-3 py-2 text-sm sm:text-base rounded-md border transition-colors"
                    style={{
                      backgroundColor:
                        activeTab === "links"
                          ? activeTheme.primaryColor
                          : "transparent",
                      borderColor: activeTheme.backgroundColor,
                      color: activeTheme.taglistTextColor,
                    }}
                  >
                    <Link className="h-4 w-4" />
                    <span className="hidden sm:inline truncate max-w-[100px]">
                      Links
                    </span>
                    <Badge
                      className="justify-center px-1.5 py-1"
                      variant="secondary"
                    >
                      {visibleLinks.length}
                    </Badge>
                  </ToggleGroupItem>

                  <ToggleGroupItem
                    value="products"
                    aria-label="Show Products"
                    className="flex items-center justify-center gap-2 px-3 py-2 text-sm sm:text-base rounded-md border transition-colors"
                    style={{
                      backgroundColor:
                        activeTab === "products"
                          ? activeTheme.primaryColor
                          : "transparent",
                      borderColor: activeTheme.backgroundColor,
                      color: activeTheme.taglistTextColor,
                    }}
                  >
                    <Package className="h-4 w-4" />
                    <span className="hidden sm:inline truncate max-w-[100px]">
                      Products
                    </span>
                    <Badge
                      className="justify-center px-1.5 py-1"
                      variant="secondary"
                    >
                      {publishedProducts.length}
                    </Badge>
                  </ToggleGroupItem>

                  <ToggleGroupItem
                    value="subscriptions"
                    aria-label="Show Subscriptions"
                    className="flex items-center justify-center gap-2 px-3 py-2 text-sm sm:text-base rounded-md border transition-colors"
                    style={{
                      backgroundColor:
                        activeTab === "subscriptions"
                          ? activeTheme.primaryColor
                          : "transparent",
                      borderColor: activeTheme.backgroundColor,
                      color: activeTheme.taglistTextColor,
                    }}
                  >
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline truncate max-w-[100px]">
                      Subscriptions
                    </span>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Links */}
              {activeTab === "links" && (
                <div className="space-y-4">
                  {visibleLinks.length === 0 ? (
                    <Card
                      className="p-8 text-center border-dashed"
                      style={getLinkCardStyles()}
                    >
                      <p className="text-muted-foreground">
                        No links available yet
                      </p>
                    </Card>
                  ) : (
                    visibleLinks.map((link) => (
                      <Card
                        key={link.id}
                        className="p-4 cursor-pointer hover:scale-[1.02] transition-all duration-200 border-2 hover:shadow-lg"
                        style={getLinkCardStyles()}
                        onClick={() => handleLinkClick(link.id, link.url)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3
                              className="font-semibold text-lg truncate"
                              style={{ color: activeTheme.textColor }}
                            >
                              {link.title}
                            </h3>
                            <p
                              className="text-sm opacity-75 truncate"
                              style={{ color: activeTheme.textColor }}
                            >
                              {link.url.replace(/^https?:\/\//, "")}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 ml-4">
                            {link.clicks > 0 && (
                              <div className="flex items-center gap-1 text-xs opacity-75">
                                <Eye className="h-3 w-3" />
                                {link.clicks}
                              </div>
                            )}
                            <ExternalLink
                              className="h-5 w-5 opacity-60"
                              style={{ color: activeTheme.textColor }}
                            />
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {/* Products */}
              {activeTab === "products" && (
                <div className="space-y-4">
                  {publishedProducts.length === 0 ? (
                    <Card
                      className="p-8 text-center border-dashed"
                      style={getLinkCardStyles()}
                    >
                      <p className="text-muted-foreground">
                        No products available yet
                      </p>
                    </Card>
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
                      {publishedProducts.map((p) => (
                        <Card
                          key={p.id}
                          className="p-4 border-2 hover:shadow-lg transition flex flex-col"
                          style={getLinkCardStyles()}
                        >
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={`${p.name} image`}
                              className="w-full h-48 sm:h-56 lg:h-64 rounded object-cover border"
                              style={{ objectFit: "cover" }}
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-48 sm:h-56 lg:h-64 rounded bg-muted" />
                          )}

                          {/* Info under image */}
                          <div className="flex flex-col mt-4 flex-1">
                            <div className="flex items-center justify-between">
                              <h3
                                className="font-semibold truncate"
                                style={{ color: activeTheme.textColor }}
                              >
                                {p.name}
                              </h3>
                              <span
                                className="text-sm font-medium shrink-0"
                                style={{ color: activeTheme.primaryColor }}
                              >
                                {formatPrice(p.price, p.currency)}
                              </span>
                            </div>

                            {p.description && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                                {p.description}
                              </p>
                            )}

                            <div className="mt-auto pt-4">
                              <Button
                                size="sm"
                                className="w-full"
                                onClick={() =>
                                  toast(
                                    <>
                                      <strong>Checkout coming soon</strong>
                                      <div>
                                        Connect Stripe in your Commerce page.
                                      </div>
                                    </>
                                  )
                                }
                              >
                                Get
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Subscriptions (from Commerce) */}
              {activeTab === "subscriptions" && (
                <div className="space-y-4">
                  <Card
                    className="p-8 text-center border-dashed"
                    style={getLinkCardStyles()}
                  >
                    <p className="text-muted-foreground">
                      No subscriptions available yet
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Plans created in Commerce will appear here.
                    </p>
                  </Card>
                </div>
              )}
            </div>

            {/* Footer */}
            <footer className="text-center pt-8 pb-4" role="contentinfo">
              <p className="text-xs opacity-50">
                Create your own link page with{" "}
                <a
                  href="/"
                  className="underline hover:no-underline"
                  style={{ color: activeTheme.primaryColor }}
                >
                  Lynx
                </a>
              </p>
            </footer>
          </div>
        </main>
      </CardContent>
    </Card>
  );
}
