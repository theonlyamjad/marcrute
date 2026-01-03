"use client";

import { useState } from "react";
import { MissionCard } from "@/components/ui/worker/Missioncard";
import { MissionFilters } from "@/components/ui/worker/Missionfilters";
import { Mission, MissionFilters as MissionFiltersType } from "@/types/mission";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// TODO: Replace with actual API call
const MOCK_MISSIONS: Mission[] = [
  {
    idMission: "1",
    idInstitution: "inst1",
    titre: "Assistant Social - Maison de Retraite",
    description:
      "Nous recherchons un assistant social pour accompagner nos résidents dans leurs démarches quotidiennes et maintenir le lien avec les familles.",
    typePublic: "Personnes âgées",
    dateDebut: new Date("2025-02-01"),
    dateFin: new Date("2025-08-01"),
    urgence: "Urgent",
    statut: "Ouvert",
    dateCreation: new Date("2024-12-20"),
    institution: {
      nomInstitution: "Résidence Les Oliviers",
      ville: {
        nomVille: "Agadir",
        region: {
          nomRegion: "Souss-Massa",
        },
      },
    },
    specialitesRequises: [
      {
        idSpecialiteRequise: "1",
        idMission: "1",
        specialiteRequise: "Assistant social",
        anneesExperienceMin: 2,
      },
    ],
  },
  {
    idMission: "2",
    idInstitution: "inst2",
    titre: "Éducateur Spécialisé - Centre pour Jeunes",
    description:
      "Rejoignez notre équipe pour accompagner des jeunes en difficulté dans leur parcours de réinsertion sociale et professionnelle.",
    typePublic: "Jeunes en difficulté",
    dateDebut: new Date("2025-01-15"),
    dateFin: new Date("2025-12-31"),
    urgence: null,
    statut: "Ouvert",
    dateCreation: new Date("2024-12-15"),
    institution: {
      nomInstitution: "Centre d'Accueil Al Amal",
      ville: {
        nomVille: "Casablanca",
        region: {
          nomRegion: "Casablanca-Settat",
        },
      },
    },
    specialitesRequises: [
      {
        idSpecialiteRequise: "2",
        idMission: "2",
        specialiteRequise: "Éducateur spécialisé",
        anneesExperienceMin: 3,
      },
      {
        idSpecialiteRequise: "3",
        idMission: "2",
        specialiteRequise: "Psychologie",
        anneesExperienceMin: 1,
      },
    ],
  },
  {
    idMission: "3",
    idInstitution: "inst3",
    titre: "Psychologue Clinicien - Hôpital Public",
    description:
      "Poste de psychologue pour consultations et suivis thérapeutiques au sein du service de psychiatrie.",
    typePublic: "Tout public",
    dateDebut: new Date("2025-03-01"),
    dateFin: null,
    urgence: "Normal",
    statut: "Ouvert",
    dateCreation: new Date("2024-12-25"),
    institution: {
      nomInstitution: "Hôpital Ibn Sina",
      ville: {
        nomVille: "Rabat",
        region: {
          nomRegion: "Rabat-Salé-Kénitra",
        },
      },
    },
    specialitesRequises: [
      {
        idSpecialiteRequise: "4",
        idMission: "3",
        specialiteRequise: "Psychologie clinique",
        anneesExperienceMin: 5,
      },
    ],
  },
];

// TODO: Fetch from API
const VILLES_OPTIONS = [
  { value: "Agadir", label: "Agadir" },
  { value: "Casablanca", label: "Casablanca" },
  { value: "Rabat", label: "Rabat" },
  { value: "Marrakech", label: "Marrakech" },
  { value: "Tanger", label: "Tanger" },
];

// TODO: Fetch from API
const SPECIALITES_OPTIONS = [
  { value: "Assistant social", label: "Assistant social" },
  { value: "Éducateur spécialisé", label: "Éducateur spécialisé" },
  { value: "Psychologie", label: "Psychologie" },
  { value: "Psychologie clinique", label: "Psychologie clinique" },
  { value: "Infirmier", label: "Infirmier" },
];

export default function WorkerDashboardPage() {
  const [filters, setFilters] = useState<MissionFiltersType>({});
  const [missions] = useState<Mission[]>(MOCK_MISSIONS); // TODO: Fetch from API
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Filter missions based on active filters
  const filteredMissions = missions.filter((mission) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        mission.titre.toLowerCase().includes(searchLower) ||
        mission.description?.toLowerCase().includes(searchLower) ||
        mission.institution.nomInstitution.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Type contrat filter - Note: This field doesn't exist in schema, might need to add it
    // if (filters.typeContrat && filters.typeContrat.length > 0) {
    //   if (!filters.typeContrat.includes(mission.typeContrat)) return false;
    // }

    // Specialites filter
    if (filters.specialites && filters.specialites.length > 0) {
      const missionSpecs = mission.specialitesRequises.map(
        (s) => s.specialiteRequise
      );
      const hasMatchingSpec = filters.specialites.some((filter) =>
        missionSpecs.includes(filter)
      );
      if (!hasMatchingSpec) return false;
    }

    // Ville filter
    if (filters.villes && filters.villes.length > 0) {
      const villeNom = mission.institution.ville?.nomVille;
      if (!villeNom || !filters.villes.includes(villeNom)) return false;
    }

    // Experience filter
    if (filters.experienceMin !== undefined) {
      const hasMatchingExp = mission.specialitesRequises.some(
        (spec) =>
          spec.anneesExperienceMin !== null &&
          spec.anneesExperienceMin <= filters.experienceMin!
      );
      if (!hasMatchingExp) return false;
    }

    // Urgence filter
    if (filters.urgence && filters.urgence.length > 0) {
      if (!mission.urgence || !filters.urgence.includes(mission.urgence)) {
        return false;
      }
    }

    return true;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredMissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMissions = filteredMissions.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleFiltersChange = (newFilters: MissionFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Reset to page 1 when items per page changes
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  return (
    <div className="min-h-screen bg-[#F3F4F4]">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#061E29] mb-2">
            Missions disponibles
          </h1>
          <p className="text-gray-600">
            Découvrez les opportunités qui correspondent à votre profil
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <MissionFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            villes={VILLES_OPTIONS}
            specialites={SPECIALITES_OPTIONS}
          />
        </div>

        {/* Results count and pagination controls */}
        <div className="mb-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{filteredMissions.length}</span>{" "}
              mission{filteredMissions.length > 1 ? "s" : ""} trouvée
              {filteredMissions.length > 1 ? "s" : ""}
            </p>

            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Afficher:</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={handleItemsPerPageChange}
              >
                <SelectTrigger className="w-30 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4 par page</SelectItem>
                  <SelectItem value="8">8 par page</SelectItem>
                  <SelectItem value="12">12 par page</SelectItem>
                  <SelectItem value="16">16 par page</SelectItem>
                  <SelectItem value="20">20 par page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pagination info */}
          {filteredMissions.length > 0 && (
            <div className="text-sm text-gray-600">
              Page {currentPage} sur {totalPages} ({startIndex + 1}-
              {Math.min(endIndex, filteredMissions.length)} sur{" "}
              {filteredMissions.length})
            </div>
          )}
        </div>

        {/* Mission Cards Grid */}
        {paginatedMissions.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedMissions.map((mission) => (
                <MissionCard key={mission.idMission} mission={mission} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-[#1D546D]/30"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>

                <div className="flex items-center gap-1">
                  {/* First page */}
                  <Button
                    variant={currentPage === 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(1)}
                    className={
                      currentPage === 1
                        ? "bg-[#5F9598] hover:bg-[#1D546D]"
                        : "border-[#1D546D]/30"
                    }
                  >
                    1
                  </Button>

                  {/* Show ellipsis if needed */}
                  {currentPage > 3 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}

                  {/* Middle pages */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page !== 1 &&
                        page !== totalPages &&
                        page >= currentPage - 1 &&
                        page <= currentPage + 1
                    )
                    .map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className={
                          currentPage === page
                            ? "bg-[#5F9598] hover:bg-[#1D546D]"
                            : "border-[#1D546D]/30"
                        }
                      >
                        {page}
                      </Button>
                    ))}

                  {/* Show ellipsis if needed */}
                  {currentPage < totalPages - 2 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}

                  {/* Last page */}
                  {totalPages > 1 && (
                    <Button
                      variant={currentPage === totalPages ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(totalPages)}
                      className={
                        currentPage === totalPages
                          ? "bg-[#5F9598] hover:bg-[#1D546D]"
                          : "border-[#1D546D]/30"
                      }
                    >
                      {totalPages}
                    </Button>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-[#1D546D]/30"
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              Aucune mission trouvée correspondant à vos critères de recherche.
              Essayez de modifier vos filtres.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}