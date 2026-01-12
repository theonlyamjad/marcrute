"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue,} from "@/components/ui/select";
import {MapPin,Calendar,Building2,ChevronLeft,ChevronRight,Search,Filter,AlertCircle,Clock,CheckCircle,FileText,Target,} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProfileCompletionAlert } from "@/components/ui/worker/profile-completion-alert"; 


interface DashboardPageClientProps {
  initialMissions: any[];
  profile: any;
  stats: any;
  specialtyCategories: any[];
  regions: any[];
  completion: any;
}

export function DashboardPageClient({
  initialMissions,
  profile,
  stats,
  regions,
  specialtyCategories,
  completion,
}: DashboardPageClientProps) {
  const [missions] = useState(initialMissions);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUrgence, setSelectedUrgence] = useState<string>("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedExperience, setSelectedExperience] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Non spécifié";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Filter cities based on selected region
    const filteredCities =
        selectedRegion === "all"
            ? []
            : regions
                .find((r) => r.idRegion === selectedRegion)
                ?.villes || [];

  const getUrgenceBadge = (urgence: string | null) => {
    if (!urgence) return null;

    const urgenceStyles = {
      Urgente: "bg-red-100 text-red-800 border-red-200",
      Haute: "bg-orange-100 text-orange-800 border-orange-300",
      Normale: "bg-green-100 text-green-800 border-green-200",
    };

    const style =
      urgenceStyles[urgence as keyof typeof urgenceStyles] ||
      "bg-gray-100 text-gray-800";

    return (
      <Badge variant="outline" className={`text-xs ${style}`}>
        {urgence}
      </Badge>
    );
  };

  // Filter missions
  const filteredMissions = missions.filter((mission) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        mission.titre?.toLowerCase().includes(searchLower) ||
        mission.description?.toLowerCase().includes(searchLower) ||
        mission.institution?.nomInstitution?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Urgence filter
    if (selectedUrgence !== "all" && mission.urgence !== selectedUrgence) {
      return false;
    }

    // Specialty filter
    if (selectedSpecialty !== "all") {
      const hasSpecialty = mission.specialitesRequises?.some(
        (spec: any) => spec.idCategorie?.toString() === selectedSpecialty
      );
      if (!hasSpecialty) return false;
    }

    // Region filter
    if (selectedRegion !== "all") {
      if (mission.institution?.ville?.idRegion !== selectedRegion) {
        return false;
      }
    }

    // City filter
    if (selectedCity !== "all") {
      if (mission.institution?.ville?.idVille !== selectedCity) {
        return false;
      }
    }

    // Experience filter
    if (selectedExperience !== "all") {
      const minExp = parseInt(selectedExperience);
      const hasMatchingExp = mission.specialitesRequises?.some(
        (spec: any) =>
          spec.anneesExperienceMin !== null &&
          spec.anneesExperienceMin <= minExp
      );
      if (!hasMatchingExp) return false;
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredMissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMissions = filteredMissions.slice(startIndex, endIndex);

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedUrgence("all");
    setSelectedSpecialty("all");
    setSelectedRegion("all");
    setSelectedCity("all");
    setSelectedExperience("all");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm ||
    selectedUrgence !== "all" ||
    selectedSpecialty !== "all" ||
    selectedRegion !== "all" ||
    selectedCity !== "all" ||
    selectedExperience !== "all";

  return (
    <div className="min-h-screen bg-[#F3F4F4]">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#061E29] mb-2">
            Tableau de bord
          </h1>
          <p className="text-gray-600">
            Bienvenue {profile?.utilisateur?.nomComplet || ""}! Découvrez les missions qui correspondent à votre profil
          </p>
        </div>

        {/* Profile Completion Alert */}
        {completion && (
          <ProfileCompletionAlert completion={completion} />
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-[#1D546D]/20 bg-[#1D546D]/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-[#1D546D]" />
                  <div>
                    <p className="text-2xl font-bold text-[#061E29]">
                      {stats.totalApplications || 0}
                    </p>
                    <p className="text-sm text-gray-600">Candidatures</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold text-yellow-800">
                      {stats.pendingApplications || 0}
                    </p>
                    <p className="text-sm text-yellow-700">En attente</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-green-800">
                      {stats.acceptedApplications || 0}
                    </p>
                    <p className="text-sm text-green-700">Acceptées</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#5F9598]/30 bg-[#5F9598]/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-[#5F9598]" />
                  <div>
                    <p className="text-2xl font-bold text-[#061E29]">
                      {missions.length}
                    </p>
                    <p className="text-sm text-gray-600">Recommandées</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6 border-[#1D546D]/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-[#061E29] flex items-center gap-2">
                <Filter className="h-5 w-5 text-[#5F9598]" />
                Filtres
              </CardTitle>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-[#5F9598] hover:text-[#1D546D]"
                >
                  Réinitialiser
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher une mission..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>

              {/* Region */}
              <Select
                value={selectedRegion}
                onValueChange={(value) => {
                  setSelectedRegion(value);
                  setSelectedCity("all");
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Région" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les régions</SelectItem>
                  {regions.map((region) => (
                    <SelectItem key={region.idRegion} value={region.idRegion}>
                      {region.nomRegion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* City */}
              <Select
                value={selectedCity}
                onValueChange={(value) => {
                  setSelectedCity(value);
                  setCurrentPage(1);
                }}
                disabled={selectedRegion === "all"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ville" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les villes</SelectItem>
                  {filteredCities.map((city : any) => (
                    <SelectItem key={city.idVille} value={city.idVille}>
                      {city.nomVille}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Urgence */}
              <Select
                value={selectedUrgence}
                onValueChange={(value) => {
                  setSelectedUrgence(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Urgence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les urgences</SelectItem>
                    <SelectItem value="Urgente">Urgente</SelectItem>
                    <SelectItem value="Haute">Haute</SelectItem>
                    <SelectItem value="Normale">Normale</SelectItem>
                </SelectContent>
              </Select>

              {/* Specialty */}
              <Select
                value={selectedSpecialty}
                onValueChange={(value) => {
                  setSelectedSpecialty(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Spécialité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les spécialités</SelectItem>
                  {specialtyCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Experience Level */}
              <Select
                value={selectedExperience}
                onValueChange={(value) => {
                  setSelectedExperience(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Niveau d'expérience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les niveaux</SelectItem>
                  <SelectItem value="0">0-1 an</SelectItem>
                  <SelectItem value="2">2-3 ans</SelectItem>
                  <SelectItem value="4">4-5 ans</SelectItem>
                  <SelectItem value="6">6+ ans</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Info */}
        <div className="mb-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{filteredMissions.length}</span>{" "}
              mission{filteredMissions.length > 1 ? "s" : ""} trouvée
              {filteredMissions.length > 1 ? "s" : ""}
            </p>

            <Select
              value={itemsPerPage.toString()}
              onValueChange={handleItemsPerPageChange}
            >
              <SelectTrigger className="w-32 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4 par page</SelectItem>
                <SelectItem value="8">8 par page</SelectItem>
                <SelectItem value="12">12 par page</SelectItem>
                <SelectItem value="16">16 par page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredMissions.length > 0 && (
            <div className="text-sm text-gray-600">
              Page {currentPage} sur {totalPages}
            </div>
          )}
        </div>

        {/* Mission Cards */}
        {paginatedMissions.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedMissions.map((mission) => (
                <Card
                  key={mission.idMission}
                  className="border-[#1D546D]/20 hover:shadow-lg transition-shadow cursor-pointer group"
                >
                  <Link href={`/worker/missions/${mission.idMission}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <CardTitle className="text-lg text-[#061E29] line-clamp-2 group-hover:text-[#5F9598] transition-colors">
                          {mission.titre}
                        </CardTitle>
                        {getUrgenceBadge(mission.urgence)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 className="h-4 w-4" />
                        <span className="line-clamp-1">
                          {mission.institution?.nomInstitution}
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {/* Location */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 text-[#5F9598]" />
                        <span>
                          {mission.institution?.ville?.nomVille},{" "}
                          {mission.institution?.ville?.region?.nomRegion}
                        </span>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-[#5F9598]" />
                        <span>{formatDate(mission.dateDebut)}</span>
                      </div>

                      {/* Specialties */}
                      {mission.specialitesRequises &&
                        mission.specialitesRequises.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-2">
                            {mission.specialitesRequises
                              .slice(0, 2)
                              .map((spec: any, index: number) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs bg-[#5F9598]/10 text-[#1D546D] border-[#5F9598]/30"
                                >
                                  {spec.categorie?.name}
                                </Badge>
                              ))}
                            {mission.specialitesRequises.length > 2 && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-gray-100"
                              >
                                +{mission.specialitesRequises.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}

                      {/* Description */}
                      {mission.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 pt-2 border-t">
                          {mission.description}
                        </p>
                      )}

                      {/* View Button */}
                      <Button
                        className="w-full mt-3 bg-[#5F9598] hover:bg-[#1D546D] text-white"
                        size="sm"
                      >
                        Voir les détails
                      </Button>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>

            {/* Pagination */}
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

                  {currentPage > 3 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}

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

                  {currentPage < totalPages - 2 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}

                  {totalPages > 1 && (
                    <Button
                      variant={
                        currentPage === totalPages ? "default" : "outline"
                      }
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
          <Alert className="bg-blue-50 border-2 border-blue-200">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-blue-800">
              {hasActiveFilters
                ? "Aucune mission ne correspond à vos filtres. Essayez de modifier vos critères de recherche."
                : "Aucune mission recommandée pour le moment. Complétez votre profil et ajoutez vos spécialités pour recevoir des recommandations personnalisées."}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}