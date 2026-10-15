import Link from "next/link";

const questions = [
  ["Who is FleetFusion for?", "FleetFusion is designed for small and growing carriers that need a clearer way to coordinate loads, drivers, vehicles, and compliance work."],
  ["What can I manage in FleetFusion?", "FleetFusion focuses on dispatch and load management, fleet records, compliance documents, and operational visibility."],
  ["How do I get started?", "Use Start Free Trial to begin the account flow. If you need help, contact digitalherencia@outlook.com."],
  ["Where can I read the legal policies?", "The Terms of Service and Privacy Policy are available through the site footer."],
];

export function FAQPageTemplate() {
  return <section className="relative z-10 container mx-auto px-4 py-12 md:px-8 md:py-20">
    <div className="mx-auto max-w-3xl">
      <p className="text-sm font-bold tracking-widest text-primary uppercase">FleetFusion help</p>
      <h1 className="mt-3 text-center text-3xl font-black tracking-tight text-blue-800 uppercase md:text-4xl dark:text-blue-500">Frequently Asked Questions</h1>
      <p className="mx-auto mt-5 max-w-2xl text-center text-lg font-bold text-muted-foreground">Answers to common questions about FleetFusion.</p>
      <div className="mt-10 space-y-4">{questions.map(([question,answer])=><details key={question} className="rounded-xl border border-gray-200 bg-black/80 p-6 text-zinc-100 shadow-xl open:border-blue-500"><summary className="cursor-pointer text-lg font-bold">{question}</summary><p className="mt-4 leading-7 text-zinc-300">{answer}</p></details>)}</div>
      <p className="mt-8 text-center text-sm text-muted-foreground">Need more information? <Link href="mailto:digitalherencia@outlook.com" className="text-primary underline">Contact us</Link>.</p>
    </div>
  </section>;
}
