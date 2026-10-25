import { useEffect } from "react";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  noindex?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: "website" | "article";
  breadcrumbs?: BreadcrumbItem[];
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const PRIMARY_DOMAIN = "https://codesroom.in";
const DEFAULT_OG_IMAGE = "https://codesroom.in/og-image.png";

export default function SEO({
  title,
  description,
  keywords,
  canonical,
  noindex = false,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  ogType = "website",
  breadcrumbs,
  structuredData,
}: SEOProps) {
  // Normalize pathname without trailing slashes (except root "/")
  let rawPath = typeof window !== "undefined" ? window.location.pathname : "/";
  if (rawPath.length > 1 && rawPath.endsWith("/")) {
    rawPath = rawPath.slice(0, -1);
  }

  const siteTitle = title
    ? title.includes("CodesRoom")
      ? title
      : `${title} | CodesRoom`
    : "CodesRoom | Real-Time Collaborative Code Editor & Online Compiler";

  const siteDesc =
    description ||
    "CodesRoom is a free online collaborative code editor and IDE. Run and execute code instantly in 15+ programming languages, format JSON, and pair program in real-time.";

  const siteKeywords =
    keywords ||
    "collaborative coding, online compiler, live code editor, pair programming, codesroom, json formatter, python online compiler";

  const resolvedCanonical = canonical || `${PRIMARY_DOMAIN}${rawPath === "/" ? "/" : rawPath}`;
  const resolvedOgUrl = ogUrl || resolvedCanonical;
  const resolvedOgImage = ogImage || DEFAULT_OG_IMAGE;

  useEffect(() => {
    // 1. Update Title
    document.title = siteTitle;

    // Helper function to update or create meta tag
    const setMeta = (attr: "name" | "property", value: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${value}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, value);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // 2. Primary Meta Tags
    setMeta("name", "description", siteDesc);
    setMeta("name", "keywords", siteKeywords);
    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");

    // 3. Canonical Tag (Strictly non-www)
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", resolvedCanonical);

    // 4. Open Graph Social Cards
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:title", ogTitle || siteTitle);
    setMeta("property", "og:description", ogDescription || siteDesc);
    setMeta("property", "og:url", resolvedOgUrl);
    setMeta("property", "og:image", resolvedOgImage);
    setMeta("property", "og:image:alt", siteTitle);
    setMeta("property", "og:site_name", "CodesRoom");
    setMeta("property", "og:locale", "en_US");

    // 5. Twitter / X Cards
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", ogTitle || siteTitle);
    setMeta("name", "twitter:description", ogDescription || siteDesc);
    setMeta("name", "twitter:url", resolvedOgUrl);
    setMeta("name", "twitter:image", resolvedOgImage);
    setMeta("name", "twitter:image:alt", siteTitle);

    // 6. Dynamic JSON-LD Structured Data
    const scriptId = "seo-dynamic-jsonld";
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;

    const schemaItems: Array<Record<string, unknown>> = [];

    // Add breadcrumb schema if available
    if (breadcrumbs && breadcrumbs.length > 0) {
      schemaItems.push({
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((b, idx) => ({
          "@type": "ListItem",
          "position": idx + 1,
          "name": b.name,
          "item": b.url.startsWith("http") ? b.url : `${PRIMARY_DOMAIN}${b.url}`,
        })),
      });
    }

    // Add page-specific structured data
    if (structuredData) {
      if (Array.isArray(structuredData)) {
        schemaItems.push(...structuredData);
      } else {
        schemaItems.push(structuredData);
      }
    }

    if (schemaItems.length > 0) {
      if (!scriptEl) {
        scriptEl = document.createElement("script");
        scriptEl.id = scriptId;
        scriptEl.type = "application/ld+json";
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@graph": schemaItems,
      });
    } else if (scriptEl) {
      scriptEl.remove();
    }

    return () => {
      // Cleanup dynamically injected schema on unmount
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [
    siteTitle,
    siteDesc,
    siteKeywords,
    resolvedCanonical,
    resolvedOgUrl,
    resolvedOgImage,
    noindex,
    ogType,
    ogTitle,
    ogDescription,
    breadcrumbs,
    structuredData,
  ]);

  return null;
}

