import { ArrowRight, BarChart3, FileText, MapPin, Shield, Truck, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { PublicNav } from '@/components/navigation/PublicNav';
import PricingSection from '@/components/pricing/pricing-section';
import { SharedFooter } from '@/components/shared/SharedFooter';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <>
      <PublicNav />
      {/* Main content area */}
      <main className="flex-1">
        <section className="relative w-full overflow-hidden py-8 sm:py-12 md:py-20 lg:min-h-[600px] lg:py-0 xl:min-h-[700px] xl:py-0 2xl:min-h-[800px]">
          {/* Background image for large screens */}
          <div className="absolute inset-0 z-0 hidden h-full w-full lg:block">
            <Image
              src="/landing_hero.png"
              alt="FleetFusion Hero Background"
              fill
              className="object-cover object-right-bottom"
              priority
              quality={90}
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
          <div className="relative z-10 container flex min-h-[400px] items-center px-4 md:px-6 lg:min-h-[600px] xl:min-h-[700px] 2xl:min-h-[800px]">
            <div className="grid w-full gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4 rounded-xl bg-black/70 p-6 pl-6 md:pl-12 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none xl:pl-20">
                <h1 className="text-3xl font-black tracking-wide text-white md:text-4xl">
                  Run Your Fleet Like a Fortune 500 Even if You You Park at Mom & Pop's
                </h1>
                <p className="lg:text-muted-foreground max-w-[600px] font-bold text-white/90 md:text-xl">
                  FleetFusion unifies dispatch, compliance, and real-time analytics so you can get
                  freight out the door faster, safer, and smarter.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button
                    asChild
                    className="w-full rounded-md bg-blue-500 px-6 py-2 font-semibold text-white hover:bg-blue-800"
                  >
                    <Link href="/sign-up">
                      Start Free 30-Day Trial <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              {/* Show hero image only on small screens */}
              <div className="flex items-center justify-center md:hidden">
                <Image
                  alt="Automated Compliance Management"
                  className="border-muted aspect-video overflow-hidden rounded-xl border object-cover object-center shadow-lg"
                  src="/trucksz_splash.png"
                  width={600}
                  height={400}
                  priority
                />
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-10 sm:py-16 md:py-24 lg:py-32">
          <div className="flex flex-col items-center justify-center space-y-4 px-4 text-center sm:px-6 md:px-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-black tracking-tight text-blue-800 sm:text-4xl md:text-5xl dark:text-blue-500">
                Comprehensive Fleet Management Features
              </h2>
              <p className="text-muted-foreground mx-auto max-w-2xl text-base font-bold sm:text-lg md:text-xl">
                Everything you need to manage your fleet operations efficiently
              </p>
            </div>
          </div>
          <div className="flex w-full justify-center px-2 sm:px-4 md:px-8">
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 py-8 sm:grid-cols-2 md:py-12 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg border bg-white/80 p-4 shadow-sm dark:bg-black/40">
                <Truck className="mb-2 h-10 w-10 text-blue-500" />
                <h3 className="text-lg font-bold sm:text-xl">Dispatch & Routing</h3>
                <p className="text-muted-foreground text-center text-sm sm:text-base">
                  Optimize loads, assign drivers, and track vehicles in real time.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border bg-white/80 p-4 shadow-sm dark:bg-black/40">
                <Shield className="mb-2 h-10 w-10 text-green-500" />
                <h3 className="text-lg font-bold sm:text-xl">Compliance Automation</h3>
                <p className="text-muted-foreground text-center text-sm sm:text-base">
                  Automate document management, HOS, and safety compliance.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border bg-white/80 p-4 shadow-sm dark:bg-black/40">
                <BarChart3 className="mb-2 h-10 w-10 text-purple-500" />
                <h3 className="text-lg font-bold sm:text-xl">Analytics & Reporting</h3>
                <p className="text-muted-foreground text-center text-sm sm:text-base">
                  Gain insights into performance, costs, and utilization.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border bg-white/80 p-4 shadow-sm dark:bg-black/40">
                <FileText className="mb-2 h-10 w-10 text-yellow-500" />
                <h3 className="text-lg font-bold sm:text-xl">Document Management</h3>
                <p className="text-muted-foreground text-center text-sm sm:text-base">
                  Centralize and securely store all fleet and driver documents.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border bg-white/80 p-4 shadow-sm dark:bg-black/40">
                <MapPin className="mb-2 h-10 w-10 text-red-500" />
                <h3 className="text-lg font-bold sm:text-xl">IFTA Management</h3>
                <p className="text-muted-foreground text-center text-sm sm:text-base">
                  Automate IFTA reporting and fuel tax calculations to ensure compliance and save
                  time.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border bg-white/80 p-4 shadow-sm dark:bg-black/40">
                <Users className="mb-2 h-10 w-10 text-cyan-500" />
                <h3 className="text-lg font-bold sm:text-xl">Team Collaboration</h3>
                <p className="text-muted-foreground text-center text-sm sm:text-base">
                  Empower your team with shared schedules, notes, and communication tools.
                </p>
              </div>
            </div>
          </div>
        </section>
        <PricingSection />
      </main>
      <SharedFooter />
    </>
  );
}
// Ensure all images referenced above exist in /public. For remote images, add their domains to next.config.ts.
