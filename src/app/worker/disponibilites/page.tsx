import { DisponibilitesPageClient } from "./disponibilites-client";
import { getUpcomingAvailabilities } from "@/actions/worker/disponibilites";

export default async function WorkerDisponibilitesPage() {
  // Fetch upcoming availabilities
  const availabilitiesResult = await getUpcomingAvailabilities();

  return (
    <DisponibilitesPageClient
      initialAvailabilities={availabilitiesResult.success && availabilitiesResult.data ? availabilitiesResult.data : []}
    />
  );
}