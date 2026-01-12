import { DashboardPageClient } from "./dashboard-client";
import { getRecommendedMissions } from "@/actions/worker/missions";
import { getWorkerProfile } from "@/actions/worker/profile";
import { getApplicationStats } from "@/actions/worker/candidatures";
import { getSpecialtyCategories } from "@/actions/worker/specialities";
import { getRegionsWithCities } from "@/actions/worker/profile";
import { checkOnboardingCompletion } from "@/actions/worker/onboarding";

export default async function WorkerDashboardPage() {
  const [
    missionsResult, 
    profileResult, 
    statsResult, 
    categoriesResult, 
    regionsResult,
    completionCheck 
  ] = await Promise.all([
    getRecommendedMissions(),
    getWorkerProfile(),
    getApplicationStats(),
    getSpecialtyCategories(),
    getRegionsWithCities(),
    checkOnboardingCompletion(), 
  ]);

  return (
    <DashboardPageClient
      initialMissions={missionsResult.success && missionsResult.data ? missionsResult.data : []}
      profile={profileResult.success && profileResult.data ? profileResult.data : null}
      stats={statsResult.success && statsResult.data ? statsResult.data : null}
      specialtyCategories={categoriesResult.success && categoriesResult.data ? categoriesResult.data : []}
      regions={regionsResult.success && regionsResult.data ? regionsResult.data : []}
      completion={completionCheck.success && completionCheck.data ? completionCheck.data.completion : null} 
    />
  );
}