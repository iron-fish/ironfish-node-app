import { CreateImportAccount } from "@/components/OnboardingFlow/CreateImportAccount/CreateImportAccount";
import { OnboardingLayout } from "@/layouts/OnboardingLayout";

export default function Onboarding() {
  return (
    <OnboardingLayout>
      <CreateImportAccount />
    </OnboardingLayout>
  );
}
