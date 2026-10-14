import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-black">
      {/* Background gradient overlay for fade effect */}
      <div
        className="from-background via-background pointer-events-none absolute inset-0 bg-gradient-to-b to-transparent"
        style={{ zIndex: 0 }}
      />

      {/* Background image positioned at bottom */}
      <div className="absolute right-0 bottom-0 left-0 z-0">
        <Image
          src="/sunset_bg.png"
          alt="Highway with truck"
          width={1200}
          height={800}
          className="h-auto w-full object-cover"
          priority
        />
      </div>

      <main className="relative z-10 container mx-auto flex-1 px-4 py-12 md:px-8">
        <div className="bg-card/90 mx-auto mb-30 w-full max-w-3xl rounded-lg p-6 shadow-md backdrop-blur-sm">
          <h1 className="mb-6 text-center text-3xl font-bold md:text-4xl">🛣️ About Us</h1>
          <section className="space-y-6">
            <div>
              <h2 className="mb-2 text-2xl font-semibold">Our Mission</h2>
              <p>
                At Fleet Fusion, our mission is to empower small and mid-sized trucking and
                logistics companies with cutting-edge, affordable, and easy-to-use Transportation
                Management Software (TMS). We believe technology should accelerate your fleet’s
                success — not complicate it.
              </p>
            </div>
            <div>
              <h2 className="mb-2 text-2xl font-semibold">Who We Are</h2>
              <p>
                Fleet Fusion is proudly based in Anthony, New Mexico — strategically positioned to
                serve fleets across the Southwest and beyond. We are logistics specialists,
                technologists, and passionate innovators committed to building world-class fleet
                management solutions tailored for the SME market.
              </p>
            </div>
            <div>
              <h2 className="mb-2 text-2xl font-semibold">What We Offer</h2>
              <ul className="list-disc space-y-1 pl-6">
                <li>Real-time live dispatch board</li>
                <li>Driver Hubs with full compliance tracking</li>
                <li>Maintenance scheduling and tracking</li>
                <li>IFTA fuel tax reporting</li>
                <li>Comprehensive analytics and reporting</li>
                <li>Billing, settlements, and insurance management</li>
                <li>Secure customer portals and shipment visibility tools</li>
              </ul>
              <p className="mt-2">
                Our flexible plans are designed to grow with your business, from small startups to
                enterprise-level operations.
              </p>
            </div>
            <div>
              <h2 className="mb-2 text-2xl font-semibold">Our Values</h2>
              <ul className="list-disc space-y-1 pl-6">
                <li>Transparency: Clear, simple pricing with no hidden fees.</li>
                <li>Reliability: 99.9% uptime and priority support.</li>
                <li>Innovation: Constantly evolving features powered by user feedback.</li>
                <li>Customer-Centricity: We succeed when you succeed.</li>
              </ul>
            </div>
            <div>
              <h2 className="mb-2 text-2xl font-semibold">Why Fleet Fusion?</h2>
              <ul className="list-disc space-y-1 pl-6">
                <li>Purpose-built for trucking and logistics SMEs</li>
                <li>30-day free trial on all plans</li>
                <li>Dedicated support with every subscription</li>
                <li>Continual upgrades and innovation</li>
              </ul>
              <p className="mt-2">
                Join a growing community of fleet operators who trust Fleet Fusion to manage their
                operations, improve compliance, and boost profitability.
              </p>
            </div>
          </section>
        </div>
      </main>
      <footer className="relative z-10 flex w-full gap-2 bg-black/80 px-6 py-3 backdrop-blur-sm">
        <p className="text-muted-foreground text-xs">© 2025 FleetFusion. All rights reserved.</p>
        <nav className="flex gap-4 sm:ml-auto sm:gap-6">
          <Link className="text-xs underline-offset-4 hover:underline" href="/terms">
            Terms of Service
          </Link>
          <Link className="text-xs underline-offset-4 hover:underline" href="/privacy">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
