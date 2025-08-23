"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLinksStore } from "@/stores/linksStore";
import {
  Settings,
  User,
  Shield,
  Bell,
  Palette,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Link,
  Globe,
  Lock,
  Mail,
  Smartphone,
  AlertTriangle,
} from "lucide-react";
import { useUserStore } from "@/stores/userStore";

export default function SettingsPage() {
  const { toast } = useToast();
  const { user, updateProfile } = useUserStore();
  const { links } = useLinksStore();

  const [profileForm, setProfileForm] = useState({
    username: user?.username ?? "",
    full_name: user?.full_name ?? "",
    bio: user?.bio ?? "",
    avatar: user?.avatar ?? "",
  });

  const [notifications, setNotifications] = useState({
    emailMarketing: true,
    emailUpdates: false,
    pushNotifications: true,
    weeklyReports: true,
  });

  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showAnalytics: false,
    allowIndexing: true,
  });

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleProfileUpdate = () => {
    updateProfile(profileForm);
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handleNotificationUpdate = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handlePrivacyUpdate = (key: keyof typeof privacy) => {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
    toast({
      title: "Privacy Settings Updated",
      description: "Your privacy preferences have been saved.",
    });
  };

  const handleExportData = () => {
    const data = {
      profile: user,
      links: links,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Lynx-data-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Data Exported",
      description: "Your data has been downloaded successfully.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion",
      description:
        "This feature would typically require additional confirmation and authentication.",
      variant: "destructive",
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 mb-16">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger
            value="profile"
            className="flex items-center justify-center gap-2"
          >
            <User className="h-4 w-4" />
            <span className="hidden md:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger
            value="privacy"
            className="flex items-center justify-center gap-2"
          >
            <Shield className="h-4 w-4" />
            <span className="hidden md:inline">Privacy</span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center justify-center gap-2"
          >
            <Bell className="h-4 w-4" />
            <span className="hidden md:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="flex items-center justify-center gap-2"
          >
            <Palette className="h-4 w-4" />
            <span className="hidden md:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger
            value="data"
            className="flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span className="hidden md:inline">Data</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your public profile information and avatar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar & Upload */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage
                    src={profileForm.avatar ?? undefined}
                    alt={
                      profileForm.full_name
                        ? `Avatar of ${profileForm.full_name}`
                        : "Profile avatar"
                    }
                  />
                  <AvatarFallback className="text-2xl">
                    {(profileForm.full_name ?? "").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-2 text-center sm:text-left">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Change Avatar
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Recommended: Square image, at least 400×400px
                  </p>
                </div>
              </div>

              {/* Username & Display Name */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profileForm.username}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    placeholder="your-username"
                  />
                  <p className="text-xs text-muted-foreground break-all">
                    Your public URL: Lynx.app/{profileForm.username}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="full_name">Display Name</Label>
                  <Input
                    id="full_name"
                    value={profileForm.full_name}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        full_name: e.target.value,
                      }))
                    }
                    placeholder="Your Display Name"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileForm.bio}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  placeholder="Tell visitors about yourself..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {profileForm.bio.length}/150 characters
                </p>
              </div>

              {/* Save Button */}
              <Button
                onClick={handleProfileUpdate}
                className="w-full sm:w-auto"
              >
                Save Profile Changes
              </Button>
            </CardContent>
          </Card>

          {/* Account Security */}
          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
              <CardDescription>
                Manage your account security and authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  icon: Mail,
                  title: "Email Address",
                  desc: "john@example.com",
                  action: "Change Email",
                },
                {
                  icon: Lock,
                  title: "Password",
                  desc: "Last changed 3 months ago",
                  action: "Change Password",
                },
                {
                  icon: Smartphone,
                  title: "Two-Factor Authentication",
                  desc: "Not enabled",
                  action: "Enable 2FA",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span className="font-medium">{item.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground break-all">
                      {item.desc}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    {item.action}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          {/* Profile Visibility */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Visibility</CardTitle>
              <CardDescription>
                Control who can see your profile and links
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Public Profile */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <Label>Public Profile</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Allow anyone to view your profile and links
                  </p>
                </div>
                <Switch
                  checked={privacy.profilePublic}
                  onCheckedChange={() => handlePrivacyUpdate("profilePublic")}
                />
              </div>

              <Separator />

              {/* Show Analytics */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <Label>Show Analytics</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Display view and click counts on your public profile
                  </p>
                </div>
                <Switch
                  checked={privacy.showAnalytics}
                  onCheckedChange={() => handlePrivacyUpdate("showAnalytics")}
                />
              </div>

              <Separator />

              {/* Search Engine Indexing */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    <Label>Search Engine Indexing</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Allow search engines to index your profile
                  </p>
                </div>
                <Switch
                  checked={privacy.allowIndexing}
                  onCheckedChange={() => handlePrivacyUpdate("allowIndexing")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Link Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>Link Privacy</CardTitle>
              <CardDescription>
                Manage privacy settings for individual links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {links.slice(0, 3).map((link) => (
                  <div
                    key={link.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-3"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="font-medium truncate">{link.title}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-full">
                        {link.url}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant={link.is_visible ? "default" : "secondary"}
                      >
                        {link.is_visible ? "Visible" : "Hidden"}
                      </Badge>
                      {link.is_visible ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Choose what email notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive emails about new features and tips
                  </p>
                </div>
                <Switch
                  checked={notifications.emailMarketing}
                  onCheckedChange={() =>
                    handleNotificationUpdate("emailMarketing")
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Product Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Important updates about the platform
                  </p>
                </div>
                <Switch
                  checked={notifications.emailUpdates}
                  onCheckedChange={() =>
                    handleNotificationUpdate("emailUpdates")
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Weekly Reports</Label>
                  <p className="text-sm text-muted-foreground">
                    Weekly analytics summary of your links
                  </p>
                </div>
                <Switch
                  checked={notifications.weeklyReports}
                  onCheckedChange={() =>
                    handleNotificationUpdate("weeklyReports")
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Push Notifications</CardTitle>
              <CardDescription>
                Browser and mobile push notification settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Browser Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about important events in your browser
                  </p>
                </div>
                <Switch
                  checked={notifications.pushNotifications}
                  onCheckedChange={() =>
                    handleNotificationUpdate("pushNotifications")
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>
                Customize the appearance of your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-medium">Custom Themes</h4>
                    <p className="text-sm text-muted-foreground">
                      Design your profile with custom colors and fonts
                    </p>
                  </div>
                  <Button variant="outline" asChild className="shrink-0">
                    <a href="/dashboard/themes" className="flex items-center">
                      <Palette className="h-4 w-4 mr-2" />
                      Customize Theme
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Export, import, or delete your account data
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Export / Import Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Export Data */}
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Export Data
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Download all your profile and link data as JSON
                    </p>
                    <Button onClick={handleExportData} className="w-full">
                      Export All Data
                    </Button>
                  </div>
                </div>

                {/* Import Data */}
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Import Data
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Import profile and links from a backup file
                    </p>
                    <Button variant="outline" className="w-full">
                      Choose File
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Danger Zone */}
              <Card className="border-destructive">
                <CardHeader className="pb-3">
                  <CardTitle className="text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    Irreversible actions that will permanently affect your
                    account
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border border-destructive rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium text-destructive">
                        Delete Account
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteAccount}
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
