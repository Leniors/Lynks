"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
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
import { useLinksStore } from "@/stores/linksStore";
import { LinkItem } from "@/components/dashboard/LinkItem";
import { AddLinkDialog } from "@/components/dashboard/AddLinkDialog";
import { ProfilePreview } from "@/components/dashboard/ProfilePreview";
import { toast } from "@/hooks/use-toast";
import { Link as LinkIcon, User, Eye, TrendingUp, Loader2 } from "lucide-react";
import { useUserStore } from "@/stores/userStore";

export default function Dashboard() {
  const { user, loading, updating, updateProfile, fetchUser } = useUserStore();
  const { links, reorderLinks, fetchLinks } = useLinksStore();

  useEffect(() => {
    fetchUser();
    fetchLinks();
  }, [fetchUser, fetchLinks]);

  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || "",
    bio: user?.bio || "",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-4" />
      </div>
    );
  }

  if (!user) {
    // redirect to login
    window.location.href = "/auth/login";
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((link) => link.id === active.id);
      const newIndex = links.findIndex((link) => link.id === over.id);

      const newLinks = arrayMove(links, oldIndex, newIndex);
      reorderLinks(newLinks);

      toast({
        title: "Success",
        description: "Links reordered successfully!",
      });
    }
  };

  const handleProfileUpdate = () => {
    updateProfile(profileForm);
    toast({
      title: "Success",
      description: "Profile updated successfully!",
    });
  };

  const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);
  const visibleLinks = links.filter((link) => link.is_visible).length;

  return (
    <div className="md:space-y-6 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your links and customize your profile
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Links
                </p>
                <p className="text-2xl font-bold">{links.length}</p>
              </div>
              <LinkIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Visible Links
                </p>
                <p className="text-2xl font-bold">{visibleLinks}</p>
              </div>
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Clicks
                </p>
                <p className="text-2xl font-bold">{totalClicks}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3 pb-16 w-full max-w-full">
        {/* Main Content */}
        <div className="space-y-6 xl:col-span-2 min-w-0">
          {/* Profile Settings */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Settings
              </CardTitle>
              <CardDescription>
                Update your display name and bio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="full_name">Display Name</Label>
                <Input
                  id="full_name"
                  className="w-full"
                  value={profileForm.full_name}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      full_name: e.target.value,
                    })
                  }
                  placeholder="Your display name"
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  className="w-full"
                  value={profileForm.bio || ""}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, bio: e.target.value })
                  }
                  placeholder="Tell visitors about yourself..."
                  rows={3}
                />
              </div>

              <Button onClick={handleProfileUpdate} disabled={updating}>
                {updating ? "Updating..." : "Update Profile"}
              </Button>
            </CardContent>
          </Card>

          {/* Links Management */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Your Links
              </CardTitle>
              <CardDescription>
                Add, edit, and reorder your links. Drag and drop to reorder.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AddLinkDialog />

              {links.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={links.map((link) => link.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {links.map((link) => (
                        <LinkItem key={link.id} link={link} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
                  <LinkIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No links yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Get started by adding your first link
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview Sidebar */}
        <div className="lg:col-span-1 min-w-0">
          <div className="lg:sticky lg:top-6">
            <ProfilePreview />
          </div>
        </div>
      </div>
    </div>
  );
}
