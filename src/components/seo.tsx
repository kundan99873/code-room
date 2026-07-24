import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: "website" | "article";
}

export default function SEO({
  title,
  description,
  keywords,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  ogType = "website",
}: SEOProps) {
  const siteTitle = title 
    ? (title.includes("CodesRoom") ? title : `${title} | CodesRoom`) 
    : "CodesRoom - Real-Time Collaborative Coding & Playgrounds";
  const siteDesc = description || "Collaborate on code in real-time, run programs in 15+ languages, format/minify JSON, and pair program with CodesRoom.";
  const siteKeywords = keywords || "collaborative coding, online compiler, live code editor, pair programming, codesroom, json formatter, codesroom.in";
  
  const siteUrl = ogUrl || (typeof window !== "undefined" ? window.location.origin + window.location.pathname : "https://codesroom.in");
  const defaultOgImage = "https://codesroom.in/og-image.png";

  useEffect(() => {
    // Update document title
    document.title = siteTitle;

    // Helper function to update or create meta tags in head
    const updateMetaTag = (attrName: "name" | "property", attrValue: string, content: string) => {
      let meta = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attrName, attrValue);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    // Update standard search engine metas
    updateMetaTag("name", "description", siteDesc);
    updateMetaTag("name", "keywords", siteKeywords);
    updateMetaTag("name", "robots", "index, follow");

    // Update Canonical URL link tag
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", canonical || siteUrl);

    // Update Open Graph (Facebook/LinkedIn) social metas
    updateMetaTag("property", "og:type", ogType);
    updateMetaTag("property", "og:title", ogTitle || siteTitle);
    updateMetaTag("property", "og:description", ogDescription || siteDesc);
    updateMetaTag("property", "og:url", siteUrl);
    updateMetaTag("property", "og:image", ogImage || defaultOgImage);
    updateMetaTag("property", "og:site_name", "CodesRoom");

    // Update Twitter Cards social metas
    updateMetaTag("name", "twitter:card", "summary_large_image");
    updateMetaTag("name", "twitter:title", ogTitle || siteTitle);
    updateMetaTag("name", "twitter:description", ogDescription || siteDesc);
    updateMetaTag("name", "twitter:url", siteUrl);
    updateMetaTag("name", "twitter:image", ogImage || defaultOgImage);
  }, [
    siteTitle,
    siteDesc,
    siteKeywords,
    canonical,
    siteUrl,
    ogType,
    ogTitle,
    ogDescription,
    ogImage,
    defaultOgImage,
  ]);

  return null;
}
