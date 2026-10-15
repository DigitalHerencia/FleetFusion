import { SignUpFeature } from "@/features/auth/signUpFeature";

// URL ownership stops here; orchestration is delegated to the feature.
export default function Page() {
  return <SignUpFeature />;
}
