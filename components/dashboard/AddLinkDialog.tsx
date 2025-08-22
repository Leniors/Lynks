import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLinksStore } from "@/stores/linksStore";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { availableIcons, IconName, iconOptions } from "@/lib/icons";

export function AddLinkDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    url: "",
    icon: "globe",
    color: "#000000", // default to black
  });

  const { user } = useUserStore();
  const { addLink, addingLink } = useLinksStore();

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.url.trim()) {
      toast({
        title: "Error",
        description: "Title and URL are required.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add a link.",
        variant: "destructive",
      });
      return;
    }

    let url = form.url.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    setLoading(true);

    try {
      await addLink({
        title: form.title,
        url,
        icon: form.icon,
        color: form.color,
        is_visible: true,
        user_id: "",
        is_paid: false
      });

      toast({
        title: "Success",
        description: "Link added successfully!",
      });

      setForm({
        title: "",
        url: "",
        icon: "globe",
        color: "#000000",
      });
      setIsOpen(false);
    } catch (err: unknown) {
      toast({
        title: "Error",
        description:
          typeof err === "object" && err !== null && "message" in err
            ? String((err as { message?: unknown }).message)
            : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add New Link
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Link</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Enter link title"
            />
          </div>

          {/* URL */}
          <div>
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="example.com or https://example.com"
            />
          </div>

          {/* Icon Picker */}
          <div>
            <Label>Icon</Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {iconOptions.map(({ name, value }) => {
                const Icon = availableIcons[value]; // get the component from the map
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setForm({ ...form, icon: value as IconName })
                    }
                    className={cn(
                      "flex items-center justify-center h-10 w-10 rounded-lg border-2 transition-all",
                      form.icon === value
                        ? "border-foreground scale-105"
                        : "border-transparent hover:scale-105"
                    )}
                    title={name}
                  >
                    <Icon
                      className="h-5 w-5"
                      // tint only the selected icon; remove this line if you want all to tint
                      style={{
                        color: form.icon === value ? form.color : undefined,
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <Label htmlFor="iconColor">Icon Color</Label>
            <div className="mt-2 flex items-center gap-4">
              <input
                type="color"
                id="iconColor"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="h-10 w-16 cursor-pointer rounded-md border p-1"
              />

              {/* Live Preview of selected icon + color */}
              {form.icon &&
                (() => {
                  const SelectedIcon =
                    availableIcons[form.icon as IconName] ??
                    availableIcons.Globe;
                  return (
                    <SelectedIcon
                      className="h-6 w-6"
                      style={{ color: form.color }}
                    />
                  );
                })()}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || addingLink}
              className="bg-primary text-white"
            >
              {loading ? "Adding..." : "Add Link"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
