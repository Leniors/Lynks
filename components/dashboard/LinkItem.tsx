import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  GripVertical,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  BarChart3,
} from "lucide-react";
import { availableIcons, iconOptions, IconName } from "@/lib/icons";
import { UserLink } from "@/types";

interface LinkItemProps {
  link: UserLink;
}

export function LinkItem({ link }: LinkItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: link.title,
    url: link.url,
    icon: link.icon,
    color: link.color || "#3b82f6", // default blue
  });

  const { updateLink, deleteLink, toggleLinkVisibility } = useLinksStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = () => {
    if (!editForm.title.trim() || !editForm.url.trim()) {
      toast({
        title: "Error",
        description: "Title and URL are required.",
        variant: "destructive",
      });
      return;
    }

    updateLink(link.id, editForm);
    setIsEditing(false);
    toast({
      title: "Success",
      description: "Link updated successfully!",
    });
  };

  const handleDelete = () => {
    deleteLink(link.id);
    toast({
      title: "Success",
      description: "Link deleted successfully!",
    });
  };

  const handleToggleVisibility = () => {
    toggleLinkVisibility(link.id);
    toast({
      title: "Success",
      description: `Link ${
        link.is_visible ? "hidden" : "made visible"
      } successfully!`,
    });
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "group transition-all duration-200",
        isDragging && "opacity-50 rotate-2 shadow-lg",
        !link.is_visible && "opacity-60"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
          >
            <GripVertical className="h-4 w-4" />
          </div>

          {/* Link Preview */}
          <div className="flex-1 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg">
              {availableIcons[link.icon as keyof typeof availableIcons] ? (
                React.createElement(
                  availableIcons[link.icon as keyof typeof availableIcons],
                  { className: "h-5 w-5", style: { color: link.color ?? "#3b82f6" } }
                )
              ) : (
                // fallback if it's an emoji or custom string
                <span style={{ color: link.color ?? "#3b82f6" }}>{link.icon}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-medium break-words text-ellipsis line-clamp-1">
                {link.title}
              </h3>
              <p className="text-sm text-muted-foreground break-all text-ellipsis line-clamp-1">
                {link.url}
              </p>
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <BarChart3 className="h-3 w-3" />
              {link.clicks}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 ml-auto sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            {/* Visibility Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleVisibility}
              className="h-8 w-8 p-0 hidden sm:inline-flex"
            >
              {link.is_visible ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>

            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Edit2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-full max-w-lg sm:max-w-xl max-h-screen overflow-y-auto p-6 rounded-lg">
                <DialogHeader>
                  <DialogTitle>Edit Link</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                      placeholder="Enter link title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      value={editForm.url}
                      onChange={(e) =>
                        setEditForm({ ...editForm, url: e.target.value })
                      }
                      placeholder="https://example.com"
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
                              setEditForm({
                                ...editForm,
                                icon: value as IconName,
                              })
                            }
                            className={cn(
                              "flex items-center justify-center h-10 w-10 rounded-lg border-2 transition-all",
                              editForm.icon === value
                                ? "border-foreground scale-105"
                                : "border-transparent hover:scale-105"
                            )}
                            title={name}
                          >
                            <Icon
                              className="h-5 w-5"
                              // tint only the selected icon; remove this line if you want all to tint
                              style={{
                                color:
                                  editForm.icon === value
                                    ? editForm.color
                                    : undefined,
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
                        value={editForm.color}
                        onChange={(e) =>
                          setEditForm({ ...editForm, color: e.target.value })
                        }
                        className="h-10 w-16 cursor-pointer rounded-md border p-1"
                      />

                      {/* Live Preview of selected icon + color */}
                      {editForm.icon &&
                        (() => {
                          const SelectedIcon =
                            availableIcons[editForm.icon as IconName] ??
                            availableIcons.Globe;
                          return (
                            <SelectedIcon
                              className="h-6 w-6"
                              style={{ color: editForm.color }}
                            />
                          );
                        })()}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Delete */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            {/* Open External */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(link.url, "_blank")}
              className="h-8 w-8 p-0 hidden sm:inline-flex"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
