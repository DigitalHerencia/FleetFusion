import PricingSection from '@/components/pricing/pricing-section';
import { SharedFooter } from '@/components/shared/SharedFooter';

export default function PricingPage() {
  return (
    <div>
      <main>
        <PricingSection showTitle={true} />
        <div className="text-center"></div>
      </main>
      <SharedFooter />
    </div>
  );
}
