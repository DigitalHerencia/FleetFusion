import { PublicNav } from '@/components/navigation/PublicNav';
import PricingSection from '@/components/pricing/pricing-section';
import { SharedFooter } from '@/components/shared/SharedFooter';

export default function PricingPage() {
  return (
    <>
      <PublicNav />
      <main className="flex-1">
        <PricingSection showTitle />
      </main>
      <SharedFooter />
    </>
  );
}
