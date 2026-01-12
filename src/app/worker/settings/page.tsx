import { SettingsPageClient } from "./settings-client";
import { getWorkerProfile, getRegionsWithCities } from "@/actions/worker/profile";

export default async function WorkerSettingsPage() {
  // Fetch data in parallel
  const [profileResult, regionsResult] = await Promise.all([
    getWorkerProfile(),
    getRegionsWithCities(),
  ]);

  // Handle errors
  if (!profileResult.success || !profileResult.data) {
    return (
      <div className="min-h-screen bg-[#F3F4F4] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Erreur</h2>
          <p className="text-gray-600">{profileResult.error || "Impossible de charger les paramètres"}</p>
        </div>
      </div>
    );
  }

  // Prepare data for client component
  const worker = profileResult.data;
  
  // Format regions and cities for dropdowns
  const regions = regionsResult.success && regionsResult.data
    ? regionsResult.data.map((region) => ({
        value: region.idRegion,
        label: region.nomRegion,
      }))
    : [];

  const villes = regionsResult.success && regionsResult.data
    ? regionsResult.data.flatMap((region) =>
        region.villes.map((ville) => ({
          value: ville.idVille,
          label: ville.nomVille,
          regionId: region.idRegion,
        }))
      )
    : [];

  return (
    <SettingsPageClient
      initialProfile={{
        prenom: worker.utilisateur.prenom || "",
        nom: worker.utilisateur.nom || "",
        email: worker.utilisateur.email,
        telephone: worker.utilisateur.telephone || "",
        idVille: worker.idVille || "",
        biographie: worker.biographie || "",
        anneesExperience: worker.anneesExperience || null,
        regionId: worker.ville?.idRegion || "",
      }}
      regions={regions}
      villes={villes}
    />
  );
}