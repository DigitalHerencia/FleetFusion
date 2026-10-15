import Link from "next/link";

const sections = [
  ["Acceptance of Terms", "By accessing or using Fleet Fusion's services (Services), you agree to be bound by these Terms of Service (Terms). If you do not agree to these Terms, you may not access or use the Services."],
  ["Services", "Fleet Fusion provides a Transportation Management Software (TMS) platform as a service designed for small to mid-sized enterprises managing fleet operations. Services include dispatch, compliance, billing, maintenance tracking, analytics, and related features."],
  ["Eligibility", "You must be at least 18 years old and capable of entering into a legally binding agreement to use our Services."],
  ["Account Registration", "You must create an account and provide accurate, complete information. You are responsible for maintaining the confidentiality of your credentials and all activities under your account."],
  ["Subscription and Payment", "Starter Plan: $149/mo. Growth Plan: $349/mo. Enterprise Plan: $15/truck (minimum $699/mo). All prices are in USD. Taxes, SMS fees, and overages may apply. Payment is due monthly in advance. Failure to pay may result in suspension or termination of your account."],
  ["License Grant", "Fleet Fusion grants you a non-exclusive, non-transferable, revocable license to use the Services for your internal business operations."],
  ["Restrictions", "You agree not to reverse engineer, decompile, or disassemble the software; access the Services to build a competitive product; or use the platform for any illegal purpose."],
  ["Data Ownership and Usage", "You retain ownership of all fleet data entered into the system. By using the Services, you grant Fleet Fusion a limited license to use anonymized, aggregated data to improve the Services."],
  ["Termination", "Fleet Fusion may suspend or terminate access if you breach these Terms. Upon termination, your access to data will be limited as described in the Privacy Policy."],
  ["Modifications", "Fleet Fusion may modify these Terms at any time by posting updated Terms on the website. Continued use constitutes acceptance."],
  ["Warranties and Disclaimers", "Fleet Fusion provides Services as is. We disclaim all warranties, express or implied, including merchantability and fitness for a particular purpose."],
  ["Limitation of Liability", "Fleet Fusion shall not be liable for indirect, incidental, special, or consequential damages arising out of the use or inability to use the Services."],
  ["Indemnification", "You agree to indemnify and hold harmless Fleet Fusion and its affiliates from any claims, damages, liabilities, or expenses arising from your use of the Services."],
  ["Governing Law", "These Terms are governed by the laws of the State of New Mexico, without regard to its conflict of law principles."],
];

export function TermsPageTemplate() {
  return <section className="container mx-auto px-4 py-12 md:px-8">
    <article className="mx-auto mb-24 w-full max-w-3xl border border-border bg-card/90 p-6 shadow-xl backdrop-blur-sm md:p-8">
      <h1 className="mb-6 text-center text-3xl font-bold md:text-4xl">Terms of Service</h1>
      <p className="mb-8 text-center text-sm text-muted-foreground">Effective Date: April 27, 2025<br />Fleet Fusion, LLC — Anthony, New Mexico, United States</p>
      <ol className="list-decimal space-y-4 pl-6 text-base leading-7">{sections.map(([title,body])=><li key={title}><strong>{title}</strong><br />{body}</li>)}
        <li><strong>Contact</strong><br />Questions about these Terms? Email us at <a href="mailto:digitalherencia@outlook.com" className="text-primary underline">digitalherencia@outlook.com</a>.</li>
      </ol>
      <p className="mt-8 text-sm text-muted-foreground">See also our <Link href="/privacy" className="text-primary underline">Privacy Policy</Link>.</p>
    </article>
  </section>;
}
