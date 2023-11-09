import { SnapshotDownloadPrompt } from "@/components/OnboardingFlow/SnapshotDownloadPrompt/SnapshotDownloadPrompt";
import { OnboardingLayout } from "@/layouts/OnboardingLayout";

export default function SnapshotDownload() {
  return (
    <OnboardingLayout>
      <SnapshotDownloadPrompt />
    </OnboardingLayout>
  );
}
