import { HeroSection } from "@/components/blocks/hero-section";
import { LegalDocumentSection } from "@/components/blocks/legal-document-section";
import { termsCopy } from "@/content/terms";
import Image from "next/image";

export function TermsPageTemplate() {
  return (
    <section>
      <Image
        src="/seperator.png"
        alt={termsCopy.separatorAlt}
        width={1200}
        height={400}
        className="h-auto w-full bg-background"
      />
      <HeroSection.Centered
        title={termsCopy.title}
        titleHighlight={termsCopy.titleHighlight}
        className="mt-8"
      />
      <LegalDocumentSection {...termsCopy} />
      <Image
        src="/seperator.png"
        alt={termsCopy.separatorAlt}
        width={1200}
        height={400}
        className="h-auto w-full bg-background"
      />
    </section>
  );
}
