"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchLinks, addLink, deleteLink, updateLink } from "@/lib/actions";
import { Loader, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddLinkSchema } from "@/lib/schemas";


type AddLinkFormValues = z.infer<typeof AddLinkSchema>;

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [links, setLinks] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedUrl, setEditedUrl] = useState("");
  const [editedIcon, setEditedIcon] = useState("");
  const [editedColor, setEditedColor] = useState("#27272a");
  const [linkToDelete, setLinkToDelete] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const editTitleRef = useRef<HTMLInputElement>(null);

  const form = useForm<AddLinkFormValues>({
    resolver: zodResolver(AddLinkSchema),
    mode: "onBlur",
    defaultValues: {
      title: "",
      url: "",
      icon: "",
      color: "#27272a",
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/auth/login");
    }
  }, [userLoading, user]);

  useEffect(() => {
    if (user) {
      fetchLinks(user.userId).then(setLinks);
    }
  }, [user]);

  useEffect(() => {
    if (editingId && editTitleRef.current) {
      editTitleRef.current.focus();
    }
  }, [editingId]);

  const onSubmit = async (data: AddLinkFormValues) => {
    if (!user) return;
    setLoading(true);

    try {
      const newLink = await addLink({
        ...data,
        userId: user.userId,
        order: links.length + 1,
        clicks: 0,
      });

      if (newLink) {
        setLinks((prev) => [...prev, newLink]);
        reset();
        toast.success(" Link added successfully");
      }
    } catch (err) {
      toast.error("Failed to add link.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (id: string) => {
    const updated = await updateLink(id, {
      title: editedTitle,
      url: editedUrl,
      icon: editedIcon,
      color: editedColor,
    });

    if (updated) {
      setLinks((prev) =>
        prev.map((link) =>
          link.$id === id
            ? {
                ...link,
                title: editedTitle,
                url: editedUrl,
                icon: editedIcon,
                color: editedColor,
              }
            : link
        )
      );
      setEditingId(null);
      toast.success(" Link updated");
    }
  };

  const handleResetClicks = async (link: any) => {
    try {
      const updated = await updateLink(link.$id, { clicks: 0 });
      if (updated) {
        setLinks((prev) =>
          prev.map((l) => (l.$id === link.$id ? { ...l, clicks: 0 } : l))
        );
        toast.success("Click count reset!");
      }
    } catch (err) {
      console.error("Failed to reset clicks", err);
      toast.error("Failed to reset count.");
    }
  };

  const handleDelete = async () => {
    if (linkToDelete) {
      const success = await deleteLink(linkToDelete.$id);
      if (success) {
        setLinks((prev) =>
          prev.filter((link) => link.$id !== linkToDelete.$id)
        );
        setLinkToDelete(null);
        toast.success(" Link deleted");
      }
    }
  };

  const handleStartEdit = (link: any) => {
    setEditingId(link.$id);
    setEditedTitle(link.title);
    setEditedUrl(link.url);
    setEditedIcon(link.icon || "");
    setEditedColor(link.color || "#27272a");
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex((link) => link.$id === active.id);
    const newIndex = links.findIndex((link) => link.$id === over.id);
    const reordered = arrayMove(links, oldIndex, newIndex);
    setLinks(reordered);

    for (let i = 0; i < reordered.length; i++) {
      await updateLink(reordered[i].$id, { order: i + 1 });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 pb-15">
      <div className="max-w-sm mx-auto">
        <h1 className="text-2xl font-bold text-blue-400 mb-4">
          Welcome, {user?.name}
        </h1>

        {/* Add Link Form */}
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Link title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Icon (emoji or SVG)" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <input type="color" {...field} className="w-16 h-10" />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center mt-8"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                "Add Link"
              )}
            </Button>
          </form>
        </Form>

        {/* Public Link Section */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
          {/* 🔗 Public Link:
          <code className="ml-1 text-blue-400">
            https://lynks.vercel.app/user/{user?.username}
          </code> */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(
                `https://lynks.vercel.app/user/${user?.username}`
              );
              toast.success("Copied public link to clipboard!");
            }}
            className="ml-2 bg-blue-700 hover:bg-blue-800 text-white text-xs px-2 py-1 rounded"
          >
            🔗 Copy Public Link
          </button>
        </div>

        {/* Reorderable Link List */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={links.map((link) => link.$id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-3 mt-6">
              {links.map((link) => (
                <SortableLinkItem
                  key={link.$id}
                  link={link}
                  editingId={editingId}
                  editTitleRef={editTitleRef}
                  editedTitle={editedTitle}
                  editedUrl={editedUrl}
                  editedIcon={editedIcon}
                  editedColor={editedColor}
                  setEditingId={setEditingId}
                  setEditedTitle={setEditedTitle}
                  setEditedUrl={setEditedUrl}
                  setEditedIcon={setEditedIcon}
                  setEditedColor={setEditedColor}
                  onSave={handleSaveEdit}
                  onDelete={setLinkToDelete}
                  onStartEdit={handleStartEdit}
                  onReset={handleResetClicks}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </div>

      {/* Delete Modal */}
      {linkToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-zinc-900 p-6 rounded-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-4">
              Are you sure you want to delete &quot;{linkToDelete.title}&quot;?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setLinkToDelete(null)}
                className="bg-gray-700 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Drag-and-drop item
function SortableLinkItem({
  link,
  editingId,
  editTitleRef,
  editedTitle,
  editedUrl,
  editedIcon,
  editedColor,
  setEditingId,
  setEditedTitle,
  setEditedUrl,
  setEditedIcon,
  setEditedColor,
  onSave,
  onDelete,
  onStartEdit,
  onReset,
}: any) {
  const { setNodeRef, attributes, listeners, transform, transition } =
    useSortable({ id: link.$id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isEditing = editingId === link.$id;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="bg-zinc-800 pt-2 pb-8 rounded-md relative flex items-start gap-3"
    >
      <button
        {...attributes}
        {...listeners}
        className="hidden md:block cursor-grab text-gray-500 hover:text-white"
        title="Drag to reorder"
      >
        <GripVertical size={18} />
      </button>

      <div className="flex-1">
        {isEditing ? (
          <div className="space-y-2">
            <input
              ref={editTitleRef}
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full px-3 py-1 bg-zinc-700 rounded"
            />
            <input
              type="url"
              value={editedUrl}
              onChange={(e) => setEditedUrl(e.target.value)}
              className="w-full px-3 py-1 bg-zinc-700 rounded"
            />
            <input
              type="text"
              value={editedIcon}
              onChange={(e) => setEditedIcon(e.target.value)}
              className="w-full px-3 py-1 bg-zinc-700 rounded"
            />
            <input
              type="color"
              value={editedColor}
              onChange={(e) => setEditedColor(e.target.value)}
              className="w-16 h-10"
            />
            <div className="absolute bottom-1 right-1 flex gap-2">
              <button
                onClick={() => onSave(link.$id)}
                className="bg-green-600 px-3 py-1 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="bg-gray-600 px-3 py-1 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="ml-2 text-white font-medium">
              {link.icon && <span className="mr-2">{link.icon}</span>}
              {link.title}
            </p>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-400 hover:underline text-sm break-all"
            >
              {link.url}
            </a>

            {link.clicks > 0 && (
              <div className="absolute top-1 right-1">
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-700 hover:bg-zinc-600 transition text-xs text-green-300 border border-zinc-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5 text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M13 16h-1v-4h-1m1-4h.01M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z" />
                  </svg>
                  <span>
                    {link.clicks} {link.clicks === 1 ? "Click" : "Clicks"}
                  </span>
                </div>
              </div>
            )}
            <div className="absolute bottom-1 right-1 flex gap-2">
              <button
                onClick={() => onReset(link)}
                className="text-yellow-400 border border-gray-500 text-xs px-2 py-1 rounded hover:bg-yellow-900"
              >
                Reset Count
              </button>
              <button
                onClick={() => onStartEdit(link)}
                className="text-green-400 border border-gray-500 text-xs px-2 py-1 rounded hover:bg-green-900"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(link)}
                className="text-red-400 border border-gray-500 text-xs px-2 py-1 rounded hover:bg-red-900"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </li>
  );
}
