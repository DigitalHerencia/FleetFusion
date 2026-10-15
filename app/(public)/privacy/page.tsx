import Image from "next/image";
import { PrivacyPageTemplate } from "@/components/templates/privacyPageTemplate";

export default function PrivacyPage() {
  return <div className="relative flex min-h-full flex-col bg-background">
    <div className="from-background via-background pointer-events-none absolute inset-0 bg-gradient-to-b to-transparent" />
    <div className="absolute right-0 bottom-0 left-0 z-0"><Image src="/valley_bg.png" alt="Data security visualization" width={1200} height={800} className="h-auto w-full object-cover" priority /></div>
    <div className="relative z-10"><PrivacyPageTemplate /></div>
  </div>;
}
