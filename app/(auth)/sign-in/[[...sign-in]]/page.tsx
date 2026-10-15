import { SignInFeature } from "@/features/auth/signInFeature";

// URL ownership stops here; orchestration is delegated to the feature.
export default function Page() {
  return <SignInFeature />;
}
