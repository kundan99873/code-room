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
  robots?: string;
  schemaType?: "website" | "software" | "none";
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
  robots = "index, follow",
  schemaType = "website",
}: SEOProps) {
  const siteTitle = title 
    ? (title.includes("CodesRoom") ? title : `${title} | CodesRoom`) 
    : "CodesRoom - Real-Time Collaborative Coding & Playgrounds";
  
  const siteDesc = description || "Collaborate on code in real-time, run programs in 15+ languages, format/minify JSON, and pair program with CodesRoom.";
  
  let pathname = typeof window !== "undefined" ? window.location.pathname : "";
  if (pathname && pathname.endsWith("/") && pathname.length > 1) {
    pathname = pathname.slice(0, -1);
  }
  const siteUrl = ogUrl || (typeof window !== "undefined" ? window.location.origin + pathname : "https://www.codesroom.in/");
  const defaultOgImage = "https://www.codesroom.in/og-image.png";

  const resolvedOgImage = ogImage || defaultOgImage;
  const resolvedCanonical = canonical || siteUrl;

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "CodesRoom",
    "url": "https://www.codesroom.in/",
    "description": siteDesc,
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "CodesRoom",
    "url": siteUrl,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "All",
    "description": siteDesc,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  const activeSchema = schemaType === "software" ? softwareSchema : schemaType === "website" ? websiteSchema : null;

  return (
    <>
      {/* React 19 automatically hoists title, meta, and link tags to the document <head> */}
      <title>{siteTitle}</title>
      <meta name="description" content={siteDesc} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robots} />
      <link rel="canonical" href={resolvedCanonical} />
      <link rel="alternate" hrefLang="x-default" href={resolvedCanonical} />
      <link rel="alternate" hrefLang="en" href={resolvedCanonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={ogTitle || siteTitle} />
      <meta property="og:description" content={ogDescription || siteDesc} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:image" content={resolvedOgImage} />
      <meta property="og:site_name" content="CodesRoom" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle || siteTitle} />
      <meta name="twitter:description" content={ogDescription || siteDesc} />
      <meta name="twitter:url" content={siteUrl} />
      <meta name="twitter:image" content={resolvedOgImage} />

      {/* JSON-LD Schema (rendered inline, fully indexed by Google anywhere in body/head) */}
      {activeSchema && (
        <script type="application/ld+json">
          {JSON.stringify(activeSchema)}
        </script>
      )}
    </>
  );
}
