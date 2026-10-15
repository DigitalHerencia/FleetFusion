import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, FileText, MapPin, Shield, Truck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingSection } from "@/components/blocks/pricing-section";

export function LandingPageTemplate() {
  return (
    <>
      <main className="flex-1">
        <section className="relative w-full overflow-hidden py-8 sm:py-12 md:py-20 lg:min-h-[600px] lg:py-0 xl:min-h-[700px] 2xl:min-h-[800px]">
          <div className="absolute inset-0 z-0 hidden h-full w-full lg:block">
            <Image src="/landing_hero.png" alt="FleetFusion Hero Background" fill className="object-cover object-right-bottom" priority quality={90} sizes="100vw" />
            <div className="absolute inset-0 bg-black/20" />
          </div>
          <div className="relative z-10 container flex min-h-[400px] items-center px-4 md:px-6 lg:min-h-[600px] xl:min-h-[700px] 2xl:min-h-[800px]">
            <div className="grid w-full gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4 rounded-xl bg-black/70 p-6 pl-6 md:pl-12 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none xl:pl-20">
                <h1 className="text-3xl font-black tracking-wide text-white md:text-4xl">Run Your Fleet Like a Fortune 500 Even if You You Park at Mom &amp; Pop&apos;s</h1>
                <p className="max-w-[600px] font-bold text-white/90 md:text-xl lg:text-muted-foreground">FleetFusion unifies dispatch, compliance, and real-time analytics so you can get freight out the door faster, safer, and smarter.</p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild className="w-full rounded-md bg-blue-500 px-6 py-2 font-semibold text-white hover:bg-blue-800">
                    <Link href="/sign-up">Start Free 30-Day Trial <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center md:hidden">
                <Image alt="Automated Compliance Management" className="border-muted aspect-video overflow-hidden rounded-xl border object-cover object-center shadow-lg" src="/trucksz_splash.png" width={600} height={400} priority />
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-10 sm:py-16 md:py-24 lg:py-32">
          <div className="flex flex-col items-center justify-center space-y-4 px-4 text-center sm:px-6 md:px-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-black tracking-tight text-blue-800 sm:text-4xl md:text-5xl dark:text-blue-500">Comprehensive Fleet Management Features</h2>
              <p className="text-muted-foreground mx-auto max-w-2xl text-base font-bold sm:text-lg md:text-xl">Everything you need to manage your fleet operations efficiently</p>
            </div>
          </div>
          <div className="flex w-full justify-center px-2 sm:px-4 md:px-8">
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 py-8 sm:grid-cols-2 md:py-12 lg:grid-cols-3">
              <FeatureCard icon={<Truck className="mb-2 h-10 w-10 text-blue-500" />} title="Dispatch & Routing">Optimize loads, assign drivers, and track vehicles in real time.</FeatureCard>
              <FeatureCard icon={<Shield className="mb-2 h-10 w-10 text-green-500" />} title="Compliance Automation">Automate document management, HOS, and safety compliance.</FeatureCard>
              <FeatureCard icon={<BarChart3 className="mb-2 h-10 w-10 text-purple-500" />} title="Analytics & Reporting">Gain insights into performance, costs, and utilization.</FeatureCard>
              <FeatureCard icon={<FileText className="mb-2 h-10 w-10 text-yellow-500" />} title="Document Management">Centralize and securely store all fleet and driver documents.</FeatureCard>
              <FeatureCard icon={<MapPin className="mb-2 h-10 w-10 text-red-500" />} title="IFTA Management">Automate IFTA reporting and fuel tax calculations to ensure compliance and save time.</FeatureCard>
              <FeatureCard icon={<Users className="mb-2 h-10 w-10 text-cyan-500" />} title="Team Collaboration">Empower your team with shared schedules, notes, and communication tools.</FeatureCard>
            </div>
          </div>
        </section>
        <PricingSection />
      </main>
    </>
  );
}

function FeatureCard({icon,title,children}:{icon:React.ReactNode;title:string;children:React.ReactNode}) {
  return <div className="flex flex-col items-center space-y-2 rounded-lg border bg-white/80 p-4 shadow-sm dark:bg-black/40">{icon}<h3 className="text-lg font-bold sm:text-xl">{title}</h3><p className="text-muted-foreground text-center text-sm sm:text-base">{children}</p></div>;
}
