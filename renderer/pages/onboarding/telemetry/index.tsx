import { TelemetryPrompt } from "@/components/OnboardingFlow/TelemetryPrompt/TelemetryPrompt";
import { OnboardingLayout } from "@/layouts/OnboardingLayout";

export default function Telemetry() {
  return (
    <OnboardingLayout>
      <TelemetryPrompt />
    </OnboardingLayout>
  );
}
