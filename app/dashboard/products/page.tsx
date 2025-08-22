"use client";

import React from "react";
import { Helmet } from "react-helmet-async";
import { useToast } from "@/hooks/use-toast";
import { useProductsStore } from "@/stores/productsStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Upload,
  CheckCircle2,
  Package,
  PlusCircle,
  MoreHorizontal,
  Edit,
  EyeOff,
  Eye,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserStore } from "@/stores/userStore";

function formatPrice(cents: number, currency: "usd" | "eur" | "gbp") {
  const map: Record<string, string> = { usd: "USD", eur: "EUR", gbp: "GBP" };
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: map[currency],
    }).format((cents || 0) / 100);
  } catch {
    return `$${(cents || 0) / 100}`;
  }
}

export default function ProductsPage() {
  const { toast } = useToast();
  const { user } = useUserStore(); // ✅ logged in user
  const { products, addProduct, deleteProduct, togglePublished, fetchProducts } =
    useProductsStore();

  const [name, setName] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [currency, setCurrency] = React.useState<"usd" | "eur" | "gbp">("usd");
  const [description, setDescription] = React.useState("");
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [published, setPublished] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // ✅ Fetch products on mount
  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ✅ Add product
  const onAdd = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a product name.",
        variant: "destructive",
      });
      return;
    }

    const n = Number(price);
    if (!Number.isFinite(n) || n <= 0) {
      toast({
        title: "Invalid price",
        description: "Enter a positive price (e.g., 12.99).",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Not logged in",
        description: "You must be logged in to add products.",
        variant: "destructive",
      });
      return;
    }

    const newProduct = await addProduct({
      name: name.trim(),
      description: description.trim() || undefined,
      price: n,
      currency,
      published,
      imageFile, // ✅ pass file here
    });

    if (newProduct) {
      setDialogOpen(false);
      toast({
        title: "Product added",
        description: `${newProduct.name} is ${
          newProduct.published ? "published" : "draft"
        }.`,
      });

      setName("");
      setPrice("");
      setDescription("");
      setImageFile(null);
      setPublished(true);
    } else {
      toast({
        title: "Error",
        description: "Could not add product. Please try again.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  // ✅ Delete product
  const onDelete = async (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;

    if (confirm(`Delete ${prod.name}? This cannot be undone.`)) {
      try {
        await deleteProduct(id);
        toast({ title: "Deleted", description: `${prod.name} was removed.` });
      } catch (err) {
        console.error("Delete failed:", err);
        toast({
          title: "Error",
          description: "Failed to delete product.",
          variant: "destructive",
        });
      }
    }
  };

  const pageTitle = "Products – Add & Manage | Lynx";
  const metaDescription =
    "Add products to sell, manage pricing, and publish to your profile.";
  const canonicalUrl =
    typeof window !== "undefined"
      ? window.location.href
      : "/dashboard/products";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Products",
    url: canonicalUrl,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: canonicalUrl,
        name: p.name,
      })),
    },
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <p className="text-muted-foreground">
          Create and manage the items you sell.
        </p>
      </header>
      <main className="mb-16 p-0 container md:space-y-6 md:py-10">
        {/* Header with Add Product button */}
        <header className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
            <p className="text-muted-foreground">
              Create and manage the items you sell.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl px-4 py-2 shadow-sm hover:shadow-md transition" onClick={() => setDialogOpen(true)}>
                <PlusCircle className="h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto rounded-2xl p-7">
              <DialogHeader className="space-y-1 sticky top-0 bg-background z-10 pb-4">
                <DialogTitle className="text-xl font-semibold">
                  Add a New Product
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Fill in the details below. You can always edit later.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={onAdd} className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Premium Guide"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    A clear, concise name works best.
                  </p>
                </div>

                {/* Price + Currency */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      inputMode="decimal"
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="19.99"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={currency}
                      onValueChange={(v) => setCurrency(v as "usd" | "eur" | "gbp")}
                    >
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">USD</SelectItem>
                        <SelectItem value="eur">EUR</SelectItem>
                        <SelectItem value="gbp">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="imageFile">Product Image</Label>
                  <div
                    className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/30 transition"
                    onClick={() =>
                      document.getElementById("imageFile")?.click()
                    }
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt={`${name || "Product"} preview`}
                        className="h-40 w-full object-cover rounded-md border"
                      />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload or drag & drop
                        </p>
                      </>
                    )}
                  </div>
                  <Input
                    id="imageFile"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        setPreviewUrl(URL.createObjectURL(file));
                      }
                    }}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What makes this product great?"
                  />
                  <p className="text-xs text-muted-foreground">
                    Highlight features and benefits.
                  </p>
                </div>

                {/* Publish toggle */}
                <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="published"
                      className="cursor-pointer font-medium"
                    >
                      Publish
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Make the product visible on your profile.
                    </p>
                  </div>
                  <Switch
                    id="published"
                    checked={published}
                    onCheckedChange={setPublished}
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="gap-2 rounded-lg px-5 py-2 font-medium shadow hover:shadow-md transition"
                    disabled={loading}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {loading ? "Adding..." : "Add Product"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {/* Main Products list section */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" /> Your Products
              </CardTitle>
              <CardDescription>
                Manage pricing and publication status.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              {products.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No products yet. Click &quot;Add Product&quot; to create your
                  first one.
                </p>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="relative w-full overflow-x-auto rounded-lg border hidden md:block">
                    <Table className="min-w-[700px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {p.imageUrl ? (
                                  <img
                                    src={p.imageUrl}
                                    alt={p.name}
                                    className="h-10 w-10 rounded object-cover border"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded bg-muted" />
                                )}
                                <div>
                                  <div className="font-medium leading-none">
                                    {p.name}
                                  </div>
                                  {p.description && (
                                    <div className="text-xs text-muted-foreground line-clamp-1">
                                      {p.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {formatPrice(p.price, p.currency)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={p.published ? "default" : "secondary"}
                              >
                                {p.published ? "Published" : "Draft"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {new Date(p.createdAt).toLocaleDateString()}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                  >
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => togglePublished(p.id)}
                                  >
                                    {p.published ? (
                                      <>
                                        <EyeOff className="mr-2 h-4 w-4" />{" "}
                                        Unpublish
                                      </>
                                    ) : (
                                      <>
                                        <Eye className="mr-2 h-4 w-4" /> Publish
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => onDelete(p.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card List */}
                  <div className="space-y-4 md:hidden">
                    {products.map((p) => (
                      <div
                        key={p.id}
                        className="rounded-lg border p-4 flex flex-col gap-3 bg-background shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="h-12 w-12 rounded object-cover border"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded bg-muted" />
                          )}
                          <div>
                            <div className="font-medium">{p.name}</div>
                            {p.description && (
                              <div className="text-xs text-muted-foreground line-clamp-1">
                                {p.description}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>{formatPrice(p.price, p.currency)}</span>
                          <Badge
                            variant={p.published ? "default" : "secondary"}
                          >
                            {p.published ? "Published" : "Draft"}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Created: {new Date(p.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            className="flex-1"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              togglePublished(p.id);
                              toast({
                                title: p.published
                                  ? "Moved to draft"
                                  : "Published",
                                description: p.name,
                              });
                            }}
                          >
                            {p.published ? "Unpublish" : "Publish"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDelete(p.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify(structuredData)}
      </script>
    </>
  );
}
