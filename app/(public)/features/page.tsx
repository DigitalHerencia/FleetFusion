import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, FileText, Fuel, MapPinned, ShieldCheck, Truck, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: MapPinned, title: "Dispatch and load board", text: "Organize loads, assignments, pickup and delivery progress, and the information dispatchers need at a glance." },
  { icon: Truck, title: "Driver and vehicle coordination", text: "Connect drivers and equipment to loads and keep the office aligned on assignments." },
  { icon: ShieldCheck, title: "Compliance and safety", text: "Keep key fleet documents visible and make expiration dates easier to track." },
  { icon: Wrench, title: "Maintenance visibility", text: "Keep maintenance-related information accessible alongside day-to-day fleet operations." },
  { icon: Fuel, title: "Fuel and IFTA readiness", text: "Organize fuel and mileage information to support reporting workflows." },
  { icon: FileText, title: "Documents and billing", text: "Keep load paperwork close to the work it supports and reduce administrative handoffs." },
  { icon: BarChart3, title: "Operational reporting", text: "Understand workload, unassigned loads, and delivered work without stitching together separate spreadsheets." },
];

export default function FeaturesPage() {
  return <div>
    <section className="relative isolate overflow-hidden bg-slate-950 px-6 py-20 text-white md:py-28">
      <Image src="/mountain_bg.png" alt="" fill priority sizes="100vw" className="absolute inset-0 -z-20 object-cover" />
      <div className="absolute inset-0 -z-10 bg-slate-950/80" />
      <div className="mx-auto max-w-4xl text-center"><p className="text-sm font-bold tracking-[0.2em] text-sky-300 uppercase">FleetFusion platform</p><h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Tools for the work behind every mile</h1><p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-200">A practical operations workspace for small and growing fleets—from dispatch and equipment to compliance paperwork.</p></div>
    </section>
    <section className="px-6 py-16 md:px-10"><div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-3">{features.map(({icon:Icon,title,text})=><article key={title} className="rounded-xl border bg-card p-6 shadow-sm"><Icon className="mb-4 size-9 text-primary" aria-hidden="true"/><h2 className="text-xl font-bold">{title}</h2><p className="mt-3 leading-7 text-muted-foreground">{text}</p></article>)}</div></section>
    <section className="px-6 pb-20 text-center"><h2 className="text-3xl font-black">Want to see FleetFusion in action?</h2><p className="mx-auto mt-3 max-w-xl text-muted-foreground">Start with the workspace and explore the tools relevant to your operation.</p><Button className="mt-6" asChild><Link href="/sign-up">Get started <ArrowRight className="ml-2 size-4"/></Link></Button></section>
  </div>;
}
