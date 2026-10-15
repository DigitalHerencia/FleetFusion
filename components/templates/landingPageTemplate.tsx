import { HeroSection } from "@/components/blocks/hero-section";
import { FeatureContentGrid } from "@/components/blocks/feature-grid";
import { TestimonialsGrid } from "@/components/blocks/testimonials";
import { CTASimple } from "@/components/blocks/cta-section";
import { landingCopy, pipelineCards } from "@/content/landing";
import Image from "next/image";

export function LandingPageTemplate() {
  return (
    <section>
      <Image
        src="/seperator.png"
        alt={landingCopy.separatorAlt}
        width={1200}
        height={400}
        className="h-auto w-full bg-background"
      />
      <HeroSection.Centered
        title={landingCopy.title}
        titleHighlight={landingCopy.titleHighlight}
        description={landingCopy.description}
        className="y-space-8 mt-12 mb-12 bg-background text-foreground"
        primaryAction={landingCopy.primaryAction}
        secondaryAction={landingCopy.secondaryAction}
      />
      <Image
        src="/logo cloud.png"
        alt={landingCopy.integrationsAlt}
        width={1200}
        height={200}
        className="h-auto w-full"
      />
      <FeatureContentGrid
        id="features"
        title={landingCopy.pipelineTitle}
        items={pipelineCards}
        className="scroll-mt-20 bg-background py-16 text-foreground md:py-24"
      />
      <TestimonialsGrid
        title={landingCopy.testimonialsTitle}
        className="border-y border-foreground/20 bg-primary/10 py-16 text-foreground md:py-24"
        cardClassName="bg-background text-foreground [&_svg]:text-foreground"
        testimonials={landingCopy.testimonials}
      />
      <CTASimple
        title={landingCopy.ctaTitle}
        description={landingCopy.ctaDescription}
        className="bg-background py-38 text-foreground"
        primaryAction={landingCopy.primaryAction}
        secondaryAction={landingCopy.secondaryAction}
      />
      <Image
        src="/seperator.png"
        alt={landingCopy.separatorAlt}
        width={1200}
        height={400}
        className="h-auto w-full bg-background"
      />
    </section>
  );
}
