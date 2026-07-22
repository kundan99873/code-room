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
  const siteTitle = title ? `${title} | CodesRoom` : "CodesRoom - Real-Time Collaborative Coding & Playgrounds";
  const siteDesc = description || "Collaborate on code in real-time, run programs in 15+ languages, format/minify JSON, and pair program with CodesRoom.";
  const siteKeywords = keywords || "collaborative coding, online compiler, live code editor, pair programming, codesroom, json formatter, codesroom.in";
  
  // Safe browser check for absolute URL building
  const siteUrl = ogUrl || (typeof window !== "undefined" ? window.location.href : "https://codesroom.in");
  const defaultOgImage = "https://codesroom.in/og-image.png";

  return (
    <>
      {/* Title */}
      <title>{siteTitle}</title>

      {/* Basic Search Meta */}
      <meta name="description" content={siteDesc} />
      <meta name="keywords" content={siteKeywords} />
      <meta name="robots" content="index, follow" />

      {/* Canonical Link */}
      <link rel="canonical" href={canonical || siteUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={ogTitle || siteTitle} />
      <meta property="og:description" content={ogDescription || siteDesc} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:image" content={ogImage || defaultOgImage} />
      <meta property="og:site_name" content="CodesRoom" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle || siteTitle} />
      <meta name="twitter:description" content={ogDescription || siteDesc} />
      <meta name="twitter:url" content={siteUrl} />
      <meta name="twitter:image" content={ogImage || defaultOgImage} />
    </>
  );
}
