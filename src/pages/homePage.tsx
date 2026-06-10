import Features from "@/components/pages/home/features";
import HeroSection from "@/components/pages/home/heroSection";
import LanguageStrip from "@/components/pages/home/languageStrip";

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <LanguageStrip />
      <Features />
    </div>
  );
}
