// Shared pricing section for landing and pricing pages
import Link from 'next/link';
import React from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';

const plans = [
	{
		name: 'Starter',
		price: '$149/mo',
		description: 'Perfect for small fleets just getting started.',
		features: [
			'Up to 5 trucks',
			'2 dispatcher seats',
			'5 driver apps',
			'Core TMS features',
			'90-day log retention',
		],
		highlight: false,
	},
	{
		name: 'Growth',
		price: '$349/mo',
		description: 'For growing fleets that need more power and flexibility.',
		features: [
			'Up to 25 trucks',
			'Unlimited dispatcher seats',
			'25 driver apps',
			'IFTA engine',
			'Custom reports',
		],
		highlight: true, // Recommended plan
	},
	{
		name: 'Enterprise',
		price: '$15/truck',
		description: 'Advanced features and support for large operations.',
		features: [
			'Minimum $699/mo',
			'Priority SLA',
			'Dedicated CSM',
			'SSO & API rate bump',
			'Custom integrations',
		],
		highlight: false,
	},
];

export default function PricingSection({
	showTitle = true,
}: {
	showTitle?: boolean;
}) {
	return (
		<section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
			{/* Background image */}
			<div className="absolute inset-0 z-10 h-full w-full">
				<Image
					src="/tiers_bg.png"
					alt="Pricing Background"
					className="h-full w-full object-cover object-center"
					width={1920}
					height={1080}
					priority
				/>
				<div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/20" />
			</div>
			<div className="relative z-10 container w-full px-4 py-12 md:px-8 md:py-24 xl:px-32">
				{showTitle && (
					<>
						<h2 className="mb-4 text-center text-5xl font-black text-white/90">
							Simple Transparent Pricing
						</h2>
						<p className="text-muted-foreground mb-12 text-center text-lg">
							Affordable for every fleet size. 30-day free trial on all plans.
						</p>
					</>
				)}
				<div className="flex flex-col items-stretch justify-center gap-8 md:flex-row">
					{plans.map(plan => (
						<div
							key={plan.name}
							className={`flex flex-1 flex-col items-center rounded-2xl bg-white p-8 shadow-lg transition-transform duration-200 dark:bg-zinc-900 ${
								plan.highlight
									? 'z-10 scale-105 ring-2 ring-blue-200 dark:ring-blue-900'
									: ''
							}`}
						>
							<div className="mb-2 flex items-center gap-2">
								<span className="text-foreground text-2xl font-bold dark:text-white">
									{plan.name}
								</span>
								{plan.highlight && (
									<span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-500 dark:bg-blue-500 dark:text-white">
										MOST POPULAR
									</span>
								)}
							</div>
							<div className="mb-2 text-4xl font-extrabold text-blue-500 dark:text-blue-500">
								{plan.price}
							</div>
							<div className="text-muted-foreground mb-6 text-center">
								{plan.description}
							</div>
							<ul className="mb-8 w-full space-y-2">
								{plan.features.map((feature, i) => (
									<li
										key={i}
										className="text-foreground flex items-center gap-2 dark:text-zinc-200"
									>
										<svg
											className="h-5 w-5 shrink-0 text-blue-500"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M5 13l4 4L19 7"
											/>
										</svg>
										<span>{feature}</span>
									</li>
								))}
							</ul>
							<div className="mt-auto w-full">
								<Button
									className={`w-full rounded-lg py-2 font-semibold text-white ${
										plan.highlight
											? 'bg-blue-500 hover:bg-blue-800'
											: 'bg-gray-500 hover:bg-blue-500'
									} transition-colors`}
								>
									Choose {plan.name}
								</Button>
							</div>
						</div>
					))}
				</div>
				<p className="mt-8 mb-10 text-center text-xs text-white">
					All prices in USD. Taxes & SMS fees extra. Cancel anytime.
				</p>
				<div className="mt-4 text-center">
					<Link href="/refund" className="text-sm text-white underline">
						View our Refund Policy
					</Link>
				</div>
			</div>
		</section>
	);
}
