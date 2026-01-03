import { CandidaturesPageClient } from "./candidatures-client";
import { getWorkerApplications, getApplicationStats } from "@/actions/worker/candidatures";

export default async function WorkerCandidaturesPage() {
  // Fetch applications and stats in parallel
  const [applicationsResult, statsResult] = await Promise.all([
    getWorkerApplications(),
    getApplicationStats(),
  ]);

  return (
    <CandidaturesPageClient
      initialApplications={applicationsResult.success && applicationsResult.data ? applicationsResult.data : []}
      initialStats={statsResult.success && statsResult.data ? statsResult.data : null}
    />
  );
}