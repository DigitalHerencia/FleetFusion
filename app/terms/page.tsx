import Image from 'next/image';
import Link from 'next/link';

export default function TermsPage() {
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
          src="/winding_bg.png"
          alt="Sunset highway with truck silhouette"
          width={1200}
          height={800}
          className="h-auto w-full object-cover"
          priority
        />
      </div>

      <main className="relative z-10 flex-1">
        <div className="container mx-auto px-4 py-12 md:px-8">
          <div className="bg-card/90 mx-auto mb-24 w-full max-w-3xl p-6">
            <h1 className="mb-6 text-center text-3xl font-bold md:text-4xl">📜 Terms of Service</h1>
            <p className="text-muted-foreground mb-8 text-center text-sm">
              Effective Date: April 27, 2025
              <br />
              Fleet Fusion, LLC &mdash; Anthony, New Mexico, United States
            </p>
            <ol className="text-foreground list-decimal space-y-4 pl-6 text-base">
              <li>
                <strong>Acceptance of Terms</strong>
                <br />
                By accessing or using Fleet Fusion's services ("Services"), you agree to be bound by
                these Terms of Service ("Terms"). If you do not agree to these Terms, you may not
                access or use the Services.
              </li>
              <li>
                <strong>Services</strong>
                <br />
                Fleet Fusion provides a Transportation Management Software (TMS) platform as a
                service (SaaS) designed for small to mid-sized enterprises (SMEs) managing fleet
                operations. Services include dispatch, compliance, billing, maintenance tracking,
                analytics, and related features.
              </li>
              <li>
                <strong>Eligibility</strong>
                <br />
                You must be at least 18 years old and capable of entering into a legally binding
                agreement to use our Services.
              </li>
              <li>
                <strong>Account Registration</strong>
                <br />
                You must create an account and provide accurate, complete information. You are
                responsible for maintaining the confidentiality of your credentials and all
                activities under your account.
              </li>
              <li>
                <strong>Subscription and Payment</strong>
                <br />
                <ul className="list-disc pl-6">
                  <li>Starter Plan: $149/mo</li>
                  <li>Growth Plan: $349/mo</li>
                  <li>Enterprise Plan: $15/truck (minimum $699/mo)</li>
                </ul>
                <span className="mt-2 block">
                  All prices are in USD. Taxes, SMS fees, and overages may apply. Payment is due
                  monthly in advance. Failure to pay may result in suspension or termination of your
                  account.
                </span>
              </li>
              <li>
                <strong>License Grant</strong>
                <br />
                Fleet Fusion grants you a non-exclusive, non-transferable, revocable license to use
                the Services for your internal business operations.
              </li>
              <li>
                <strong>Restrictions</strong>
                <br />
                You agree not to:
                <ul className="list-disc pl-6">
                  <li>Reverse engineer, decompile, or disassemble the software;</li>
                  <li>Access the Services to build a competitive product;</li>
                  <li>Use the platform for any illegal purpose.</li>
                </ul>
              </li>
              <li>
                <strong>Data Ownership and Usage</strong>
                <br />
                You retain ownership of all fleet data entered into the system. By using the
                Services, you grant Fleet Fusion a limited license to use anonymized, aggregated
                data to improve the Services.
              </li>
              <li>
                <strong>Termination</strong>
                <br />
                Fleet Fusion may suspend or terminate access if you breach these Terms. Upon
                termination, your access to data will be limited as described in the Privacy Policy.
              </li>
              <li>
                <strong>Modifications</strong>
                <br />
                Fleet Fusion may modify these Terms at any time by posting updated Terms on the
                website. Continued use constitutes acceptance.
              </li>
              <li>
                <strong>Warranties and Disclaimers</strong>
                <br />
                Fleet Fusion provides Services "as is." We disclaim all warranties, express or
                implied, including merchantability and fitness for a particular purpose.
              </li>
              <li>
                <strong>Limitation of Liability</strong>
                <br />
                Fleet Fusion shall not be liable for indirect, incidental, special, or consequential
                damages arising out of the use or inability to use the Services.
              </li>
              <li>
                <strong>Indemnification</strong>
                <br />
                You agree to indemnify and hold harmless Fleet Fusion and its affiliates from any
                claims, damages, liabilities, or expenses arising from your use of the Services.
              </li>
              <li>
                <strong>Governing Law</strong>
                <br />
                These Terms are governed by the laws of the State of New Mexico, without regard to
                its conflict of law principles.
              </li>
              <li>
                <strong>Contact</strong>
                <br />
                Questions about these Terms? Email us at{' '}
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
