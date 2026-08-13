import { Hero } from "@/components/hero";
import { MapExplorer } from "@/features/events/components/map-explorer";
import { FeaturedEvents } from "@/features/events/components/featured-events";
import { HostCta, SiteFooter } from "@/components/host-cta";

export default function Page() {
  return (
    <>
      <Hero />
      <MapExplorer />
      <FeaturedEvents />
      <HostCta />
      <SiteFooter />
    </>
  );
}
