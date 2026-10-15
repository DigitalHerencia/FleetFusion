import { HeroSection } from "@/components/blocks/hero-section";
import { LegalDocumentSection } from "@/components/blocks/legal-document-section";
import { privacyCopy } from "@/content/privacy";
import Image from "next/image";

export function PrivacyPageTemplate() {
  return (
    <section>
      <Image
        src="/seperator.png"
        alt={privacyCopy.separatorAlt}
        width={1200}
        height={400}
        className="h-auto w-full bg-background"
      />
      <HeroSection.Centered
        title={privacyCopy.title}
        titleHighlight={privacyCopy.titleHighlight}
        className="mt-8"
      />
      <LegalDocumentSection {...privacyCopy} />
      <Image
        src="/seperator.png"
        alt={privacyCopy.separatorAlt}
        width={1200}
        height={400}
        className="h-auto w-full bg-background"
      />
    </section>
  );
}
