export default function ServicesPage() {
  return (
    <>
      <header className="bg-background sticky top-0 z-40 border-b">
        <div className="container flex h-16 items-center px-4 md:px-6"></div>
      </header>
      <main className="container mx-auto px-4 py-12 md:px-8">
        <div className="bg-card mx-auto w-full max-w-3xl rounded-lg p-8 shadow-md">
          <h1 className="mb-6 text-center text-4xl font-bold">📑 Service Level Agreement (SLA)</h1>
          <p className="text-muted-foreground mb-8 text-center text-sm">
            Effective Date: April 27, 2025
            <br />
            Fleet Fusion, LLC &mdash; Anthony, New Mexico, United States
          </p>
          <ol className="text-foreground list-decimal space-y-4 pl-6 text-base">
            <li>
              <strong>Overview</strong>
              <br />
              This Service Level Agreement (“SLA”) outlines the service performance standards that
              Fleet Fusion, LLC ("Fleet Fusion") guarantees to its customers (“Customer”)
              subscribing to our Transportation Management System (“TMS”) services.
              <br />
              This SLA is incorporated into and made part of the Terms of Service.
            </li>
            <li>
              <strong>Service Availability</strong>
              <br />
              Fleet Fusion commits to maintaining 99.9% uptime per calendar month for the Fleet
              Fusion platform, excluding scheduled maintenance and force majeure events.
              <br />
              <span className="mt-2 block">
                <strong>Uptime Definition:</strong> Availability of all critical services necessary
                to operate fleet management features, excluding third-party provider outages.
              </span>
            </li>
            <li>
              <strong>Scheduled Maintenance</strong>
              <br />
              Scheduled maintenance will be announced with at least 48 hours' notice via email or
              platform notification.
              <br />
              Fleet Fusion will attempt to perform maintenance during off-peak hours (typically
              between 12:00 AM – 4:00 AM MST).
              <br />
              Scheduled maintenance windows do not count against uptime guarantees.
            </li>
            <li>
              <strong>Support Services</strong>
              <br />
              <table className="mb-2 w-full border text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="border px-2 py-1">Support Plan</th>
                    <th className="border px-2 py-1">Starter & Growth</th>
                    <th className="border px-2 py-1">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-2 py-1">Response Time</td>
                    <td className="border px-2 py-1">Within 24 business hours</td>
                    <td className="border px-2 py-1">Within 4 business hours (Priority SLA)</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">Channels</td>
                    <td className="border px-2 py-1">Email Support</td>
                    <td className="border px-2 py-1">Email + Dedicated CSM + Priority Queue</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">Hours</td>
                    <td className="border px-2 py-1">
                      Monday–Friday, 9 AM–5 PM MST (excluding holidays)
                    </td>
                    <td className="border px-2 py-1">24/7 Escalation for Critical Issues</td>
                  </tr>
                </tbody>
              </table>
              Enterprise customers are assigned a Dedicated Customer Success Manager (CSM).
            </li>
            <li>
              <strong>Issue Classification</strong>
              <br />
              <table className="mb-2 w-full border text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="border px-2 py-1">Severity</th>
                    <th className="border px-2 py-1">Description</th>
                    <th className="border px-2 py-1">Target Response Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-2 py-1">Critical</td>
                    <td className="border px-2 py-1">
                      Platform unusable; core business impact (e.g., no access, dispatch failure)
                    </td>
                    <td className="border px-2 py-1">Within 4 hours</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">High</td>
                    <td className="border px-2 py-1">
                      Major functionality impaired; workaround exists
                    </td>
                    <td className="border px-2 py-1">Within 8 hours</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">Medium</td>
                    <td className="border px-2 py-1">Minor functionality impaired</td>
                    <td className="border px-2 py-1">Within 24 hours</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">Low</td>
                    <td className="border px-2 py-1">General questions or minor cosmetic issues</td>
                    <td className="border px-2 py-1">Within 48 hours</td>
                  </tr>
                </tbody>
              </table>
            </li>
            <li>
              <strong>SLA Credits</strong>
              <br />
              If Fleet Fusion fails to meet the 99.9% uptime guarantee in any calendar month,
              Customers are eligible for a service credit:
              <ul className="list-disc pl-6">
                <li>
                  Credit Amount: 5% of the monthly fee for each full hour of downtime beyond the
                  threshold, up to 50% of that month’s invoice.
                </li>
                <li>
                  Process to Claim Credit:
                  <ul className="list-disc pl-6">
                    <li>
                      Submit a written request to support@fleetfusion.app within 30 days of the
                      downtime event.
                    </li>
                    <li>
                      Include timestamps, impact descriptions, and any relevant supporting
                      documentation.
                    </li>
                  </ul>
                </li>
                <li>Service credits are the sole and exclusive remedy for SLA violations.</li>
              </ul>
            </li>
            <li>
              <strong>Exclusions</strong>
              <br />
              This SLA does not apply to:
              <ul className="list-disc pl-6">
                <li>
                  Factors outside Fleet Fusion’s control (e.g., natural disasters, ISP failures).
                </li>
                <li>Customer-side issues (e.g., hardware failures, misconfigurations).</li>
                <li>Beta services or pre-release offerings.</li>
              </ul>
            </li>
            <li>
              <strong>Changes to SLA</strong>
              <br />
              Fleet Fusion reserves the right to modify this SLA with 30 days' notice. Continued use
              of the Services after changes constitutes acceptance.
            </li>
          </ol>
        </div>
      </main>
    </>
  );
}
