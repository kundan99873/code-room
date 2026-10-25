import Features from "@/components/pages/home/features";
import HeroSection from "@/components/pages/home/heroSection";
import LanguageStrip from "@/components/pages/home/languageStrip";
import SEO from "@/components/seo";

export default function HomePage() {
  return (
    <div>
      <SEO
        title="CodesRoom | Real-Time Collaborative Code Editor & Online Compiler"
        description="CodesRoom is a free online collaborative code editor and IDE. Run and execute code instantly in 15+ programming languages, format JSON, and pair program in real-time."
        keywords="collaborative code editor, online compiler, python online compiler, javascript runner, live code editor, pair programming, free cloud IDE, codesroom"
        canonical="https://codesroom.in/"
        structuredData={[
          {
            "@type": "SoftwareApplication",
            "name": "CodesRoom",
            "url": "https://codesroom.in/",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "All",
            "description": "A modern online IDE for real-time collaborative coding, instant code execution in 15+ languages, a JSON toolkit, and pair programming rooms.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          }
        ]}
      />
      <HeroSection />
      <LanguageStrip />
      <Features />
    </div>
  );
}
