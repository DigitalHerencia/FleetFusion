import { getOrgProfile } from '../../settings/lib/settingsFetchers';
import { OnboardingForm } from '../components/OnboardingForm';
import { getOnboardingState } from '../lib/authFetchers';

export default async function OnboardingPage() {
  const [state, profile] = await Promise.all([getOnboardingState(), getOrgProfile()]);
  return (
    <section className="grid gap-6">
      <div>
        <p className="text-sm font-medium text-slate-500">Organization setup · Step 1 of 2</p>
        <h1 className="mt-1 text-3xl font-semibold">Complete your organization profile</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Add your company details so your FleetFusion workspace is ready for your team.
        </p>
        {state.status === 'completed' ? (
          <p className="mt-3 text-sm text-emerald-700">
            This onboarding step is already complete. You can update these details any time in
            Settings.
          </p>
        ) : null}
      </div>
      <OnboardingForm initialValues={profile} />
    </section>
  );
}
