// Brand + URL constants used by PageMeta and JSON-LD blocks.
// Keep title/description copy here so changes don't require touching every page.

export const SITE_URL = "https://grow-modern-hub.vercel.app";
export const BRAND_NAME = "GreenGrows";
export const DEFAULT_TITLE = "GreenGrows Fertilizers — Premium Agricultural Solutions";
export const DEFAULT_DESCRIPTION =
  "Premium fertilizers engineered for maximum yield and sustainable growth in the Philippines. Science-backed solutions for farmers and agribusinesses.";
export const DEFAULT_OG_IMAGE = "/og-image.jpg";

// Cleaner WhatsApp URL for Organization sameAs — the one in src/components/whatsapp.tsx
// has a pre-filled message query param that's not appropriate for structured data.
export const WHATSAPP_PROFILE_URL = "https://wa.me/639954115063";
export const WHATSAPP_PHONE = "+63 995 411 5063";
export const OWNER_EMAIL = "cyrildave.legaspi@gmail.com";

export const buildCanonical = (path: string) =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export const buildAbsoluteUrl = (relativePath: string) => {
  if (relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
    return relativePath;
  }
  return `${SITE_URL}${relativePath.startsWith("/") ? relativePath : `/${relativePath}`}`;
};
