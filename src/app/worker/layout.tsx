import { WorkerNavbar } from "@/components/ui/worker/Workernavbar";
import { requireRole } from "@/lib/auth";
import { checkOnboardingCompletion } from "@/actions/worker/onboarding";
import { redirect } from "next/navigation";

function getInitials(name: string | null): string {
  if (!name) return "U";
  
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export default async function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("Travailleur");

  if (!user) {
    redirect("/worker/sign-in");
  }

  const userData = {
    nomComplet: user.name || null,
    email: user.email || "",
    initials: getInitials(user.name || user.email || ""),
  };

  // Check onboarding
  const onboardingCheck = await checkOnboardingCompletion();
  const needsOnboarding =
    onboardingCheck.success && !onboardingCheck.data?.isComplete;

  if (needsOnboarding) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-[#F3F4F4]">
      <WorkerNavbar user={userData} />
      <main>{children}</main>
    </div>
  );
}