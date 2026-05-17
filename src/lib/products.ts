import { Droplets, Leaf, Sprout } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import organicImage from "@/assets/fertilizer-organic.jpg";
import liquidImage from "@/assets/fertilizer-liquid.jpg";
import specialtyImage from "@/assets/fertilizer-specialty.jpg";
import { supabase } from "@/lib/supabase";
import type {
  Database,
  ProductIconKey,
  ProductImageKey,
} from "@/types/database";

export type Product = Database["public"]["Tables"]["products"]["Row"];

export const PRODUCTS_QUERY_KEY = ["products"] as const;

export const PRODUCT_IMAGE_OPTIONS: Array<{
  value: ProductImageKey;
  label: string;
}> = [
  { value: "organic", label: "Organic texture" },
  { value: "liquid", label: "Liquid solution" },
  { value: "specialty", label: "Specialty blend" },
];

export const PRODUCT_ICON_OPTIONS: Array<{
  value: ProductIconKey;
  label: string;
}> = [
  { value: "leaf", label: "Leaf" },
  { value: "droplets", label: "Droplets" },
  { value: "sprout", label: "Sprout" },
];

const PRODUCT_IMAGE_MAP: Record<ProductImageKey, string> = {
  organic: organicImage,
  liquid: liquidImage,
  specialty: specialtyImage,
};

const PRODUCT_ICON_MAP: Record<ProductIconKey, LucideIcon> = {
  leaf: Leaf,
  droplets: Droplets,
  sprout: Sprout,
};

const FALLBACK_CREATED_AT = "2026-05-15T00:00:00.000Z";

export const fallbackProducts: Product[] = [
  {
    id: "seed-product-001",
    created_at: FALLBACK_CREATED_AT,
    name: "NPK 20-20-20",
    slug: "npk-20-20-20",
    description:
      "Balanced all-purpose fertilizer ideal for general crop nutrition and greenhouse applications.",
    features: [
      "Equal NPK ratio for balanced growth",
      "Water soluble formula",
      "Suitable for all crops",
      "Quick nutrient release",
      "Versatile application methods",
    ],
    npk: "20-20-20",
    application: "Foliar spray or fertigation",
    coverage: "25 lbs per acre",
    price: "$42/bag (25kg)",
    image_key: "specialty",
    icon_key: "sprout",
    sort_order: 10,
    is_featured: true,
    is_active: true,
  },
  {
    id: "seed-product-002",
    created_at: FALLBACK_CREATED_AT,
    name: "Urea (46-0-0)",
    slug: "urea-46-0-0",
    description:
      "High nitrogen fertilizer for rapid vegetative growth and greening of crops.",
    features: [
      "46% nitrogen content",
      "Cost-effective solution",
      "Fast-acting nitrogen source",
      "Increases protein content",
      "Promotes leafy growth",
    ],
    npk: "46-0-0",
    application: "Broadcast or top dressing",
    coverage: "40 lbs per acre",
    price: "$28/bag (50kg)",
    image_key: "organic",
    icon_key: "leaf",
    sort_order: 20,
    is_featured: true,
    is_active: true,
  },
  {
    id: "seed-product-003",
    created_at: FALLBACK_CREATED_AT,
    name: "DAP (18-46-0)",
    slug: "dap-18-46-0",
    description:
      "Diammonium Phosphate for strong root development and early plant establishment.",
    features: [
      "High phosphorus content",
      "Excellent for root growth",
      "Ideal for planting season",
      "Improves seedling vigor",
      "Long-lasting phosphate source",
    ],
    npk: "18-46-0",
    application: "Band or broadcast at planting",
    coverage: "35 lbs per acre",
    price: "$38/bag (50kg)",
    image_key: "specialty",
    icon_key: "sprout",
    sort_order: 30,
    is_featured: true,
    is_active: true,
  },
  {
    id: "seed-product-004",
    created_at: FALLBACK_CREATED_AT,
    name: "Muriate of Potash (0-0-60)",
    slug: "muriate-of-potash-0-0-60",
    description:
      "Premium potassium fertilizer for fruit development and disease resistance.",
    features: [
      "60% potassium content",
      "Enhances fruit quality",
      "Improves stress tolerance",
      "Increases crop yield",
      "Boosts disease resistance",
    ],
    npk: "0-0-60",
    application: "Broadcast or side dressing",
    coverage: "30 lbs per acre",
    price: "$32/bag (50kg)",
    image_key: "liquid",
    icon_key: "droplets",
    sort_order: 40,
    is_featured: false,
    is_active: true,
  },
  {
    id: "seed-product-005",
    created_at: FALLBACK_CREATED_AT,
    name: "Organic Compost Blend",
    slug: "organic-compost-blend",
    description:
      "100% natural organic fertilizer enriched with beneficial microorganisms.",
    features: [
      "100% natural ingredients",
      "Improves soil structure",
      "Rich in organic matter",
      "Slow-release nutrients",
      "Environmentally safe",
    ],
    npk: "5-3-2",
    application: "Broadcast or incorporation",
    coverage: "2 tons per acre",
    price: "$25/bag (40kg)",
    image_key: "organic",
    icon_key: "leaf",
    sort_order: 50,
    is_featured: false,
    is_active: true,
  },
  {
    id: "seed-product-006",
    created_at: FALLBACK_CREATED_AT,
    name: "NPK 15-15-15",
    slug: "npk-15-15-15",
    description:
      "Complete balanced fertilizer for all-season crop nutrition and maintenance.",
    features: [
      "Balanced nutrition profile",
      "Suitable for most crops",
      "Consistent nutrient release",
      "Easy to apply",
      "All-purpose formula",
    ],
    npk: "15-15-15",
    application: "Broadcast or banding",
    coverage: "40 lbs per acre",
    price: "$35/bag (50kg)",
    image_key: "specialty",
    icon_key: "sprout",
    sort_order: 60,
    is_featured: false,
    is_active: true,
  },
  {
    id: "seed-product-007",
    created_at: FALLBACK_CREATED_AT,
    name: "Liquid NPK 10-5-5",
    slug: "liquid-npk-10-5-5",
    description:
      "Fast-acting liquid fertilizer for immediate nutrient uptake and quick results.",
    features: [
      "Instant absorption",
      "Perfect for foliar feeding",
      "Water soluble concentrate",
      "Precise dosing control",
      "Rapid green-up effect",
    ],
    npk: "10-5-5",
    application: "Foliar spray or drip irrigation",
    coverage: "1 liter per 200 sq ft",
    price: "$45/gallon (5L)",
    image_key: "liquid",
    icon_key: "droplets",
    sort_order: 70,
    is_featured: false,
    is_active: true,
  },
  {
    id: "seed-product-008",
    created_at: FALLBACK_CREATED_AT,
    name: "Calcium Nitrate",
    slug: "calcium-nitrate",
    description:
      "Premium calcium and nitrogen source for preventing blossom end rot and calcium deficiency.",
    features: [
      "Dual calcium-nitrogen source",
      "Prevents calcium deficiency",
      "Water soluble",
      "Improves fruit firmness",
      "Reduces plant stress",
    ],
    npk: "15.5-0-0 + 19% Ca",
    application: "Fertigation or foliar spray",
    coverage: "20 lbs per acre",
    price: "$48/bag (25kg)",
    image_key: "organic",
    icon_key: "leaf",
    sort_order: 80,
    is_featured: false,
    is_active: true,
  },
  {
    id: "seed-product-009",
    created_at: FALLBACK_CREATED_AT,
    name: "Micronutrient Mix",
    slug: "micronutrient-mix",
    description:
      "Complete micronutrient blend containing zinc, iron, manganese, and boron.",
    features: [
      "Essential trace elements",
      "Prevents micronutrient deficiency",
      "Chelated for better absorption",
      "Improves crop quality",
      "Compatible with most fertilizers",
    ],
    npk: "Zn, Fe, Mn, B, Cu, Mo",
    application: "Foliar or soil application",
    coverage: "5 lbs per acre",
    price: "$65/bag (10kg)",
    image_key: "specialty",
    icon_key: "sprout",
    sort_order: 90,
    is_featured: false,
    is_active: true,
  },
];

const sortProducts = (products: Product[]) =>
  [...products].sort(
    (left, right) =>
      left.sort_order - right.sort_order ||
      left.created_at.localeCompare(right.created_at),
  );

export const fetchAdminProducts = async () => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return sortProducts(data ?? []);
};

export const fetchPublicProducts = async () => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return sortProducts(fallbackProducts.filter((product) => product.is_active));
  }

  return sortProducts(data ?? []);
};

export const getFeaturedProducts = (products: Product[]) => {
  const activeProducts = sortProducts(
    products.filter((product) => product.is_active),
  );
  const featuredProducts = activeProducts.filter((product) => product.is_featured);

  return (featuredProducts.length > 0 ? featuredProducts : activeProducts).slice(0, 3);
};

export const getProductImageSrc = (imageKey: ProductImageKey) =>
  PRODUCT_IMAGE_MAP[imageKey];

export const getProductIcon = (iconKey: ProductIconKey) =>
  PRODUCT_ICON_MAP[iconKey];

export const getProductImageLabel = (imageKey: ProductImageKey) =>
  PRODUCT_IMAGE_OPTIONS.find((option) => option.value === imageKey)?.label ??
  PRODUCT_IMAGE_OPTIONS[0].label;

export const getProductIconLabel = (iconKey: ProductIconKey) =>
  PRODUCT_ICON_OPTIONS.find((option) => option.value === iconKey)?.label ??
  PRODUCT_ICON_OPTIONS[0].label;

export const parseFeatureLines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

export const formatFeaturesForTextarea = (features: string[]) =>
  features.join("\n");

export const slugifyProductName = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
