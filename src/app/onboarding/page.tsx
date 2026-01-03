import { auth } from "@/app/api/auth/[...nextauth]/route";
import { checkOnboardingCompletion } from "@/actions/worker/onboarding";
import { redirect } from "next/navigation";
import { OnboardingClient } from "./onboarding-client";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session) {
    redirect("/worker/sign-in");
  }

  // Check if already complete
  const check = await checkOnboardingCompletion();

  if (check.success && check.data?.isComplete) {
    redirect("/worker/dashboard");
  }

  return (
    <OnboardingClient
      isGoogleUser={check.data?.isGoogleUser || false}
      completion={check.data?.completion || {}}
    />
  );
}