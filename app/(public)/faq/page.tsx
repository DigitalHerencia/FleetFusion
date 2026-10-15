import Link from "next/link";

const questions = [
  ["Who is FleetFusion for?", "FleetFusion is designed for small and growing carriers that need a clearer way to coordinate loads, drivers, vehicles, and compliance work."],
  ["What can I manage in FleetFusion?", "The current product focuses on dispatch and load management, fleet records, compliance documents, and operational visibility. Available features depend on the current application release."],
  ["Can I use FleetFusion on a phone?", "The public site is responsive. Operational workflows should be tested on your target devices before relying on them in the field."],
  ["How do I get started?", "Use the Get started link to begin the account flow. If you need help, contact the FleetFusion team."],
  ["Where can I read the legal policies?", "The Terms and Privacy pages are linked in the site footer."],
];

export default function FAQPage() {
  return <section className="px-6 py-16 md:px-10 md:py-24"><div className="mx-auto max-w-4xl"><p className="text-sm font-bold tracking-widest text-primary uppercase">Help center</p><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Frequently asked questions</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">Answers to common questions about FleetFusion and getting started.</p><div className="mt-10 divide-y rounded-xl border">{questions.map(([question,answer])=><details key={question} className="group p-5 open:bg-muted/30"><summary className="cursor-pointer list-none pr-8 text-lg font-semibold marker:hidden">{question}<span className="float-right text-primary group-open:hidden" aria-hidden="true">+</span><span className="float-right hidden text-primary group-open:inline" aria-hidden="true">−</span></summary><p className="mt-3 max-w-3xl leading-7 text-muted-foreground">{answer}</p></details>)}</div><p className="mt-8 text-muted-foreground">Still have a question? <Link className="text-primary underline underline-offset-4" href="mailto:support@fleetfusion.app">Contact support</Link>.</p></div></section>;
}
