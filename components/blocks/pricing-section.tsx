import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  { name: "Starter", price: "$149", detail: "per month", description: "Core fleet operations for smaller teams", features: ["Dispatch and load management", "Driver and vehicle records", "Compliance document tracking"] },
  { name: "Growth", price: "$349", detail: "per month", description: "More visibility for growing operations", features: ["Everything in Starter", "Expanded operational reporting", "Team workflow support"], featured: true },
  { name: "Enterprise", price: "$15", detail: "per truck / month", description: "Fleet-wide operations at scale", features: ["Everything in Growth", "Per-truck pricing", "Contact for deployment details"] },
] as const;

export function PricingSection({ showTitle = false }: { showTitle?: boolean } = {}) {
  return <section id="pricing" className="border-y bg-muted/20 px-4 py-16 sm:px-6 md:py-24">
    <div className="mx-auto max-w-7xl">
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <p className="text-sm font-bold tracking-widest text-primary uppercase">Straightforward plans</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{showTitle ? "FleetFusion Pricing" : "Plans that grow with your fleet"}</h2>
        <p className="mt-4 text-muted-foreground">Choose the level of fleet operations support that fits your team.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => <article key={plan.name} className={`flex flex-col rounded-xl border bg-card p-6 shadow-sm ${"featured" in plan && plan.featured ? "border-primary ring-2 ring-primary/20" : ""}`}>
          <h3 className="text-xl font-bold">{plan.name}</h3><p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
          <p className="mt-6"><span className="text-4xl font-black">{plan.price}</span><span className="ml-2 text-sm text-muted-foreground">{plan.detail}</span></p>
          <ul className="my-6 flex-1 space-y-3">{plan.features.map((feature) => <li key={feature} className="flex gap-2 text-sm"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{feature}</li>)}</ul>
          <Button asChild className="w-full" variant={"featured" in plan && plan.featured ? "default" : "outline"}><Link href="/sign-up">Start free trial</Link></Button>
        </article>)}
      </div>
    </div>
  </section>;
}

export default PricingSection;
