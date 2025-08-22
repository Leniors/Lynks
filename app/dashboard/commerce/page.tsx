"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLinksStore } from "@/stores/linksStore";
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  ShoppingCart,
  Zap,
  Link,
  Settings,
  BarChart3,
  Users,
  Download,
  Eye,
  Lock,
  LayoutDashboard,
} from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { useUserStore } from "@/stores/userStore";
import type { UserLink, SubscriptionPlan, Transaction } from "@/types";

export default function CommercePage() {
  const { toast } = useToast();
  const { links } = useLinksStore();
  const [paidLinks, setPaidLinks] = useState<UserLink[]>([]);
  const [priceInput, setPriceInput] = useState("");
  const [planNameInput, setPlanNameInput] = useState("");
  const [planDescriptionInput, setPlanDescriptionInput] = useState("");
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const { user } = useUserStore();
  const [savingSettings, setSavingSettings] = useState(false);

  // Revenue data
  const [revenueData, setRevenueData] = useState({
    totalRevenue: 0,
    totalRevenueChange: 0,
    monthlyRevenue: 0,
    monthlyRevenueChange: 0,
    subscribers: 0,
    newSubscribers: 0,
    conversionRate: 0,
    conversionRateChange: 0,
    transactions: [] as Transaction[],
  });

  useEffect(() => {
    const fetchRevenue = async () => {
      // Get latest 100 transactions for enough history
      const { data: transactions, error: txError } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (txError) {
        console.error("Error fetching transactions:", txError);
        return;
      }

      const completedTx = transactions.filter((t) => t.status === "completed");

      // === Revenue ===
      const totalRevenue = completedTx.reduce(
        (sum, t) => sum + Number(t.amount),
        0
      );

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const monthlyRevenue = completedTx
        .filter((t) => new Date(t.created_at) >= monthStart)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const lastMonthRevenue = completedTx
        .filter(
          (t) =>
            new Date(t.created_at) >= lastMonthStart &&
            new Date(t.created_at) < monthStart
        )
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalRevenueChange =
        lastMonthRevenue > 0
          ? (
              ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) *
              100
            ).toFixed(1)
          : 0;

      const monthlyRevenueChange = totalRevenueChange;

      // === Subscribers ===
      const { count: subscriberCount } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      const thisWeekStart = new Date();
      thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());

      const { count: newSubscribers } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")
        .gte("created_at", thisWeekStart.toISOString());

      // === Conversion rate ===
      const { count: totalUsers } = await supabase
        .from("users") // replace if your user table is named differently
        .select("*", { count: "exact", head: true });

      // This month’s subscribers
      const { count: thisMonthSubs } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")
        .gte("created_at", monthStart.toISOString());

      // Last month’s subscribers
      const { count: lastMonthSubs } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")
        .gte("created_at", lastMonthStart.toISOString())
        .lt("created_at", monthStart.toISOString());

      const conversionRate =
        totalUsers && totalUsers > 0
          ? ((subscriberCount! / totalUsers) * 100).toFixed(1)
          : 0;

      const thisMonthRate =
        totalUsers && totalUsers > 0
          ? ((thisMonthSubs! / totalUsers) * 100).toFixed(1)
          : 0;

      const lastMonthRate =
        totalUsers && totalUsers > 0
          ? ((lastMonthSubs! / totalUsers) * 100).toFixed(1)
          : 0;

      const conversionRateChange =
        Number(lastMonthRate) > 0
          ? (
              ((Number(thisMonthRate) - Number(lastMonthRate)) /
                Number(lastMonthRate)) *
              100
            ).toFixed(1)
          : 0;

      // === Update state ===
      setRevenueData({
        totalRevenue,
        totalRevenueChange: Number(totalRevenueChange),
        monthlyRevenue,
        monthlyRevenueChange: Number(monthlyRevenueChange),
        subscribers: subscriberCount || 0,
        newSubscribers: newSubscribers || 0,
        conversionRate: Number(conversionRate),
        conversionRateChange: Number(conversionRateChange),
        transactions: transactions || [],
      });
    };

    fetchRevenue();
  }, []);

  // Fetch paid links
  useEffect(() => {
    const fetchPaidLinks = async () => {
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("is_paid", true);

      if (error) {
        console.error("Error fetching paid links:", error);
        return;
      }

      setPaidLinks(data || []);
    };

    fetchPaidLinks();
  }, []);

  // Fetch subscription plans
  const fetchPlans = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("user_id", user.id) // ✅ only their plans
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching plans:", error);
      return;
    }

    setPlans(data || []);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Settings
  const [settings, setSettings] = useState<{
    enableLinkMonetization: boolean;
    subscriptionGateway: boolean;
    revenueAnalytics: boolean;
    paymentMethods: string[]; // 👈 force it to string[]
  }>({
    enableLinkMonetization: false,
    subscriptionGateway: false,
    revenueAnalytics: true,
    paymentMethods: ["cards", "paypal"],
  });

  useEffect(() => {
    if (!user) return;

    const fetchSettings = async () => {
      const { data } = await supabase
        .from("commerce_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setSettings({
          enableLinkMonetization: data.enable_link_monetization,
          subscriptionGateway: data.subscription_gateway,
          revenueAnalytics: data.revenue_analytics,
          paymentMethods: data.payment_methods,
        });
      } else {
        // Optional: insert default settings for first-time users
        await supabase.from("commerce_settings").insert({
          user_id: user.id,
          enable_link_monetization: false,
          subscription_gateway: false,
          revenue_analytics: true,
          payment_methods: ["cards", "paypal"],
        });
      }
    };

    fetchSettings();
  }, [user, user?.id]);

  // Handle link monetization
  const handleMakeLinkPaid = async (linkId: string) => {
    const { error } = await supabase
      .from("links")
      .update({ is_paid: true })
      .eq("id", linkId);

    if (error) {
      toast({
        title: "Error",
        description: "Could not update link status.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Link Monetized",
      description: "Link is now a paid link. Users will need to pay to access.",
    });

    // Refresh list
    setPaidLinks((prev) => [...prev, links.find((l) => l.id === linkId)!]);
  };

  // Handle making link free
  const handleMakeLinkFree = async (linkId: string) => {
    const { error } = await supabase
      .from("links")
      .update({ is_paid: false })
      .eq("id", linkId);

    if (error) {
      console.error("Error making link free:", error);
    } else {
      // Update UI state
      setPaidLinks((prev) => prev.filter((pl) => (pl as { id: string }).id !== linkId));
    }
  };

  // Handle subscription creation
  const handleSubscriptionCreate = async () => {
    if (!priceInput) {
      toast({
        title: "Price Required",
        description: "Please enter a subscription price.",
        variant: "destructive",
      });
      return;
    }

    if (!planNameInput.trim()) {
      toast({
        title: "Plan Name Required",
        description: "Please enter a plan name.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("subscription_plans").insert([
      {
        user_id: user?.id, // ✅ ownership
        name: planNameInput.trim(),
        price: parseFloat(priceInput),
        description: planDescriptionInput.trim(),
        features: [],
        status: "active",
      },
    ]);

    if (error) {
      toast({
        title: "Error",
        description: "Could not create subscription plan.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Subscription Plan Created",
      description: `Plan "${planNameInput}" created for $${priceInput}/month.`,
    });

    // Reset
    setPriceInput("");
    setPlanNameInput("");

    // Refresh
    fetchPlans();
  };

  // Save settings
  const handleSaveSettings = async () => {
    setSavingSettings(true);
    const { error } = await supabase.from("commerce_settings").upsert(
      {
        user_id: user?.id,
        enable_link_monetization: settings.enableLinkMonetization,
        subscription_gateway: settings.subscriptionGateway,
        revenue_analytics: settings.revenueAnalytics,
        payment_methods: settings.paymentMethods,
        updated_at: new Date(),
      },
      { onConflict: "user_id" } // ✅ ensures update instead of new insert
    );

    if (error) {
      toast({
        title: "Error",
        description: "Could not save settings",
        variant: "destructive",
      });
    } else {
      toast({ title: "Settings saved successfully" });
    }

    setSavingSettings(false);
  };

  // Add a payment method (e.g., stripe or mpesa)
  const addPaymentMethod = async (method: string) => {
    const updatedMethods = Array.from(
      new Set([...settings.paymentMethods, method])
    );

    const { error } = await supabase
      .from("commerce_settings")
      .update({
        payment_methods: updatedMethods,
        updated_at: new Date(),
      })
      .eq("user_id", user?.id);

    if (error) {
      toast({
        title: "Error",
        description: `Could not connect ${method}`,
        variant: "destructive",
      });
    } else {
      setSettings((prev) => ({ ...prev, paymentMethods: updatedMethods }));
      toast({ title: `${method.toUpperCase()} connected successfully` });
    }
  };

  // Remove a payment method (optional)
  const removePaymentMethod = async (method: string) => {
    const updatedMethods = settings.paymentMethods.filter((m) => m !== method);

    const { error } = await supabase
      .from("commerce_settings")
      .update({
        payment_methods: updatedMethods,
        updated_at: new Date(),
      })
      .eq("user_id", user?.id);

    if (error) {
      toast({
        title: "Error",
        description: `Could not disconnect ${method}`,
        variant: "destructive",
      });
    } else {
      setSettings((prev) => ({ ...prev, paymentMethods: updatedMethods }));
      toast({ title: `${method.toUpperCase()} disconnected successfully` });
    }
  };

  // Wrappers
  const handleStripeSetup = () => addPaymentMethod("stripe");
  const handleMpesaSetup = () => addPaymentMethod("mpesa");

  return (
    <div className="w-full mx-auto space-y-8 mb-16 md:pr-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Commerce</h1>
        <p className="text-muted-foreground">
          Monetize your links and manage your revenue streams
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger
            value="overview"
            className="flex items-center justify-center gap-2"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value="monetization"
            className="flex items-center justify-center gap-2"
          >
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Monetization</span>
          </TabsTrigger>
          <TabsTrigger
            value="subscriptions"
            className="flex items-center justify-center gap-2"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Subscriptions</span>
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="flex items-center justify-center gap-2"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Revenue Overview */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${revenueData.totalRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">
                    +{revenueData.totalRevenueChange}%
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Monthly Revenue
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${revenueData.monthlyRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">
                    +{revenueData.monthlyRevenueChange}%
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Subscribers
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {revenueData.subscribers}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">
                    +{revenueData.newSubscribers}
                  </span>{" "}
                  new this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Conversion Rate
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {revenueData.conversionRate}%
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">
                    +{revenueData.conversionRateChange}%
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Latest payments and subscriptions
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center justify-center"
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="inline">Export</span>
              </Button>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {revenueData.transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg gap-3"
                  >
                    {/* Left Section */}
                    <div className="space-y-1 flex-1">
                      <p className="font-medium break-words">
                        {transaction.user_email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.plan} Plan
                      </p>
                    </div>

                    {/* Right Section */}
                    <div className="flex flex-col sm:items-end space-y-1 sm:text-right">
                      <p className="font-medium">${transaction.amount}</p>
                      <div className="flex flex-wrap sm:justify-end items-center gap-2">
                        <Badge
                          variant={
                            transaction.status === "completed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {transaction.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {transaction.created_at}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monetization" className="space-y-6">
          {/* Payment Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Setup
              </CardTitle>
              <CardDescription>
                Configure payment processing to start accepting payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stripe */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-medium">Stripe Integration</h4>
                  <p className="text-sm text-muted-foreground">
                    Connect your Stripe account to process card payments
                  </p>
                </div>
                <Button
                  onClick={
                    settings.paymentMethods.includes("stripe")
                      ? () => removePaymentMethod("stripe")
                      : handleStripeSetup
                  }
                  className="flex items-center gap-2"
                >
                  {settings.paymentMethods.includes("stripe") ? (
                    <>
                      <Zap className="h-4 w-4" />
                      Connected
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4" />
                      Setup Stripe
                    </>
                  )}
                </Button>
              </div>

              {/* M-Pesa */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-medium">M-Pesa Integration</h4>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to pay with M-Pesa mobile money
                  </p>
                </div>
                <Button
                  onClick={
                    settings.paymentMethods.includes("mpesa")
                      ? () => removePaymentMethod("mpesa")
                      : handleMpesaSetup
                  }
                  className="flex items-center gap-2"
                >
                  {settings.paymentMethods.includes("mpesa") ? (
                    <>
                      <Zap className="h-4 w-4" />
                      Connected
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4" />
                      Setup Stripe
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Link Monetization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Link Monetization
              </CardTitle>
              <CardDescription>
                Convert your links to paid content or gate them behind
                subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {links.slice(0, 5).map((link) => {
                  const isPaid = paidLinks.some((pl) => pl.id === link.id);

                  return (
                    <div
                      key={link.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg gap-3"
                    >
                      {/* Link Info */}
                      <div className="space-y-1 flex-1 min-w-0">
                        <h4 className="font-medium">{link.title}</h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {link.url}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        {isPaid ? (
                          <>
                            <Badge
                              variant="default"
                              className="flex items-center gap-1"
                            >
                              <Lock className="h-3 w-3" />
                              Paid
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full sm:w-auto"
                              onClick={() => handleMakeLinkFree(link.id)}
                            >
                              Make Free
                            </Button>
                          </>
                        ) : (
                          <>
                            <Badge
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              Free
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full sm:w-auto"
                              onClick={() => handleMakeLinkPaid(link.id)}
                            >
                              Make Paid
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          {/* Create Subscription Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Subscription Plans
              </CardTitle>
              <CardDescription>
                Create and manage subscription tiers for your content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Monthly Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="9.99"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan-name">Plan Name</Label>
                  <Input
                    id="plan-name"
                    placeholder="Premium Plan"
                    value={planNameInput}
                    onChange={(e) => setPlanNameInput(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan-description">Plan Description</Label>
                  <Input
                    id="plan-description"
                    placeholder="Premium Plan"
                    value={planDescriptionInput}
                    onChange={(e) => setPlanDescriptionInput(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleSubscriptionCreate} className="w-full">
                Create Subscription Plan
              </Button>
            </CardContent>
          </Card>

          {/* Existing Plans */}
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={
                  plan.status === "active" ? "border-2 border-primary" : ""
                }
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{plan.name}</CardTitle>
                    <Badge
                      variant={
                        plan.status === "active" ? "default" : "secondary"
                      }
                    >
                      {plan.status}
                    </Badge>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold">
                    ${plan.price}
                    <span className="text-sm font-normal">/month</span>
                  </div>
                  {/* <ul className="space-y-2 text-sm">
                    {plan.features?.length ? (
                      plan.features.map((f, i) => <li key={i}>• {f}</li>)
                    ) : (
                      <li>No features listed</li>
                    )}
                  </ul> */}
                  <Button className="w-full">Edit Plan</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Commerce Settings</CardTitle>
              <CardDescription>
                Configure your monetization preferences and payment settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* --- Dynamic State --- */}
              <div className="space-y-4">
                {/* Enable Link Monetization */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Enable Link Monetization</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow visitors to pay for premium content access
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableLinkMonetization}
                    onCheckedChange={(val) =>
                      setSettings((prev) => ({
                        ...prev,
                        enableLinkMonetization: val,
                      }))
                    }
                  />
                </div>

                <Separator />

                {/* Subscription Gateway */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Subscription Gateway</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable recurring subscription payments
                    </p>
                  </div>
                  <Switch
                    checked={settings.subscriptionGateway}
                    onCheckedChange={(val) =>
                      setSettings((prev) => ({
                        ...prev,
                        subscriptionGateway: val,
                      }))
                    }
                  />
                </div>

                <Separator />

                {/* Revenue Analytics */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Revenue Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Track detailed revenue and conversion metrics
                    </p>
                  </div>
                  <Switch
                    checked={settings.revenueAnalytics}
                    onCheckedChange={(val) =>
                      setSettings((prev) => ({
                        ...prev,
                        revenueAnalytics: val,
                      }))
                    }
                  />
                </div>

                <Separator />

                {/* Payment Methods */}
                <div className="space-y-3">
                  <Label>Payment Methods</Label>
                  <div className="space-y-2">
                    {[
                      { key: "stripe", label: "Stripe" },
                      { key: "mpesa", label: "M-Pesa" },
                      { key: "cards", label: "Credit/Debit Cards" },
                      { key: "paypal", label: "PayPal" },
                      { key: "applepay", label: "Apple Pay" },
                      { key: "googlepay", label: "Google Pay" },
                    ].map((method) => (
                      <div
                        key={method.key}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={settings.paymentMethods.includes(method.key)}
                          onChange={(e) => {
                            setSettings((prev) => ({
                              ...prev,
                              paymentMethods: e.target.checked
                                ? [...prev.paymentMethods, method.key]
                                : prev.paymentMethods.filter(
                                    (m) => m !== method.key
                                  ),
                            }));
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{method.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <Button
                className="w-full"
                onClick={handleSaveSettings}
                disabled={savingSettings}
              >
                {savingSettings ? "Saving..." : "Save Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
