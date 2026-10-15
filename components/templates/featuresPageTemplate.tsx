import { BarChart3, FileBarChart2, FileText, Fuel, MapPinned, ShieldCheck, UserCog, Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const features = [
  { icon: MapPinned, iconClass: "text-blue-500", titleClass: "text-blue-500", title: "LIVE DISPATCH BOARD", text: <>Our real-time dispatch board offers a <strong className="text-blue-200">drag-and-drop interface</strong> for scheduling loads, assigning drivers, and tracking vehicles. <span className="text-blue-200">Geofenced ETAs</span> and live status updates keep your team and customers informed at every step. The intuitive UI ensures that even new dispatchers can manage complex operations with ease.</> },
  { icon: UserCog, iconClass: "text-green-500", titleClass: "text-green-500", title: "DRIVER HUB", text: <>Empower your drivers with a <strong className="text-green-200">mobile-friendly hub</strong> for ELD-ready HOS logs, DVIR submissions, fuel receipt uploads, and instant document scanning. The streamlined UX minimizes paperwork and maximizes time on the road, while compliance is always just a tap away.</> },
  { icon: ShieldCheck, iconClass: "text-yellow-500", titleClass: "text-yellow-500", title: "COMPLIANCE & SAFETY", text: <>Stay ahead of FMCSA requirements with <strong className="text-yellow-200">automated compliance reminders</strong>, CSA score monitoring, and instant access to safety snapshots. Our dashboard surfaces critical compliance tasks and deadlines, reducing risk and administrative overhead.</> },
  { icon: Wrench, iconClass: "text-orange-500", titleClass: "text-orange-500", title: "MAINTENANCE TRACKING", text: <>Track preventive maintenance, work orders, and warranty/recall alerts with a <strong className="text-orange-200">visual timeline</strong>. The UI makes it easy to schedule service, log repairs, and keep your fleet in peak condition, reducing costly breakdowns and downtime.</> },
  { icon: Fuel, iconClass: "text-fuchsia-500", titleClass: "text-fuchsia-500", title: "IFTA & FUEL TAX", text: <>Automate jurisdiction mileage tracking and generate quarterly IFTA reports in just a few clicks. The user experience is designed for <strong className="text-fuchsia-200">accuracy and speed</strong>, saving hours of manual calculation and paperwork each quarter.</> },
  { icon: FileText, iconClass: "text-cyan-500", titleClass: "text-cyan-500", title: "BILLING & SETTLEMENTS", text: <>From rate-confirm to invoice, our billing workflows are <strong className="text-cyan-200">seamless and transparent</strong>. Driver settlements are calculated automatically, and the UI provides clear visibility into every transaction, reducing disputes and speeding up payments.</> },
  { icon: FileBarChart2, iconClass: "text-rose-500", titleClass: "text-rose-500", title: "INSURANCE & RISK", text: <>Manage certificates of insurance, receive expiration alerts, and generate loss-run reports with ease. The insurance vault keeps all your documents organized and accessible, while proactive notifications help you stay compliant and protected.</> },
  { icon: BarChart3, iconClass: "text-indigo-500", titleClass: "text-indigo-500", title: "ANALYTICS STUDIO", text: <>Unlock insights with customizable dashboards for cost-per-mile, empty-mile percentage, and more. The analytics studio's modern UI makes it easy to visualize trends, identify inefficiencies, and drive smarter decisions across your fleet.</> },
] as const;

export function FeaturesPageTemplate() {
  return <div className="relative flex-1 overflow-hidden bg-black">
    <div className="from-background via-background pointer-events-none absolute inset-0 bg-gradient-to-b to-transparent" />
    <div className="absolute right-0 bottom-0 left-0 z-0"><Image src="/mountain_bg.png" alt="Road leading to mountains" width={1200} height={800} className="h-auto w-full object-cover" priority /></div>
    <div className="relative z-10 container mx-auto px-4 py-12 md:px-8">
      <div className="mx-auto mb-20 w-full max-w-3xl">
        <h1 className="mb-6 text-center text-3xl font-black tracking-tight text-blue-800 uppercase drop-shadow-lg md:text-4xl dark:text-blue-500">COMPREHENSIVE FLEET MANAGEMENT FEATURES</h1>
        <p className="text-muted-foreground mx-auto mb-16 text-center text-lg leading-relaxed font-bold">Everything you need to manage your fleet operations.</p>
        <div className="flex flex-col items-center gap-12">
          {features.map(({icon:Icon,iconClass,titleClass,title,text}) => <article key={title} className="flex w-full flex-col items-center rounded-2xl border border-gray-200 bg-black/80 p-8 shadow-2xl backdrop-blur-md transition-transform hover:scale-[1.015] md:p-10">
            <Icon className={`mx-auto mb-4 h-10 w-10 rounded-lg bg-white/5 p-1 drop-shadow-md ${iconClass}`} aria-hidden="true" />
            <h2 className={`mb-2 text-center text-2xl font-extrabold tracking-tight uppercase ${titleClass}`}>{title}</h2>
            <p className="text-center text-base leading-relaxed text-zinc-100">{text}</p>
          </article>)}
        </div>
        <p className="mx-auto mt-12 max-w-xl text-center text-sm text-blue-200 drop-shadow-md">For a full list of features and integrations, contact <a href="mailto:digitalherencia@outlook.com" className="underline transition-colors hover:text-blue-400">digitalherencia@outlook.com</a>.</p>
      </div>
    </div>
  </div>;
}
