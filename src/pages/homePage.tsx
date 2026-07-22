import Features from "@/components/pages/home/features";
import HeroSection from "@/components/pages/home/heroSection";
import LanguageStrip from "@/components/pages/home/languageStrip";
import SEO from "@/components/seo";

export default function HomePage() {
  return (
    <div>
      <SEO 
        title="CodesRoom - Real-Time Collaborative Coding & Playgrounds"
        description="Collaborate on code in real-time, run programs in 15+ languages, format/minify JSON, and pair program with CodesRoom."
        keywords="collaborative coding, online compiler, live code editor, pair programming, codesroom, json formatter, codesroom.in"
      />
      <HeroSection />
      <LanguageStrip />
      <Features />
    </div>
  );
}
