"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useLinksStore } from "@/stores/linksStore";
import { ExternalLink, Eye, Link, Package, Share2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { prebuiltThemes, useThemeStore } from "@/stores/themeStore";
import { supabase } from "@/utils/supabase/client";
import { Product, Profile, SubscriptionPlan, UserLink } from "@/types";

export default function PublicProfile() {
  const { username: paramUsername } = useParams<{ username: string }>();
  const username = paramUsername ?? "";
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<UserLink[]>([]);
  const { incrementLinkClicks } = useLinksStore();
  const { theme } = useThemeStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleLinks, setVisibleLinks] = useState<UserLink[]>([]);
  const [publishedProducts, setPublishedProducts] = useState<Product []>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionPlan[]>([]);

  const [selectedMethods, setSelectedMethods] = useState<
    Record<string, "stripe" | "mpesa">
  >({});
  const [phones, setPhones] = useState<Record<string, string>>({});
  const [loadingPlans, setLoadingPlans] = useState<Record<string, boolean>>({});
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({});

  const [totalViews] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<
    "links" | "products" | "subscriptions"
  >("links");

  // Fetch user + content
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);

      // 1️⃣ fetch profile by username
      const { data: profileData, error: profileErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

      if (profileErr || !profileData) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // 2️⃣ fetch links
      const { data: linkData } = await supabase
        .from("links")
        .select("*")
        .eq("user_id", profileData.id)
        .eq("is_visible", true);

      setVisibleLinks(linkData!.filter((l) => l.is_visible));

      setLinks(visibleLinks);

      // 3️⃣ fetch products
      const { data: productData } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", profileData.id)
        .eq("published", true);

      setPublishedProducts(productData!.filter((p) => p.published));

      if (!products.length) setProducts(productData || []);

      // 4️⃣ fetch subscriptions
      const { data: subsData } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("user_id", profileData.id)
        .eq("status", "active"); // only active ones

      setSubscriptions(subsData || []);

      setLoading(false);
    };

    if (username) fetchProfile();
  }, [username]);

  useEffect(() => {
    const stored = localStorage.getItem("Lynx_payment_methods");
    if (stored) {
      setSelectedMethods(JSON.parse(stored));
    }
  }, []);

  // Determine active theme (if profile's theme name exists, use its config)
  const activeTheme = useMemo(() => {
    if (profile?.theme) {
      const found = prebuiltThemes.find((t) => t.id === profile.theme);
      return found ? found.config : theme;
    }
    return theme;
  }, [profile?.theme, theme]);

  // Helpers
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
    toast({
      title: "Link copied!",
      description: "Profile link has been copied to clipboard",
    });
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

  const buttonVariants: { [key: string]: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | "gradient" } = {
    default: "default",
    neon: "gradient", // Map neon to the gradient variant
    dark: "outline",
    bold: "gradient",
    "retro-wave": "gradient", // New mapping
    "high-contrast": "default", // New mapping
    // Add other themes as needed
  };

  const getButtonVariant = (): "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | "gradient" => {
    return buttonVariants[activeTheme.buttonStyle] || "default";
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  // SEO metadata
  const full_name = profile.full_name || profile.username;
  const pageTitle = `${full_name} | Lynx Profile`;
  const metaDescription = profile.bio
    ? profile.bio
    : `Explore links, socials, and content from ${full_name} (@${profile.username}).`;

  const canonicalUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `/profile/${profile.username}`;

  const sameAs = visibleLinks.map((l) => l.url);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: pageTitle,
    url: canonicalUrl,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Lynx",
          item: typeof window !== "undefined" ? window.location.origin : "",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: full_name,
          item: canonicalUrl,
        },
      ],
    },
    mainEntity: {
      "@type": "Person",
      name: full_name,
      url: canonicalUrl,
      additionalName: profile.username,
      sameAs,
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="profile" />
        <meta property="profile:username" content={profile.username ?? ""} />
        <meta name="twitter:card" content="summary" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      <main
        className="min-h-screen py-8 px-4 transition-all duration-300"
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
                src={profile.avatar || undefined}
                alt={`Avatar of ${full_name} (@${profile.username})`}
                loading="lazy"
              />
              <AvatarFallback
                className="text-2xl font-bold"
                style={{
                  backgroundColor: activeTheme.backgroundColor,
                  color: activeTheme.textColor,
                }}
              >
                {(profile?.full_name || profile?.username || "U")
                  .charAt(0)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <h1
                className="text-2xl font-bold"
                style={{ color: activeTheme.textColor }}
              >
                {profile.full_name || profile.username}
              </h1>

              <p className="text-sm opacity-75">@{profile.username}</p>

              {profile.bio && (
                <p
                  className="text-base max-w-sm mx-auto leading-relaxed"
                  style={{ color: activeTheme.textColor }}
                >
                  {profile.bio}
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
                onValueChange={(v) => v && setActiveTab(v as "links" | "products" | "subscriptions")}
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
                  <span className="hidden sm:inline">Links</span>
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
                  <span className="hidden sm:inline">Products</span>
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
                  <span className="hidden sm:inline">Subscriptions</span>
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
                        className="p-3 border-2 hover:shadow-lg transition flex flex-col"
                        style={getLinkCardStyles()}
                      >
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={`${p.name} image`}
                            className="w-full h-48 sm:h-56 rounded object-cover border"
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
                              {formatPrice(p.price, p.currency as "usd" | "eur" | "gbp")}
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
                                toast({
                                  title: "Checkout coming soon",
                                  description:
                                    "Connect Stripe in your Commerce page.",
                                })
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
                {subscriptions.length === 0 ? (
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
                ) : (
                  subscriptions.map((plan) => {
                    const selectedMethod = selectedMethods[plan.id] || "";
                    const phone = phones[plan.id] || "";
                    const loading = loadingPlans[plan.id] || false;

                    return (
                      <Card
                        key={plan.id}
                        className="p-6"
                        style={getLinkCardStyles()}
                      >
                        <h3 className="text-lg font-semibold">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {plan.description}
                        </p>
                        <p className="mt-2 font-bold">
                          {formatPrice(plan.price, plan.currency as "usd" | "eur" | "gbp")} / month
                        </p>

                        {/* Payment method choice */}
                        <div className="mt-4 space-y-2">
                          <Label className="text-sm font-medium">
                            Choose payment method
                          </Label>
                          <Select
                            open={openStates[plan.id] || false}
                            onOpenChange={(isOpen) =>
                              setOpenStates((prev) => ({
                                ...prev,
                                [plan.id]: isOpen,
                              }))
                            }
                            value={selectedMethods[plan.id] || ""}
                            onValueChange={(v: "stripe" | "mpesa") => {
                              setSelectedMethods((prev) => {
                                const updated = { ...prev, [plan.id]: v };
                                localStorage.setItem(
                                  "Lynx_payment_methods",
                                  JSON.stringify(updated)
                                ); // persist
                                return updated;
                              });
                              setOpenStates((prev) => ({
                                ...prev,
                                [plan.id]: false,
                              })); // auto-close
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="stripe">
                                💳 Card (Stripe)
                              </SelectItem>
                              <SelectItem value="mpesa">📱 M-Pesa</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Optional M-Pesa phone number input */}
                        {selectedMethod === "mpesa" && (
                          <div className="mt-3 space-y-1">
                            <Label htmlFor={`phone-${plan.id}`}>
                              Phone Number
                            </Label>
                            <Input
                              id={`phone-${plan.id}`}
                              placeholder="e.g., 254712345678"
                              value={phone}
                              onChange={(e) =>
                                setPhones((prev) => ({
                                  ...prev,
                                  [plan.id]: e.target.value,
                                }))
                              }
                            />
                          </div>
                        )}

                        {/* Subscribe button */}
                        <Button
                          className="mt-6 w-full"
                          variant={getButtonVariant()}
                          disabled={loading}
                          onClick={async () => {
                            setLoadingPlans((prev) => ({
                              ...prev,
                              [plan.id]: true,
                            }));
                            try {
                              if (selectedMethod === "stripe") {
                                const res = await fetch("/api/checkout", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    planId: plan.id,
                                    planName: plan.name,
                                    price: plan.price,
                                    currency: plan.currency,
                                  }),
                                });
                                const data = await res.json();
                                if (data.url) window.location.href = data.url;
                              } else if (selectedMethod === "mpesa") {
                                const res = await fetch("/api/mpesa-checkout", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    phoneNumber: phone,
                                    planName: plan.name,
                                    price: plan.price,
                                  }),
                                });
                                const data = await res.json();
                                if (data.success) {
                                  toast({
                                    title: "M-Pesa Prompt Sent",
                                    description:
                                      "Check your phone to complete the payment.",
                                  });
                                }
                              }
                            } catch (err) {
                              console.error("Subscribe failed:", err);
                              toast({
                                title: "Error",
                                description: "Could not start checkout.",
                                variant: "destructive",
                              });
                            } finally {
                              setLoadingPlans((prev) => ({
                                ...prev,
                                [plan.id]: false,
                              }));
                            }
                          }}
                        >
                          {loading ? (
                            <>
                              <svg
                                className="animate-spin h-4 w-4 mr-2 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                ></path>
                              </svg>
                              Processing...
                            </>
                          ) : (
                            "Subscribe"
                          )}
                        </Button>
                      </Card>
                    );
                  })
                )}
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
    </>
  );
}
