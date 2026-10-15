import Image from 'next/image';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="bg-background relative flex min-h-screen flex-col">
      {/* Background gradient overlay for fade effect */}
      <div
        className="from-background via-background pointer-events-none absolute inset-0 bg-gradient-to-b to-transparent"
        style={{ zIndex: 0 }}
      />

      {/* Background image positioned at bottom */}
      <div className="absolute right-0 bottom-0 left-0 z-0">
        <Image
          src="/valley_bg.png"
          alt="Data security visualization"
          width={1200}
          height={800}
          className="h-auto w-full object-cover"
          priority
        />
      </div>

      <main className="relative z-10 flex-1">
        <div className="container mx-auto px-4 py-12 md:px-8">
          <div className="bg-card/90 mx-auto mb-24 w-full max-w-3xl p-6">
            <h1 className="mb-6 text-center text-3xl font-bold md:text-4xl">🔒 Privacy Policy</h1>
            <p className="text-muted-foreground mb-8 text-center text-sm">
              Effective Date: April 27, 2025
              <br />
              Fleet Fusion, LLC &mdash; Anthony, New Mexico, United States
            </p>
            <ol className="text-foreground list-decimal space-y-4 pl-6 text-base">
              <li>
                <strong>Introduction</strong>
                <br />
                Fleet Fusion respects your privacy. This policy outlines how we collect, use, and
                protect your information when you use our Services.
              </li>
              <li>
                <strong>Information We Collect</strong>
                <br />
                <ul className="list-disc pl-6">
                  <li>Account Information: Name, email, phone number, company name</li>
                  <li>Fleet Data: Vehicle information, driver logs, maintenance records</li>
                  <li>
                    Usage Data: Interactions with the platform, IP address, device information
                  </li>
                  <li>
                    Payment Data: Billing address and transaction history (handled via secure
                    third-party processors)
                  </li>
                </ul>
              </li>
              <li>
                <strong>How We Use Information</strong>
                <br />
                We use collected information to:
                <ul className="list-disc pl-6">
                  <li>Provide, maintain, and improve Services</li>
                  <li>Communicate with you</li>
                  <li>Process transactions</li>
                  <li>Enforce terms and policies</li>
                  <li>Analyze trends and improve user experience</li>
                </ul>
              </li>
              <li>
                <strong>Data Sharing</strong>
                <br />
                We do not sell your personal data. Data may be shared with:
                <ul className="list-disc pl-6">
                  <li>Service providers who assist in operations</li>
                  <li>Legal authorities if required by law</li>
                  <li>Aggregated or anonymized data may be shared for industry analysis</li>
                </ul>
              </li>
              <li>
                <strong>Data Security</strong>
                <br />
                Fleet Fusion implements reasonable security measures, including encryption, access
                controls, and secure cloud infrastructure, to protect your data.
              </li>
              <li>
                <strong>Data Retention</strong>
                <br />
                We retain your data as long as your account is active or as needed to comply with
                legal obligations, resolve disputes, or enforce agreements.
              </li>
              <li>
                <strong>Your Rights</strong>
                <br />
                Depending on your location, you may have rights to access, correct, delete, or
                restrict the use of your personal information. Contact{' '}
                <a href="mailto:support@fleetfusion.app" className="text-primary underline">
                  support@fleetfusion.app
                </a>{' '}
                to exercise your rights.
              </li>
              <li>
                <strong>Cookies and Tracking Technologies</strong>
                <br />
                We use cookies and similar technologies for analytics, functionality, and marketing.
                You may adjust your browser settings to decline cookies.
              </li>
              <li>
                <strong>Changes to this Policy</strong>
                <br />
                We may update this Privacy Policy to reflect changes to our practices. Updated
                policies will be posted on our website.
              </li>
              <li>
                <strong>Contact</strong>
                <br />
                For any privacy-related inquiries, contact{' '}
                <a href="mailto:digitalherencia@outlook.com" className="text-primary underline">
                  digitalherencia@outlook.com
                </a>
              </li>
            </ol>
          </div>
        </div>
      </main>
      <footer className="bg-background/80 relative z-10 flex w-full flex-row gap-2 px-6 py-3 backdrop-blur-sm">
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
