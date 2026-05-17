import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Filter,
  MoreVertical,
  Package,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  fetchAdminProducts,
  formatFeaturesForTextarea,
  getProductIcon,
  getProductIconLabel,
  getProductImageLabel,
  getProductImageSrc,
  parseFeatureLines,
  PRODUCT_ICON_OPTIONS,
  PRODUCT_IMAGE_OPTIONS,
  PRODUCTS_QUERY_KEY,
  slugifyProductName,
} from "@/lib/products";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/types/database";

type Product = Database["public"]["Tables"]["products"]["Row"];
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(160, "Slug is too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and hyphens only",
    ),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(500, "Description is too long"),
  featuresText: z
    .string()
    .trim()
    .min(1, "At least one feature is required")
    .refine(
      (value) => parseFeatureLines(value).length > 0,
      "At least one feature is required",
    ),
  npk: z.string().trim().min(1, "NPK ratio is required").max(100, "NPK ratio is too long"),
  application: z
    .string()
    .trim()
    .min(1, "Application details are required")
    .max(200, "Application details are too long"),
  coverage: z.string().trim().min(1, "Coverage is required").max(200, "Coverage is too long"),
  price: z.string().trim().min(1, "Price is required").max(100, "Price is too long"),
  image_key: z.enum(["organic", "liquid", "specialty"]),
  icon_key: z.enum(["leaf", "droplets", "sprout"]),
  sort_order: z.coerce
    .number()
    .int("Sort order must be a whole number")
    .min(0, "Sort order must be 0 or higher")
    .max(9999, "Sort order is too large"),
  is_featured: z.boolean(),
  is_active: z.boolean(),
});

type ProductFormValues = z.infer<typeof productSchema>;

const DEFAULT_PRODUCT_FORM_VALUES: ProductFormValues = {
  name: "",
  slug: "",
  description: "",
  featuresText: "",
  npk: "",
  application: "",
  coverage: "",
  price: "",
  image_key: "specialty",
  icon_key: "sprout",
  sort_order: 0,
  is_featured: false,
  is_active: true,
};

type ProductFilter = "all" | "active" | "featured" | "hidden";

const getFormValues = (product: Product): ProductFormValues => ({
  name: product.name,
  slug: product.slug,
  description: product.description,
  featuresText: formatFeaturesForTextarea(product.features),
  npk: product.npk,
  application: product.application,
  coverage: product.coverage,
  price: product.price,
  image_key: product.image_key,
  icon_key: product.icon_key,
  sort_order: product.sort_order,
  is_featured: product.is_featured,
  is_active: product.is_active,
});

const toProductPayload = (
  values: ProductFormValues,
): ProductInsert & ProductUpdate => ({
  name: values.name.trim(),
  slug: values.slug.trim(),
  description: values.description.trim(),
  features: parseFeatureLines(values.featuresText),
  npk: values.npk.trim(),
  application: values.application.trim(),
  coverage: values.coverage.trim(),
  price: values.price.trim(),
  image_key: values.image_key,
  icon_key: values.icon_key,
  sort_order: values.sort_order,
  is_featured: values.is_featured,
  is_active: values.is_active,
});

export const ProductsPanel = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<ProductFilter>("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: DEFAULT_PRODUCT_FORM_VALUES,
  });

  const { data: products, isLoading, isError } = useQuery<Product[]>({
    queryKey: [...PRODUCTS_QUERY_KEY, "admin"],
    queryFn: fetchAdminProducts,
  });

  const saveMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const payload = toProductPayload(values);

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingProduct.id);
        if (error) throw error;
        return "updated" as const;
      }

      const { error } = await supabase.from("products").insert(payload);
      if (error) throw error;
      return "created" as const;
    },
    onSuccess: (action) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      toast({
        title: action === "created" ? "Product added" : "Product updated",
      });
      setIsEditorOpen(false);
      setEditingProduct(null);
      form.reset(DEFAULT_PRODUCT_FORM_VALUES);
    },
    onError: (error: { message?: string }) => {
      toast({
        title: editingProduct ? "Failed to update product" : "Failed to add product",
        description: error.message || "Try again or check your connection.",
        variant: "destructive",
      });
    },
  });

  const patchMutation = useMutation({
    mutationFn: async ({
      id,
      patch,
      successTitle,
    }: {
      id: string;
      patch: ProductUpdate;
      successTitle: string;
    }) => {
      const { error } = await supabase.from("products").update(patch).eq("id", id);
      if (error) throw error;
      return successTitle;
    },
    onSuccess: (title) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      toast({ title });
    },
    onError: (error: { message?: string }) => {
      toast({
        title: "Failed to update product",
        description: error.message || "Try again or check your connection.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      toast({ title: "Product deleted" });
    },
    onError: (error: { message?: string }) => {
      toast({
        title: "Failed to delete product",
        description: error.message || "Try again or check your connection.",
        variant: "destructive",
      });
    },
  });

  const filteredProducts = (products ?? []).filter((product) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      product.name.toLowerCase().includes(term) ||
      product.slug.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term) ||
      product.npk.toLowerCase().includes(term) ||
      product.price.toLowerCase().includes(term);

    const matchesFilter =
      filter === "all" ||
      (filter === "active" && product.is_active) ||
      (filter === "featured" && product.is_featured) ||
      (filter === "hidden" && !product.is_active);

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: products?.length ?? 0,
    active: products?.filter((product) => product.is_active).length ?? 0,
    featured: products?.filter((product) => product.is_featured).length ?? 0,
    hidden: products?.filter((product) => !product.is_active).length ?? 0,
  };

  const openCreateDialog = () => {
    setEditingProduct(null);
    form.reset(DEFAULT_PRODUCT_FORM_VALUES);
    setIsEditorOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    form.reset(getFormValues(product));
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditingProduct(null);
    form.reset(DEFAULT_PRODUCT_FORM_VALUES);
  };

  return (
    <div>
      {isError && (
        <Card className="mb-6 border-destructive/40">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Failed to load products</p>
              <p className="text-sm text-muted-foreground">
                Apply the latest Supabase migration and refresh the page.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {(
          [
            { value: "all", label: "All Products", count: stats.total, icon: <Package className="h-4 w-4" />, accent: "" },
            { value: "active", label: "Visible", count: stats.active, icon: <Eye className="h-4 w-4" />, accent: "text-green-600" },
            { value: "featured", label: "Featured", count: stats.featured, icon: <Star className="h-4 w-4" />, accent: "text-amber-600" },
            { value: "hidden", label: "Hidden", count: stats.hidden, icon: <EyeOff className="h-4 w-4" />, accent: "text-gray-600" },
          ] as const
        ).map(({ value, label, count, icon, accent }) => {
          const isActive = filter === value;
          return (
            <Card
              key={value}
              role="button"
              tabIndex={0}
              aria-pressed={isActive}
              onClick={() => setFilter(value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setFilter(value);
                }
              }}
              className={`cursor-pointer transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isActive ? "ring-2 ring-primary shadow-md" : ""
              }`}
            >
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  {icon}
                  {label}
                </CardDescription>
                <CardTitle className={`text-3xl ${accent}`}>{count}</CardTitle>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product name, slug, description, NPK, or price..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter: {filter === "all" ? "All" : filter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilter("all")}>All Products</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("active")}>Visible</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("featured")}>Featured</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("hidden")}>Hidden</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button className="gap-2" onClick={openCreateDialog}>
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {isLoading ? (
          [0, 1, 2].map((index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-8 w-48 bg-muted rounded" />
                  <div className="h-20 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {products && products.length === 0
                ? "No products yet. Add your first product to publish the catalog."
                : "No products match your filters."}
            </CardContent>
          </Card>
        ) : (
          filteredProducts.map((product) => {
            const ProductIcon = getProductIcon(product.icon_key);

            return (
              <Card key={product.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4 justify-between">
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <img
                          src={getProductImageSrc(product.image_key)}
                          alt={product.name}
                          className="h-28 w-full sm:w-36 rounded-lg object-cover border"
                        />
                        <div className="space-y-3 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">#{product.sort_order}</Badge>
                            <Badge variant="outline" className="gap-1">
                              <ProductIcon className="h-3 w-3" />
                              {getProductIconLabel(product.icon_key)}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={
                                product.is_active
                                  ? "border-green-300 text-green-700 bg-green-500/10"
                                  : "border-gray-300 text-gray-700 bg-gray-500/10"
                              }
                            >
                              {product.is_active ? "Visible" : "Hidden"}
                            </Badge>
                            {product.is_featured && (
                              <Badge
                                variant="outline"
                                className="border-amber-300 text-amber-700 bg-amber-500/10"
                              >
                                Featured on homepage
                              </Badge>
                            )}
                          </div>

                          <div>
                            <h3 className="text-2xl font-semibold">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">/{product.slug}</p>
                          </div>

                          <p className="text-sm text-muted-foreground">{product.description}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 text-sm">
                        <div className="rounded-md bg-muted/40 p-3">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Price</p>
                          <p className="font-medium">{product.price}</p>
                        </div>
                        <div className="rounded-md bg-muted/40 p-3">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">NPK Ratio</p>
                          <p className="font-medium">{product.npk}</p>
                        </div>
                        <div className="rounded-md bg-muted/40 p-3">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Coverage</p>
                          <p className="font-medium">{product.coverage}</p>
                        </div>
                        <div className="rounded-md bg-muted/40 p-3">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Image Style</p>
                          <p className="font-medium">{getProductImageLabel(product.image_key)}</p>
                        </div>
                      </div>

                      <div className="rounded-md bg-muted/50 p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Application</p>
                        <p className="text-sm">{product.application}</p>
                      </div>

                      <div className="rounded-md bg-muted/50 p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Key Features</p>
                        <p className="text-sm text-muted-foreground">
                          {product.features.join(" • ")}
                        </p>
                      </div>
                    </div>

                    <div className="flex lg:flex-col gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 lg:flex-none lg:w-28"
                        onClick={() => openEditDialog(product)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(product)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={patchMutation.isPending}
                            onClick={() =>
                              patchMutation.mutate({
                                id: product.id,
                                patch: { is_featured: !product.is_featured },
                                successTitle: product.is_featured
                                  ? "Removed from homepage"
                                  : "Featured on homepage",
                              })
                            }
                          >
                            <Star className="h-4 w-4 mr-2" />
                            {product.is_featured
                              ? "Remove from Homepage"
                              : "Feature on Homepage"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={patchMutation.isPending}
                            onClick={() =>
                              patchMutation.mutate({
                                id: product.id,
                                patch: { is_active: !product.is_active },
                                successTitle: product.is_active
                                  ? "Product hidden"
                                  : "Product published",
                              })
                            }
                          >
                            {product.is_active ? (
                              <EyeOff className="h-4 w-4 mr-2" />
                            ) : (
                              <Eye className="h-4 w-4 mr-2" />
                            )}
                            {product.is_active ? "Hide from Website" : "Publish Product"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            disabled={deleteMutation.isPending}
                            onClick={() => deleteMutation.mutate(product.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Dialog
        open={isEditorOpen}
        onOpenChange={(open) => {
          setIsEditorOpen(open);
          if (!open) {
            closeEditor();
          }
        }}
      >
        <DialogContent className="sm:max-w-[760px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? `Edit ${editingProduct.name}` : "Add Product"}
            </DialogTitle>
            <DialogDescription>
              Changes here update both the homepage teaser and the full products page.
              Images and icons use the built-in catalog styles for now.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
              className="space-y-4"
              noValidate
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="NPK 20-20-20"
                          {...field}
                          onBlur={(event) => {
                            field.onBlur();
                            const currentSlug = form.getValues("slug").trim();
                            if (!currentSlug) {
                              form.setValue(
                                "slug",
                                slugifyProductName(event.target.value),
                                { shouldValidate: true },
                              );
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="npk-20-20-20" {...field} />
                      </FormControl>
                      <FormDescription>
                        Used for admin-friendly product IDs and future URLs.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input placeholder="$42/bag (25kg)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sort_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="npk"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NPK Ratio</FormLabel>
                      <FormControl>
                        <Input placeholder="20-20-20" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="coverage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coverage</FormLabel>
                      <FormControl>
                        <Input placeholder="25 lbs per acre" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="application"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application</FormLabel>
                    <FormControl>
                      <Input placeholder="Foliar spray or fertigation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[110px]"
                        placeholder="Balanced all-purpose fertilizer ideal for general crop nutrition..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="featuresText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Features</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[150px]"
                        placeholder={"One feature per line\nWater soluble formula\nQuick nutrient release"}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter one feature per line. The site will automatically format them as a list.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="image_key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image Style</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose an image style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PRODUCT_IMAGE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="icon_key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose an icon" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PRODUCT_ICON_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="is_featured"
                  render={({ field }) => (
                    <FormItem className="rounded-lg border p-4 flex flex-row items-center justify-between space-y-0">
                      <div className="space-y-1">
                        <FormLabel>Featured on homepage</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Show this product in the homepage product teaser.
                        </p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="rounded-lg border p-4 flex flex-row items-center justify-between space-y-0">
                      <div className="space-y-1">
                        <FormLabel>Visible on website</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Hidden products stay in admin but disappear from the public catalog.
                        </p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeEditor}
                  disabled={saveMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending
                    ? "Saving..."
                    : editingProduct
                      ? "Save Changes"
                      : "Create Product"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
