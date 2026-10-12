import { AudienceSection } from "@/components/home/audience-section";
import { LearningMethod } from "@/components/home/learning-method";
import { StatsStrip } from "@/components/home/stats-strip";
import { FeaturedBooks } from "@/components/books/featured-books";
import { PlatformBanner } from "@/components/layout/platform-banner";

export default function HomePage() {
  return (
    <main className="site-shell" id="contenu-principal">
      <PlatformBanner />
      <StatsStrip />
      <FeaturedBooks />
      <LearningMethod />
      <AudienceSection />
    </main>
  );
}
