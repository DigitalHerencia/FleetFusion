import Link from "next/link";

const sections = [
  ["acceptance", "Acceptance of terms", "By accessing or using FleetFusion, you agree to these terms. If you do not agree, do not use the service."],
  ["service", "The service", "FleetFusion provides fleet operations software, which may include dispatch, compliance-document tracking, billing support, maintenance information, and reporting. Features may change as the product evolves."],
  ["accounts", "Accounts and access", "You are responsible for providing accurate account information, protecting your credentials, and activity conducted through your account. You must have authority to act for any organization you register."],
  ["payments", "Subscriptions and payment", "If paid plans are offered to you, pricing, billing intervals, taxes, renewal, and cancellation terms will be presented with the applicable order or subscription. Do not rely on pricing described in older marketing materials."],
  ["acceptable-use", "Acceptable use", "Do not misuse the service, interfere with its operation, attempt unauthorized access, or use it in violation of applicable law."],
  ["data", "Your data", "You retain rights in the business information you submit. You authorize FleetFusion to process that information as needed to provide, secure, and support the service, subject to the Privacy Policy."],
  ["availability", "Availability and disclaimers", "The service is provided subject to applicable agreements and law. Unless expressly stated in a written agreement, the service is provided on an as-available basis and without warranties to the extent permitted by law."],
  ["liability", "Limitation of liability", "To the extent permitted by law, FleetFusion is not liable for indirect, incidental, special, consequential, or punitive damages arising from use of the service."],
  ["changes", "Changes to these terms", "These terms may be updated as the service changes. The revised version will be posted on this page with an updated effective date."],
  ["contact", "Contact", "Questions about these terms can be sent to support@fleetfusion.app."],
];

export default function TermsPage() {
  return <article className="px-6 py-14 md:px-10 md:py-20"><div className="mx-auto max-w-4xl"><p className="text-sm font-bold tracking-widest text-primary uppercase">Legal</p><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Terms of Service</h1><p className="mt-4 text-sm text-muted-foreground">Effective date: October 15, 2026</p><p className="mt-8 max-w-3xl leading-8">These terms describe the basic conditions for using FleetFusion. They are general product terms and should be reviewed by qualified counsel before being treated as final legal advice or a signed agreement.</p><nav aria-label="On this page" className="mt-8 rounded-xl border bg-muted/30 p-5"><h2 className="font-bold">On this page</h2><ul className="mt-3 grid gap-2 sm:grid-cols-2">{sections.map(([id,title])=><li key={id}><Link className="text-primary underline underline-offset-4" href={`#${id}`}>{title}</Link></li>)}</ul></nav><div className="mt-10 space-y-8">{sections.map(([id,title,body])=><section id={id} key={id} className="scroll-mt-24"><h2 className="text-xl font-bold">{title}</h2><p className="mt-3 leading-8 text-muted-foreground">{body}</p></section>)}</div></div></article>;
}
