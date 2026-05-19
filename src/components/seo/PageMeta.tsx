import { Helmet } from "react-helmet-async";
import {
  BRAND_NAME,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  buildAbsoluteUrl,
  buildCanonical,
} from "@/lib/seo";

type PageMetaProps = {
  path: string;
  title?: string;
  description?: string;
  image?: string;
  noindex?: boolean;
  type?: "website" | "article";
  children?: React.ReactNode;
};

export const PageMeta = ({
  path,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_OG_IMAGE,
  noindex = false,
  type = "website",
  children,
}: PageMetaProps) => {
  const canonical = buildCanonical(path);
  const absoluteImage = buildAbsoluteUrl(image);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {noindex && <meta name="robots" content="noindex,nofollow" />}

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:site_name" content={BRAND_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />

      {children}
    </Helmet>
  );
};
