import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, FileText, MapPinned, ShieldCheck, Truck } from "lucide-react";

import { PublicShell } from "@/components/shells/public-shell";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Truck, title: "Dispatch and load management", text: "Keep loads, assignments, and delivery status organized in one operational view." },
  { icon: ShieldCheck, title: "Compliance visibility", text: "Track fleet documents and deadlines before they become urgent problems." },
  { icon: FileText, title: "Documents and billing", text: "Keep load paperwork connected to the work your team completes." },
  { icon: BarChart3, title: "Operational reporting", text: "See the work in progress and spot issues that need attention." },
];

export default function HomePage() {
  return (
    <PublicShell>
      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <Image src="/landing_hero.png" alt="" fill priority sizes="100vw" className="absolute inset-0 -z-20 object-cover object-center" />
        <div className="absolute inset-0 -z-10 bg-slate-950/75" />
        <div className="mx-auto grid min-h-[36rem] max-w-7xl items-center gap-10 px-6 py-20 lg:grid-cols-2 lg:px-10">
          <div className="max-w-2xl space-y-6">
            <p className="text-sm font-bold tracking-[0.2em] text-sky-300 uppercase">Fleet operations, connected</p>
            <h1 className="text-4xl leading-tight font-black tracking-tight sm:text-5xl lg:text-6xl">Run your fleet with more clarity and less paperwork.</h1>
            <p className="max-w-xl text-lg leading-8 text-slate-200">FleetFusion brings dispatch, compliance, load documents, and day-to-day fleet operations into one workspace built for growing carriers.</p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild><Link href="/sign-up">Get started <ArrowRight className="ml-2 size-4" /></Link></Button>
              <Button size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20" asChild><Link href="/features">Explore features</Link></Button>
            </div>
          </div>
          <div className="relative min-h-64 overflow-hidden rounded-2xl border border-white/20 bg-black/20 shadow-2xl">
            <Image src="/trucksz_splash.png" alt="Commercial trucks on the road" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>
      <section id="features" className="scroll-mt-20 px-6 py-20 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="text-sm font-bold tracking-widest text-primary uppercase">One operational picture</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">The essentials for running a fleet</h2>
            <p className="mt-4 text-lg text-muted-foreground">Reduce tool-hopping and give your office a clearer view of the work moving through your operation.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-xl border bg-card p-6 shadow-sm">
              <Icon className="mb-5 size-8 text-primary" aria-hidden="true" />
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="mt-2 leading-7 text-muted-foreground">{text}</p>
            </article>)}
          </div>
        </div>
      </section>
      <section className="bg-primary px-6 py-16 text-primary-foreground">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div><h2 className="text-3xl font-black">Bring your fleet operations together.</h2><p className="mt-2 max-w-2xl text-primary-foreground/85">See how FleetFusion can support your day-to-day dispatch and compliance work.</p></div>
          <Button size="lg" variant="secondary" asChild><Link href="/sign-up">Get started <ArrowRight className="ml-2 size-4" /></Link></Button>
        </div>
      </section>
    </PublicShell>
  );
}
