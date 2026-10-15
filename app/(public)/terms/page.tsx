import Image from "next/image";
import { TermsPageTemplate } from "@/components/templates/termsPageTemplate";

export default function TermsPage() {
  return <div className="relative flex min-h-full flex-col bg-background">
    <div className="from-background via-background pointer-events-none absolute inset-0 bg-gradient-to-b to-transparent" />
    <div className="absolute right-0 bottom-0 left-0 z-0"><Image src="/winding_bg.png" alt="Sunset highway with truck silhouette" width={1200} height={800} className="h-auto w-full object-cover" priority /></div>
    <div className="relative z-10"><TermsPageTemplate /></div>
  </div>;
}
