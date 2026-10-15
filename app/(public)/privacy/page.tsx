import Link from "next/link";

const sections = [
  ["information", "Information we collect", "Depending on how you use FleetFusion, information may include account and contact details, organization information, fleet and load records, documents you upload, support communications, and technical usage data needed to operate and secure the service."],
  ["use", "How information is used", "Information is used to provide and maintain the service, support users, protect accounts, troubleshoot issues, communicate service updates, and meet legal obligations."],
  ["sharing", "How information is shared", "Information may be processed by service providers supporting hosting, authentication, communications, payments, and application operations. It may also be disclosed when required by law or to protect the service and its users."],
  ["security", "Security and retention", "Reasonable administrative and technical safeguards are used to protect information. No system can guarantee absolute security. Information is retained for as long as needed for the purposes described here, subject to contractual and legal requirements."],
  ["cookies", "Cookies and analytics", "The application may use cookies or similar technologies for authentication, preferences, security, and operational analytics. Browser controls may allow you to manage some cookie behavior."],
  ["rights", "Your choices and rights", "Depending on applicable law, you may have rights to access, correct, export, or delete personal information. Requests may require verification and may be limited by legal or operational obligations."],
  ["children", "Children's privacy", "FleetFusion is a business service and is not intended for children."],
  ["changes", "Changes to this policy", "This policy may be updated as the service and legal requirements evolve. Updates will be posted on this page with a revised effective date."],
  ["contact", "Contact", "For privacy questions or requests, email support@fleetfusion.app."],
];

export default function PrivacyPage() {
  return <article className="px-6 py-14 md:px-10 md:py-20"><div className="mx-auto max-w-4xl"><p className="text-sm font-bold tracking-widest text-primary uppercase">Legal</p><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Privacy Policy</h1><p className="mt-4 text-sm text-muted-foreground">Effective date: October 15, 2026</p><p className="mt-8 max-w-3xl leading-8">This policy describes, at a general level, how FleetFusion may handle information in connection with its fleet operations service. It should be reviewed against the actual production data flows and subprocessors before publication as a final policy.</p><nav aria-label="On this page" className="mt-8 rounded-xl border bg-muted/30 p-5"><h2 className="font-bold">On this page</h2><ul className="mt-3 grid gap-2 sm:grid-cols-2">{sections.map(([id,title])=><li key={id}><Link className="text-primary underline underline-offset-4" href={`#${id}`}>{title}</Link></li>)}</ul></nav><div className="mt-10 space-y-8">{sections.map(([id,title,body])=><section id={id} key={id} className="scroll-mt-24"><h2 className="text-xl font-bold">{title}</h2><p className="mt-3 leading-8 text-muted-foreground">{body}</p></section>)}</div></div></article>;
}
