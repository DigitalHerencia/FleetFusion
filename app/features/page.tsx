import {
  BarChart3,
  FileBarChart2,
  FileText,
  Fuel,
  MapPinned,
  ShieldCheck,
  UserCog,
  Wrench,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function FeaturesPage() {
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
          src="/mountain_bg.png"
          alt="Road leading to mountains"
          width={1200}
          height={800}
          className="h-auto w-full object-cover"
          priority
        />
      </div>

      <main className="relative z-10 flex-1">
        <div className="container mx-auto px-4 py-12 md:px-8">
          <div className="mx-auto mb-30 w-full max-w-2xl">
            <h1 className="mb-6 text-center font-sans text-3xl font-black tracking-tight text-blue-800 uppercase drop-shadow-lg md:text-4xl dark:text-blue-500">
              COMPREHENSIVE FLEET MANAGEMENT FEATURES
            </h1>
            <p className="text-muted-foreground mx-auto mb-20 min-w-xl text-center text-lg leading-relaxed font-bold">
              Everything you need to manage your fleet operations.
            </p>
            {/* Feature cards */}
            <div className="flex flex-col items-center gap-16">
              <div className="flex w-full flex-col items-center rounded-2xl border border-gray-200 bg-black/80 p-10 shadow-2xl backdrop-blur-md transition-transform hover:scale-[1.015]">
                <MapPinned className="mx-auto mb-4 h-10 w-10 rounded-lg bg-blue-100/10 p-1 text-blue-500 drop-shadow-md dark:text-blue-400" />
                <h2 className="mb-2 text-center text-2xl font-extrabold tracking-tight text-blue-500 uppercase">
                  LIVE DISPATCH BOARD
                </h2>
                <p className="text-center text-base leading-relaxed text-zinc-100">
                  Our real-time dispatch board offers a{' '}
                  <span className="font-semibold text-blue-200">drag-and-drop interface</span> for
                  scheduling loads, assigning drivers, and tracking vehicles.{' '}
                  <span className="text-blue-200">Geofenced ETAs</span> and live status updates keep
                  your team and customers informed at every step. The intuitive UI ensures that even
                  new dispatchers can manage complex operations with ease.
                </p>
              </div>
              <div className="flex w-full flex-col items-center rounded-2xl border border-gray-200 bg-black/80 p-10 shadow-2xl backdrop-blur-md transition-transform hover:scale-[1.015]">
                <UserCog className="mx-auto mb-4 h-10 w-10 rounded-lg bg-green-100/10 p-1 text-green-500 drop-shadow-md dark:text-green-400" />
                <h2 className="mb-2 text-center text-2xl font-extrabold tracking-tight text-green-500 uppercase">
                  DRIVER HUB
                </h2>
                <p className="text-center text-base leading-relaxed text-zinc-100">
                  Empower your drivers with a{' '}
                  <span className="font-semibold text-green-200">mobile-friendly hub</span> for
                  ELD-ready HOS logs, DVIR submissions, fuel receipt uploads, and instant document
                  scanning. The streamlined UX minimizes paperwork and maximizes time on the road,
                  while compliance is always just a tap away.
                </p>
              </div>
              <div className="flex w-full flex-col items-center rounded-2xl border border-gray-200 bg-black/80 p-10 shadow-2xl backdrop-blur-md transition-transform hover:scale-[1.015]">
                <ShieldCheck className="mx-auto mb-4 h-10 w-10 rounded-lg bg-yellow-100/10 p-1 text-yellow-500 drop-shadow-md dark:text-yellow-400" />
                <h2 className="mb-2 text-center text-2xl font-extrabold tracking-tight text-yellow-500 uppercase">
                  COMPLIANCE & SAFETY
                </h2>
                <p className="text-center text-base leading-relaxed text-zinc-100">
                  Stay ahead of FMCSA requirements with{' '}
                  <span className="font-semibold text-yellow-200">
                    automated compliance reminders
                  </span>
                  , CSA score monitoring, and instant access to safety snapshots. Our dashboard
                  surfaces critical compliance tasks and deadlines, reducing risk and administrative
                  overhead.
                </p>
              </div>
              <div className="flex w-full flex-col items-center rounded-2xl border border-gray-200 bg-black/80 p-10 shadow-2xl backdrop-blur-md transition-transform hover:scale-[1.015]">
                <Wrench className="mx-auto mb-4 h-10 w-10 rounded-lg bg-orange-100/10 p-1 text-orange-500 drop-shadow-md dark:text-orange-400" />
                <h2 className="mb-2 text-center text-2xl font-extrabold tracking-tight text-orange-500 uppercase">
                  MAINTENANCE TRACKING
                </h2>
                <p className="text-center text-base leading-relaxed text-zinc-100">
                  Track preventive maintenance, work orders, and warranty/recall alerts with a{' '}
                  <span className="font-semibold text-orange-200">visual timeline</span>. The UI
                  makes it easy to schedule service, log repairs, and keep your fleet in peak
                  condition, reducing costly breakdowns and downtime.
                </p>
              </div>
              <div className="flex w-full flex-col items-center rounded-2xl border border-gray-200 bg-black/80 p-10 shadow-2xl backdrop-blur-md transition-transform hover:scale-[1.015]">
                <Fuel className="mx-auto mb-4 h-10 w-10 rounded-lg bg-fuchsia-100/10 p-1 text-fuchsia-500 drop-shadow-md dark:text-fuchsia-400" />
                <h2 className="mb-2 text-center text-2xl font-extrabold tracking-tight text-fuchsia-500 uppercase">
                  IFTA & FUEL TAX
                </h2>
                <p className="text-center text-base leading-relaxed text-zinc-100">
                  Automate jurisdiction mileage tracking and generate quarterly IFTA reports in just
                  a few clicks. The user experience is designed for{' '}
                  <span className="font-semibold text-fuchsia-200">accuracy and speed</span>, saving
                  hours of manual calculation and paperwork each quarter.
                </p>
              </div>
              <div className="flex w-full flex-col items-center rounded-2xl border border-gray-200 bg-black/80 p-10 shadow-2xl backdrop-blur-md transition-transform hover:scale-[1.015]">
                <FileText className="mx-auto mb-4 h-10 w-10 rounded-lg bg-cyan-100/10 p-1 text-cyan-500 drop-shadow-md dark:text-cyan-400" />
                <h2 className="mb-2 text-center text-2xl font-extrabold tracking-tight text-cyan-500 uppercase">
                  BILLING & SETTLEMENTS
                </h2>
                <p className="text-center text-base leading-relaxed text-zinc-100">
                  From rate-confirm to invoice, our billing workflows are{' '}
                  <span className="font-semibold text-cyan-200">seamless and transparent</span>.
                  Driver settlements are calculated automatically, and the UI provides clear
                  visibility into every transaction, reducing disputes and speeding up payments.
                </p>
              </div>
              <div className="flex w-full flex-col items-center rounded-2xl border border-gray-200 bg-black/80 p-10 shadow-2xl backdrop-blur-md transition-transform hover:scale-[1.015]">
                <FileBarChart2 className="mx-auto mb-4 h-10 w-10 rounded-lg bg-rose-100/10 p-1 text-rose-500 drop-shadow-md dark:text-rose-400" />
                <h2 className="mb-2 text-center text-2xl font-extrabold tracking-tight text-rose-500 uppercase">
                  INSURANCE & RISK
                </h2>
                <p className="text-center text-base leading-relaxed text-zinc-100">
                  Manage certificates of insurance, receive expiration alerts, and generate loss-run
                  reports with ease. The insurance vault keeps all your documents organized and
                  accessible, while proactive notifications help you stay compliant and protected.
                </p>
              </div>
              <div className="flex w-full flex-col items-center rounded-2xl border border-gray-200 bg-black/80 p-10 shadow-2xl backdrop-blur-md transition-transform hover:scale-[1.015]">
                <BarChart3 className="mx-auto mb-4 h-10 w-10 rounded-lg bg-indigo-100/10 p-1 text-indigo-500 drop-shadow-md dark:text-indigo-400" />
                <h2 className="mb-2 text-center text-2xl font-extrabold tracking-tight text-indigo-500 uppercase">
                  ANALYTICS STUDIO
                </h2>
                <p className="text-center text-base leading-relaxed text-zinc-100">
                  Unlock insights with customizable dashboards for cost-per-mile, empty-mile
                  percentage, and more. The analytics studio's modern UI makes it easy to visualize
                  trends, identify inefficiencies, and drive smarter decisions across your fleet.
                </p>
              </div>
            </div>
            <div className="mx-auto mt-12 max-w-xl text-center text-sm text-blue-200 drop-shadow-md">
              For a full list of features and integrations, contact{' '}
              <a
                href="mailto:digitalherencia@outlook.com"
                className="underline transition-colors hover:text-blue-400"
              >
                digitalherencia@outlook.com
              </a>
              .
            </div>
          </div>
        </div>
      </main>
      <footer className="bg-background/80 y-2 relative z-10 flex w-full flex-row gap-2 border-gray-200 px-6 py-3 backdrop-blur-sm">
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
