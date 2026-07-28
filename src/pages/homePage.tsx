import Features from "@/components/pages/home/features";
import HeroSection from "@/components/pages/home/heroSection";
import LanguageStrip from "@/components/pages/home/languageStrip";
import SEO from "@/components/seo";

export default function HomePage() {
  return (
    <div>
      <SEO 
        title="CodesRoom | Collaborative Code Editor & Compiler"
        description="CodesRoom is a free online collaborative code editor and IDE. Run and execute code instantly in 15+ programming languages, format JSON, and pair program in real-time."
        keywords="collaborative coding, online compiler, live code editor, pair programming, codesroom, json formatter, www.codesroom.in"
      />
      <HeroSection />
      <LanguageStrip />
      <Features />
    </div>
  );
}
