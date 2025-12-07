import Link from 'next/link';

export default function RefundPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="container mx-auto flex-1 px-4 py-12 md:px-8">
        <div className="bg-card mx-auto mb-8 w-full max-w-3xl rounded-lg p-8 shadow-md">
          <h1 className="mb-6 text-center text-4xl font-bold">💵 Refund Policy</h1>
          <p className="text-muted-foreground mb-8 text-center text-sm">
            Effective Date: April 27, 2025
            <br />
            Fleet Fusion, LLC &mdash; Anthony, New Mexico, United States
          </p>
          <ol className="text-foreground list-decimal space-y-4 pl-6 text-base">
            <li>
              <strong>Subscription Fees</strong>
              <br />
              All subscription payments (Starter, Growth, Enterprise) are non-refundable once
              processed, except as explicitly stated in this policy or required by law.
            </li>
            <li>
              <strong>30-Day Free Trial</strong>
              <br />
              Fleet Fusion offers a 30-day free trial on all plans. If you cancel during the trial
              period, you will not be charged.
            </li>
            <li>
              <strong>Cancellations</strong>
              <br />
              You may cancel your subscription at any time via your account settings. Cancellations
              are effective at the end of the current billing cycle. No partial refunds are issued
              for unused portions of a billing cycle.
            </li>
            <li>
              <strong>Refunds for Downtime</strong>
              <br />
              If Fleet Fusion fails to meet its SLA obligations, Customers may be eligible for
              service credits as described in the SLA, not monetary refunds.
            </li>
            <li>
              <strong>Exceptional Circumstances</strong>
              <br />
              Fleet Fusion may, at its sole discretion, consider refund requests in exceptional
              cases such as:
              <ul className="list-disc pl-6">
                <li>Duplicate charges</li>
                <li>Billing errors attributable to Fleet Fusion</li>
                <li>
                  Non-delivery of promised service features (with documented support communications)
                </li>
              </ul>
              All refund requests must be submitted within 30 days of the billing event via{' '}
              <a href="mailto:support@fleetfusion.app" className="text-primary underline">
                support@fleetfusion.app
              </a>
              .
            </li>
            <li>
              <strong>Chargebacks</strong>
              <br />
              If you initiate a chargeback or dispute on a legitimate charge, your account may be
              immediately suspended pending resolution.
            </li>
            <li>
              <strong>Modifications</strong>
              <br />
              Fleet Fusion reserves the right to update or modify this Refund Policy at any time.
              Updates will be posted on the website.
            </li>
          </ol>
        </div>
      </main>
      <footer className="flex w-full flex-col gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
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
