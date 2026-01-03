import { EvaluationsPageClient } from "./evaluations-client";
import { getWorkerEvaluations, getEvaluationStats } from "@/actions/worker/evaluations";

export default async function WorkerEvaluationsPage() {
  // Fetch evaluations and stats in parallel
  const [evaluationsResult, statsResult] = await Promise.all([
    getWorkerEvaluations(),
    getEvaluationStats(),
  ]);

  return (
    <EvaluationsPageClient
      initialEvaluations={evaluationsResult.success && evaluationsResult.data ? evaluationsResult.data : []}
      initialStats={statsResult.success && statsResult.data ? statsResult.data : null}
    />
  );
}