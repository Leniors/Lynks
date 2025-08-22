"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLinksStore } from "@/stores/linksStore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  Eye,
  MousePointer,
  Calendar,
  Download,
  ExternalLink,
  BarChart3,
  Activity,
} from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { useUserStore } from "@/stores/userStore";

type TimeFilter = "7days" | "30days" | "all";

const COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
];

const AnalyticsPage = () => {
  const { links } = useLinksStore();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("7days");
  const [chartType, setChartType] = useState<"bar" | "pie" | "line">("bar");
  const { user } = useUserStore();

  // Analytics data
  const [analyticsData, setAnalyticsData] = useState<
    { date: string; clicks: number }[]
  >([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;

      const daysAgo =
        timeFilter === "7days" ? 7 : timeFilter === "30days" ? 30 : 365;
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - daysAgo);

      // Step 1: get all links for this user
      const { data: userLinks, error: linksError } = await supabase
        .from("links")
        .select("id")
        .eq("user_id", user.id);

      if (linksError) {
        console.error("Error fetching user links:", linksError);
        return;
      }

      if (!userLinks || userLinks.length === 0) {
        setAnalyticsData([]);
        return;
      }

      // Step 2: fetch clicks scoped to those link_ids
      const { data, error } = await supabase
        .from("link_clicks")
        .select("clicked_at")
        .in(
          "link_id",
          userLinks.map((l) => l.id)
        )
        .gte("clicked_at", sinceDate.toISOString())
        .order("clicked_at", { ascending: true });

      if (error) {
        console.error("Error fetching analytics:", error);
        return;
      }

      // Step 3: group by day
      const clicksPerDay: Record<string, number> = {};
      for (let i = 0; i < daysAgo; i++) {
        const d = new Date(sinceDate);
        d.setDate(sinceDate.getDate() + i);
        clicksPerDay[d.toISOString().split("T")[0]] = 0; // prefill days
      }

      data.forEach((click) => {
        const date = new Date(click.clicked_at).toISOString().split("T")[0];
        clicksPerDay[date] = (clicksPerDay[date] || 0) + 1;
      });

      const dailyData = Object.entries(clicksPerDay).map(([date, clicks]) => ({
        date,
        clicks,
      }));

      setAnalyticsData(dailyData);
    };

    fetchAnalytics();
  }, [user, timeFilter]);

  // Metrics data
  const [metrics, setMetrics] = useState({
    totalClicks: 0,
    totalViews: 0,
    totalUniqueVisitors: 0,
    avgClickRate: 0,
    visibleLinks: 0,
    topLink: { title: "N/A", clicks: 0 },
    bestDay: "N/A",
    peakHour: "N/A",
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!user) return;

      // Get all links owned by this user
      const { data: userLinks, error: linksError } = await supabase
        .from("links")
        .select("id, title, is_visible, clicks")
        .eq("user_id", user.id);

      if (linksError) {
        console.error("Error fetching user links:", linksError);
        return;
      }

      if (!userLinks || userLinks.length === 0) {
        setMetrics({
          totalClicks: 0,
          totalViews: 0,
          totalUniqueVisitors: 0,
          avgClickRate: 0,
          visibleLinks: 0,
          topLink: { title: "N/A", clicks: 0 },
          bestDay: "N/A",
          peakHour: "N/A",
        });
        return;
      }

      // Aggregate from user links
      const totalClicks = userLinks.reduce(
        (sum, link) => sum + (link.clicks || 0),
        0
      );
      const visibleLinks = userLinks.filter((link) => link.is_visible).length;
      const topLink = userLinks.reduce(
        (top, link) => (link.clicks > top.clicks ? link : top),
        userLinks[0] || { title: "N/A", clicks: 0 }
      ) || { title: "N/A", clicks: 0 };

      // Calculate date range
      const now = new Date();
      const daysAgo =
        timeFilter === "7days" ? 7 : timeFilter === "30days" ? 30 : 365;
      const startDate = new Date();
      startDate.setDate(now.getDate() - daysAgo);

      // Fetch click logs scoped to these links
      const { data: clickLogs, error: clicksError } = await supabase
        .from("link_clicks")
        .select("visitor_id, clicked_at")
        .in(
          "link_id",
          userLinks.map((l) => l.id)
        )
        .gte("clicked_at", startDate.toISOString())
        .lte("clicked_at", now.toISOString());

      if (clicksError) {
        console.error("Error fetching click logs:", clicksError);
        return;
      }

      // Unique visitors
      const visitorSet = new Set(clickLogs.map((c) => c.visitor_id));
      const totalUniqueVisitors = visitorSet.size;

      // Best day & peak hour
      const dayCounts: Record<string, number> = {};
      const hourCounts: Record<number, number> = {};

      clickLogs.forEach(({ clicked_at }) => {
        const date = new Date(clicked_at);
        const day = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        const hour = date.getHours();

        dayCounts[day] = (dayCounts[day] || 0) + 1;
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      const bestDay =
        Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

      const peakHourNum =
        Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

      const peakHour =
        peakHourNum !== null
          ? new Date(0, 0, 0, Number(peakHourNum)).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })
          : "N/A";

      setMetrics({
        totalClicks,
        totalViews: totalClicks, // if you don’t track impressions separately
        totalUniqueVisitors,
        avgClickRate: visibleLinks > 0 ? (totalClicks / visibleLinks) * 100 : 0,
        visibleLinks,
        topLink,
        bestDay,
        peakHour,
      });
    };

    fetchMetrics();
  }, [user, timeFilter]);

  // Stats growth
  const [statsGrowth, setStatsGrowth] = useState({
    views: 0,
    clicks: 0,
    ctr: 0,
    uniqueVisitors: 0,
  });

  useEffect(() => {
    const computeStatsGrowth = async () => {
      if (!user) return;

      // Fetch user’s links to get IDs
      const { data: userLinks, error: linksError } = await supabase
        .from("links")
        .select("id")
        .eq("user_id", user.id);

      if (linksError) {
        console.error("Error fetching user links for statsGrowth:", linksError);
        return;
      }

      const linkIds = (userLinks ?? []).map((l) => l.id);
      if (linkIds.length === 0) {
        setStatsGrowth({ views: 0, clicks: 0, ctr: 0, uniqueVisitors: 0 });
        return;
      }

      const days =
        timeFilter === "7days" ? 7 : timeFilter === "30days" ? 30 : 365;
      const now = new Date();

      // Current period [startCurrent, now]
      const startCurrent = new Date();
      startCurrent.setDate(now.getDate() - days);
      startCurrent.setHours(0, 0, 0, 0);

      // Previous period: same length ending right before current
      const endPrev = new Date(startCurrent.getTime() - 1);
      const startPrev = new Date(startCurrent);
      startPrev.setDate(startPrev.getDate() - days);
      startPrev.setHours(0, 0, 0, 0);

      const countClicks = async (start: Date, end: Date) => {
        const { count, error } = await supabase
          .from("link_clicks")
          .select("id", { head: true, count: "exact" })
          .in("link_id", linkIds)
          .gte("clicked_at", start.toISOString())
          .lte("clicked_at", end.toISOString());

        if (error) {
          console.error("countClicks error:", error);
          return 0;
        }
        return count || 0;
      };

      const countUniqueVisitors = async (start: Date, end: Date) => {
        const { data, error } = await supabase
          .from("link_clicks")
          .select("visitor_id")
          .in("link_id", linkIds)
          .gte("clicked_at", start.toISOString())
          .lte("clicked_at", end.toISOString());

        if (error) {
          console.error("countUniqueVisitors error:", error);
          return 0;
        }
        return new Set((data ?? []).map((r) => r.visitor_id)).size;
      };

      const calcGrowth = (current: number, prev: number) => {
        if (prev === 0) return current > 0 ? 100 : 0;
        return ((current - prev) / prev) * 100;
      };

      // Fetch in parallel
      const [currentClicks, prevClicks, currentUV, prevUV] = await Promise.all([
        countClicks(startCurrent, now),
        countClicks(startPrev, endPrev),
        countUniqueVisitors(startCurrent, now),
        countUniqueVisitors(startPrev, endPrev),
      ]);

      // If you don’t have a separate "views" table, treat views == clicks
      const currentViews = currentClicks;
      const prevViews = prevClicks;

      // CTR definition: clicks per visible link
      // 👇 Use metrics.visibleLinks that’s already user-scoped
      const currentCTR =
        metrics.visibleLinks > 0
          ? (currentClicks / metrics.visibleLinks) * 100
          : 0;
      const prevCTR =
        metrics.visibleLinks > 0
          ? (prevClicks / metrics.visibleLinks) * 100
          : 0;

      setStatsGrowth({
        views: calcGrowth(currentViews, prevViews),
        clicks: calcGrowth(currentClicks, prevClicks),
        ctr: calcGrowth(currentCTR, prevCTR),
        uniqueVisitors: calcGrowth(currentUV, prevUV),
      });
    };

    computeStatsGrowth();
  }, [user, timeFilter, metrics.visibleLinks]);

  // Growth metrics (month/week/yesterday)
  const [growth, setGrowth] = useState({
    month: 0,
    week: 0,
    yesterday: 0,
  });

  useEffect(() => {
    const fetchGrowth = async () => {
      if (!user) return;

      // First, fetch link IDs that belong to this user
      const { data: userLinks, error: linksError } = await supabase
        .from("links")
        .select("id")
        .eq("user_id", user.id);

      if (linksError) {
        console.error("Error fetching user links for growth:", linksError);
        return;
      }

      const linkIds = (userLinks ?? []).map((l) => l.id);
      if (linkIds.length === 0) {
        setGrowth({ month: 0, week: 0, yesterday: 0 });
        return;
      }

      const now = new Date();

      // Helper: count clicks in a range
      const getClicksCount = async (start: Date, end: Date) => {
        const { count, error } = await supabase
          .from("link_clicks")
          .select("id", { head: true, count: "exact" })
          .in("link_id", linkIds)
          .gte("clicked_at", start.toISOString())
          .lte("clicked_at", end.toISOString());

        if (error) {
          console.error("Error fetching clicks count:", error);
          return 0;
        }
        return count || 0;
      };

      // --- MONTH ---
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );
      const endOfLastMonth = new Date(startOfThisMonth);
      endOfLastMonth.setDate(0);

      const [thisMonthCount, lastMonthCount] = await Promise.all([
        getClicksCount(startOfThisMonth, now),
        getClicksCount(startOfLastMonth, endOfLastMonth),
      ]);
      const monthGrowth =
        lastMonthCount > 0
          ? ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100
          : 100;

      // --- WEEK ---
      const startOfThisWeek = new Date(now);
      startOfThisWeek.setDate(now.getDate() - now.getDay()); // Sunday as week start
      const startOfLastWeek = new Date(startOfThisWeek);
      startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
      const endOfLastWeek = new Date(startOfThisWeek);
      endOfLastWeek.setDate(endOfLastWeek.getDate() - 1);

      const [thisWeekCount, lastWeekCount] = await Promise.all([
        getClicksCount(startOfThisWeek, now),
        getClicksCount(startOfLastWeek, endOfLastWeek),
      ]);
      const weekGrowth =
        lastWeekCount > 0
          ? ((thisWeekCount - lastWeekCount) / lastWeekCount) * 100
          : 100;

      // --- YESTERDAY ---
      const yStart = new Date(now);
      yStart.setDate(now.getDate() - 1);
      yStart.setHours(0, 0, 0, 0);

      const yEnd = new Date(yStart);
      yEnd.setHours(23, 59, 59, 999);

      const dbyStart = new Date(yStart);
      dbyStart.setDate(dbyStart.getDate() - 1);

      const dbyEnd = new Date(dbyStart);
      dbyEnd.setHours(23, 59, 59, 999);

      const [yesterdayCount, dayBeforeCount] = await Promise.all([
        getClicksCount(yStart, yEnd),
        getClicksCount(dbyStart, dbyEnd),
      ]);
      const yesterdayGrowth =
        dayBeforeCount > 0
          ? ((yesterdayCount - dayBeforeCount) / dayBeforeCount) * 100
          : 100;

      setGrowth({
        month: monthGrowth,
        week: weekGrowth,
        yesterday: yesterdayGrowth,
      });
    };

    fetchGrowth();
  }, [user]);

  // Link performance data
  const linkPerformanceData = useMemo(() => {
    return links
      .filter((link) => link.is_visible)
      .map((link) => ({
        name:
          link.title.length > 15
            ? link.title.substring(0, 15) + "..."
            : link.title,
        clicks: link.clicks || 0,
        emoji: "🔗",
      }))
      .sort((a, b) => b.clicks - a.clicks);
  }, [links]);

  const exportAnalytics = () => {
    const csvData = [
      ["Link", "Clicks", "URL", "Visible"],
      ...links.map((link) => [
        link.title,
        link.clicks,
        link.url,
        link.is_visible,
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Lynx-analytics-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderChart = () => {
    switch (chartType) {
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={linkPerformanceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="clicks"
              >
                {linkPerformanceData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={linkPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="clicks"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={linkPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="clicks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="space-y-6 mb-16 md:pr-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
            Analytics
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Track your link performance and visitor insights.
          </p>
        </div>
        <Button
          onClick={exportAnalytics}
          variant="outline"
          className="flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </Button>
      </div>

      {/* Time Filter & Chart Type Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select
            value={timeFilter}
            onValueChange={(value: TimeFilter) => setTimeFilter(value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <Select
            value={chartType}
            onValueChange={(value: "bar" | "pie" | "line") =>
              setChartType(value)
            }
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="pie">Pie Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalViews.toLocaleString()}
            </div>
            <p
              className={`text-xs ${
                statsGrowth.views >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {statsGrowth.views >= 0 ? "+" : ""}
              {statsGrowth.views.toFixed(1)}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalClicks.toLocaleString()}
            </div>
            <p
              className={`text-xs ${
                statsGrowth.clicks >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {statsGrowth.clicks >= 0 ? "+" : ""}
              {statsGrowth.clicks.toFixed(1)}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.avgClickRate.toFixed(1)}%
            </div>
            <p
              className={`text-xs ${
                statsGrowth.ctr >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {statsGrowth.ctr >= 0 ? "+" : ""}
              {statsGrowth.ctr.toFixed(1)}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unique Visitors
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalUniqueVisitors.toLocaleString()}
            </div>
            <p
              className={`text-xs ${
                statsGrowth.uniqueVisitors >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {statsGrowth.uniqueVisitors >= 0 ? "+" : ""}
              {statsGrowth.uniqueVisitors.toFixed(1)}% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Link Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Link Performance</span>
            </CardTitle>
            <CardDescription>
              Click performance by link{" "}
              {timeFilter === "7days"
                ? "last 7 days"
                : timeFilter === "30days"
                ? "last 30 days"
                : "all time"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">{renderChart()}</CardContent>
        </Card>

        {/* Traffic Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Traffic Trends</span>
            </CardTitle>
            <CardDescription>Daily clicks over time</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString()
                  }
                />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Top Performing Links</span>
          </CardTitle>
          <CardDescription>
            Your most clicked links in the selected time period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {linkPerformanceData.slice(0, 5).map((link, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                    {index + 1}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{link.emoji}</span>
                    <span className="font-medium">{link.name}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary" className="px-3 py-1">
                    {link.clicks} clicks
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Profile Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* Active Links */}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Active Links
              </span>
              <span className="text-sm font-medium">
                {links.filter((link) => link.is_visible).length}
              </span>
            </div>

            {/* Total Links */}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Links</span>
              <span className="text-sm font-medium">{links.length}</span>
            </div>

            {/* Top Performer */}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Top Performer
              </span>
              <span className="text-sm font-medium">
                {links.length > 0
                  ? links.reduce(
                      (top, link) => (link.clicks > top.clicks ? link : top),
                      links[0]
                    ).title
                  : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Engagement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* Avg. CTR */}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Avg. CTR</span>
              <span className="text-sm font-medium">
                {metrics.avgClickRate.toFixed(1)}%
              </span>
            </div>

            {/* Best Day */}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Best Day</span>
              <span className="text-sm font-medium">
                {metrics.bestDay || "N/A"}
              </span>
            </div>

            {/* Peak Hour */}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Peak Hour</span>
              <span className="text-sm font-medium">
                {metrics.peakHour || "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Growth</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">This Month</span>
              <span
                className={`text-sm font-medium ${
                  growth.month >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {growth.month.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">This Week</span>
              <span
                className={`text-sm font-medium ${
                  growth.week >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {growth.week.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Yesterday</span>
              <span
                className={`text-sm font-medium ${
                  growth.yesterday >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {growth.yesterday.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
