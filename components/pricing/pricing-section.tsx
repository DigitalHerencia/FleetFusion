import { Check, Minus } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

const plans = [
  {
    name: 'Starter',
    price: '$149',
    unit: '/ month',
    description: 'Core tools for growing fleets getting their operations organized.',
    features: [
      'Up to 5 trucks',
      '2 dispatchers',
      '5 driver app users',
      '5 GB document storage',
      'Basic compliance tracking',
      'Basic analytics dashboard',
      'Email support',
    ],
  },
  {
    name: 'Growth',
    price: '$349',
    unit: '/ month',
    description: 'Advanced operations and reporting for fleets ready to scale.',
    featured: true,
    features: [
      'Up to 25 trucks',
      'Unlimited dispatchers',
      '25 driver app users',
      '25 GB document storage',
      'Advanced compliance tracking',
      'IFTA reporting and custom reports',
      'Full analytics dashboard',
      'Email and chat support',
    ],
  },
  {
    name: 'Enterprise',
    price: '$15',
    unit: '/ truck / month',
    minimum: '$699 monthly minimum',
    description: 'Flexible capacity, controls, and support for larger fleets.',
    features: [
      'Unlimited trucks and drivers',
      'Unlimited dispatchers',
      'Unlimited document storage',
      'Advanced compliance with audit support',
      'IFTA reporting and custom reports',
      'Full analytics with custom reporting',
      'API access and SSO/SAML',
      'Dedicated customer success manager',
    ],
  },
];

const comparison = [
  { feature: 'Dispatch board', starter: true, growth: true, enterprise: true },
  { feature: 'Vehicle and driver management', starter: true, growth: true, enterprise: true },
  { feature: 'IFTA reporting', starter: false, growth: true, enterprise: true },
  { feature: 'Custom reports', starter: false, growth: true, enterprise: true },
  { feature: 'API access and SSO/SAML', starter: false, growth: false, enterprise: true },
];

function FeatureAvailability({ available }: { available: boolean }) {
  return available ? (
    <Check aria-label="Included" className="mx-auto h-5 w-5 text-emerald-500" />
  ) : (
    <Minus aria-label="Not included" className="text-muted-foreground mx-auto h-5 w-5" />
  );
}

export default function PricingSection({ showTitle = false }: { showTitle?: boolean }) {
  return (
    <section aria-labelledby="pricing-title" className="bg-background px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {showTitle ? (
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="text-primary mb-3 text-sm font-semibold tracking-wide uppercase">
              Plans that grow with your fleet
            </p>
            <h1 id="pricing-title" className="text-3xl font-bold tracking-tight sm:text-4xl">
              Straightforward fleet management pricing
            </h1>
            <p className="text-muted-foreground mt-4 text-lg">
              Choose the tools and capacity that fit your operation today.
            </p>
          </div>
        ) : (
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <p className="text-primary mb-3 text-sm font-semibold tracking-wide uppercase">
              Flexible plans
            </p>
            <h2 id="pricing-title" className="text-3xl font-bold tracking-tight sm:text-4xl">
              Pricing built for fleets of every size
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Start with what you need and scale as your operation grows.
            </p>
          </div>
        )}

        <div className="grid items-stretch gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`border-border bg-card text-card-foreground flex flex-col rounded-xl border p-6 shadow-sm ${
                plan.featured ? 'border-primary ring-primary ring-1 lg:-translate-y-2' : ''
              }`}
            >
              <div className="mb-6">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="text-muted-foreground mt-2 min-h-12 text-sm">{plan.description}</p>
                <p className="mt-5 flex flex-wrap items-baseline gap-x-2">
                  <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.unit}</span>
                </p>
                {'minimum' in plan && (
                  <p className="text-muted-foreground mt-1 text-sm">{plan.minimum}</p>
                )}
              </div>
              <Button
                asChild
                className="mb-6 w-full"
                variant={plan.featured ? 'default' : 'outline'}
              >
                <Link href={plan.name === 'Enterprise' ? '/contact' : ('/sign-up' as Route)}>
                  {plan.name === 'Enterprise' ? 'Contact sales' : 'Get started'}
                </Link>
              </Button>
              <p className="text-sm font-semibold">Included with {plan.name}</p>
              <ul className="mt-4 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check
                      aria-hidden="true"
                      className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-16 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <caption className="mb-4 text-left text-lg font-semibold">
              Compare plan features
            </caption>
            <thead>
              <tr className="border-border border-b">
                <th scope="col" className="px-4 py-3 font-medium">
                  Feature
                </th>
                {plans.map(({ name }) => (
                  <th key={name} scope="col" className="px-4 py-3 text-center font-semibold">
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.map(({ feature, starter, growth, enterprise }) => (
                <tr key={feature} className="border-border border-b last:border-0">
                  <th scope="row" className="px-4 py-3 font-medium">
                    {feature}
                  </th>
                  <td className="px-4 py-3">
                    <FeatureAvailability available={starter} />
                  </td>
                  <td className="px-4 py-3">
                    <FeatureAvailability available={growth} />
                  </td>
                  <td className="px-4 py-3">
                    <FeatureAvailability available={enterprise} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-muted-foreground mt-6 text-center text-sm">
          All prices are in USD. Taxes, SMS fees, and overages may apply. Enterprise pricing is $15
          per truck per month with a $699 monthly minimum.
        </p>
      </div>
    </section>
  );
}
