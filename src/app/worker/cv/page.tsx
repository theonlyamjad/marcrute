import { CVPageClient } from "./cv-client";
import { getWorkerExperiences } from "@/actions/worker/experience";
import { getWorkerDiplomas } from "@/actions/worker/diplomes";
import { getWorkerSpecialties, getSpecialtyCategories } from "@/actions/worker/specialities";

export default async function WorkerCVPage() {
  // Fetch all CV data in parallel
  const [experiencesResult, diplomasResult, specialtiesResult, categoriesResult] = await Promise.all([
    getWorkerExperiences(),
    getWorkerDiplomas(),
    getWorkerSpecialties(),
    getSpecialtyCategories(),
  ]);

  return (
    <CVPageClient
      initialExperiences={experiencesResult.success && experiencesResult.data ? experiencesResult.data : []}
      initialDiplomas={diplomasResult.success && diplomasResult.data ? diplomasResult.data : []}
      initialSpecialties={specialtiesResult.success && specialtiesResult.data ? specialtiesResult.data : []}
      availableCategories={categoriesResult.success && categoriesResult.data ? categoriesResult.data : []}
    />
  );
}