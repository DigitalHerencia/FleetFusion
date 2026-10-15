import Link from "next/link";

const sections = [
  ["Introduction", "Fleet Fusion respects your privacy. This policy outlines how we collect, use, and protect your information when you use our Services."],
  ["Information We Collect", "Account Information: name, email, phone number, and company name. Fleet Data: vehicle information, driver logs, and maintenance records. Usage Data: interactions with the platform, IP address, and device information. Payment Data: billing address and transaction history handled via secure third-party processors."],
  ["How We Use Information", "We use collected information to provide, maintain, and improve Services; communicate with you; process transactions; enforce terms and policies; and analyze trends to improve user experience."],
  ["Data Sharing", "We do not sell your personal data. Data may be shared with service providers who assist in operations, legal authorities if required by law, and in aggregated or anonymized form for industry analysis."],
  ["Data Security", "Fleet Fusion implements reasonable security measures, including encryption, access controls, and secure cloud infrastructure, to protect your data."],
  ["Data Retention", "We retain your data as long as your account is active or as needed to comply with legal obligations, resolve disputes, or enforce agreements."],
  ["Your Rights", "Depending on your location, you may have rights to access, correct, delete, or restrict the use of your personal information. Contact support@fleetfusion.app to exercise your rights."],
  ["Cookies and Tracking Technologies", "We use cookies and similar technologies for analytics, functionality, and marketing. You may adjust your browser settings to decline cookies."],
  ["Changes to this Policy", "We may update this Privacy Policy to reflect changes to our practices. Updated policies will be posted on our website."],
];

export function PrivacyPageTemplate() {
  return <section className="container mx-auto px-4 py-12 md:px-8">
    <article className="mx-auto mb-24 w-full max-w-3xl border border-border bg-card/90 p-6 shadow-xl backdrop-blur-sm md:p-8">
      <h1 className="mb-6 text-center text-3xl font-bold md:text-4xl">Privacy Policy</h1>
      <p className="mb-8 text-center text-sm text-muted-foreground">Effective Date: April 27, 2025<br />Fleet Fusion, LLC — Anthony, New Mexico, United States</p>
      <ol className="list-decimal space-y-4 pl-6 text-base leading-7">{sections.map(([title,body])=><li key={title}><strong>{title}</strong><br />{body}</li>)}
        <li><strong>Contact</strong><br />For privacy-related inquiries, contact <a href="mailto:digitalherencia@outlook.com" className="text-primary underline">digitalherencia@outlook.com</a>.</li>
      </ol>
      <p className="mt-8 text-sm text-muted-foreground">See also our <Link href="/terms" className="text-primary underline">Terms of Service</Link>.</p>
    </article>
  </section>;
}
