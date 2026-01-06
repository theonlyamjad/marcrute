"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Star, Award, GraduationCap, CheckCircle2, X, Loader2, Filter
} from 'lucide-react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/enterprise-dashboard/components/app-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { searchWorkers, getWorkerProfile, getSpecialtyCategories, getRegionsWithCities } from '@/actions/enterprise/travailleurs';
import { toast } from 'sonner';

// --- Interfaces de Données ---
export type WorkerAvailability = "Disponible" | "En mission" | "Bientôt libre";

export interface Specialty {
  name: string;
  level: "Débutant" | "Intermédiaire" | "Avancé" | "Expert";
}

export interface Diploma {
  title: string;
  school: string;
  year: string;
  verified: boolean;
}

export interface Worker {
  id: number;
  name: string;
  photo: string;
  city: string;
  region: string;
  specialties: Specialty[];
  experience: number;
  rating: number;
  isLabelled: boolean;
  availability: WorkerAvailability;
  bio: string;
  diplomas: Diploma[];
}

// Updated Region interface to match DB structure
interface Region {
  idRegion: string;
  nomRegion: string;
  villes: { idVille: string; nomVille: string }[];
}

interface City {
  idVille: string;
  nomVille: string;
}

// Experience ranges
const EXPERIENCE_RANGES = [
  { value: "0", label: "0-1 an" },
  { value: "1", label: "1-5 ans" },
  { value: "5", label: "5-10 ans" },
  { value: "10", label: "10+ ans" },
];

// Helper function to get initials
const getInitials = (name: string) => {
  const words = name.trim().split(/\s+/);
  return words
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase() || "")
    .join("") || "TR";
};

const TravailleursPage = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [filters, setFilters] = useState({
    idSpecialite: "all" as string,
    idRegion: "all" as string,
    idVille: "all" as string,
    anneesExperienceMin: "all" as string,
  });

  const [specialties, setSpecialties] = useState<{ id: number; name: string }[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [specialtiesResult, regionsResult] = await Promise.all([
          getSpecialtyCategories(),
          getRegionsWithCities(),
        ]);

        if (specialtiesResult.success && specialtiesResult.data) {
          setSpecialties(specialtiesResult.data.map(s => ({ id: s.id, name: s.name })));
        }

        if (regionsResult.success && regionsResult.data) {
          setRegions(regionsResult.data);
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadInitialData();
  }, []);

  // Update cities when region changes
  useEffect(() => {
    if (filters.idRegion !== "all") {
      const selectedRegion = regions.find(r => r.idRegion === filters.idRegion);
      if (selectedRegion) {
        setCities(selectedRegion.villes);
      } else {
        setCities([]);
      }
      // Reset ville when region changes
      setFilters(prev => ({ ...prev, idVille: "all" }));
    } else {
      setCities([]);
    }
  }, [filters.idRegion, regions]);

  // Load workers
  useEffect(() => {
    const loadWorkers = async () => {
      setLoading(true);
      try {
        // Convert filters for API call
        const apiFilters = {
          search: searchTerm || undefined,
          idSpecialite: filters.idSpecialite !== "all" ? parseInt(filters.idSpecialite) : undefined,
          idRegion: filters.idRegion !== "all" ? parseInt(filters.idRegion) : undefined,
          idVille: filters.idVille !== "all" ? filters.idVille : undefined,
          anneesExperienceMin: filters.anneesExperienceMin !== "all" ? parseInt(filters.anneesExperienceMin) : undefined,
        };

        const workersResult = await searchWorkers(apiFilters);

        if (workersResult.success && workersResult.data) {
          setWorkers(workersResult.data.map(w => ({
            ...w,
            id: parseInt(w.id) || 0,
            photo: w.photo || "",
          })));
        }
      } catch (error) {
        toast.error("Erreur lors du chargement des travailleurs");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      loadWorkers();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, filters]);

  const handleSelectWorker = async (worker: Worker) => {
    try {
      const result = await getWorkerProfile(worker.id.toString());
      if (result.success && result.data) {
        setSelectedWorker({
          ...result.data,
          id: parseInt(result.data.id) || 0,
          photo: result.data.photo || "",
        });
      }
    } catch (error) {
      toast.error("Erreur lors du chargement du profil");
      console.error(error);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      idSpecialite: "all",
      idRegion: "all",
      idVille: "all",
      anneesExperienceMin: "all",
    });
    setSearchTerm("");
  };

  const hasActiveFilters =
    searchTerm ||
    filters.idSpecialite !== "all" ||
    filters.idRegion !== "all" ||
    filters.idVille !== "all" ||
    filters.anneesExperienceMin !== "all";

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <div className="flex flex-1 flex-col p-6 md:p-8 space-y-6 bg-[#F3F4F4]">
          
          {/* Header */}
          <div className="bg-[#1D546D] rounded-xl p-6 shadow-lg">
            <h1 className="text-3xl font-bold text-white">Annuaire des Travailleurs</h1>
            <p className="text-[#F3F4F4] text-opacity-90 mt-1">
              Recherchez et recrutez les meilleurs talents
            </p>
          </div>

          {/* Filters Section */}
          <Card className="border-none shadow-lg bg-white border-[#1D546D]/20">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-[#061E29] flex items-center gap-2">
                  <Filter className="h-5 w-5 text-[#5F9598]" />
                  Filtres de recherche
                </CardTitle>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilters}
                    className="text-[#5F9598] hover:text-[#1D546D] hover:bg-[#5F9598]/10"
                  >
                    Réinitialiser
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                
                {/* Search Bar - Full Width */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#5F9598]" />
                  <Input
                    placeholder="Rechercher un travailleur par nom..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-[#5F9598] focus:border-[#1D546D] h-11"
                  />
                </div>

                {/* Filter Grid - 2 rows */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  
                  {/* Région */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#061E29] ml-1">
                      Région
                    </label>
                    <Select
                      value={filters.idRegion}
                      onValueChange={(value) => setFilters({ ...filters, idRegion: value })}
                    >
                      <SelectTrigger className="border-[#5F9598]/50 h-10">
                        <SelectValue placeholder="Toutes les régions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les régions</SelectItem>
                        {regions.map(r => (
                          <SelectItem key={r.idRegion} value={r.idRegion}>
                            {r.nomRegion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Ville */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#061E29] ml-1">
                      Ville
                    </label>
                    <Select
                      value={filters.idVille}
                      onValueChange={(value) => setFilters({ ...filters, idVille: value })}
                      disabled={filters.idRegion === "all"}
                    >
                      <SelectTrigger className="border-[#5F9598]/50 h-10 disabled:opacity-50">
                        <SelectValue placeholder="Toutes les villes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les villes</SelectItem>
                        {cities.map(c => (
                          <SelectItem key={c.idVille} value={c.idVille}>
                            {c.nomVille}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Spécialité */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#061E29] ml-1">
                      Spécialité
                    </label>
                    <Select
                      value={filters.idSpecialite}
                      onValueChange={(value) => setFilters({ ...filters, idSpecialite: value })}
                    >
                      <SelectTrigger className="border-[#5F9598]/50 h-10">
                        <SelectValue placeholder="Toutes les spécialités" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les spécialités</SelectItem>
                        {specialties.map(s => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Expérience */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#061E29] ml-1">
                      Expérience
                    </label>
                    <Select
                      value={filters.anneesExperienceMin}
                      onValueChange={(value) => setFilters({ ...filters, anneesExperienceMin: value })}
                    >
                      <SelectTrigger className="border-[#5F9598]/50 h-10">
                        <SelectValue placeholder="Toutes expériences" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes expériences</SelectItem>
                        {EXPERIENCE_RANGES.map(range => (
                          <SelectItem key={range.value} value={range.value}>
                            {range.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Info */}
          <div className="flex items-center justify-between px-1">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-[#061E29]">{workers.length}</span> travailleur{workers.length > 1 ? "s" : ""} trouvé{workers.length > 1 ? "s" : ""}
            </p>
            {hasActiveFilters && (
              <div className="flex items-center gap-2 text-xs text-[#5F9598]">
                <Filter className="h-3.5 w-3.5" />
                Filtres actifs
              </div>
            )}
          </div>

          {/* Workers List */}
          {loading ? (
            <Card className="border-none shadow-lg bg-white">
              <CardContent className="py-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#1D546D] mb-4" />
                <p className="text-[#5F9598] text-lg">Chargement des travailleurs...</p>
              </CardContent>
            </Card>
          ) : workers.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {workers.map((worker) => (
                <Card
                  key={worker.id}
                  onClick={() => handleSelectWorker(worker)}
                  className="border-none shadow-lg hover:shadow-xl transition-all cursor-pointer bg-white hover:border-[#5F9598]"
                >
                  <CardContent className="p-6">
                    <div className="flex gap-4 items-start">
                      
                      {/* Avatar with Initials */}
                      <div className="w-16 h-16 rounded-xl bg-linear-to-br from-[#1D546D] to-[#5F9598] flex items-center justify-center shrink-0 shadow-md">
                        <span className="text-xl font-bold text-white">
                          {getInitials(worker.name)}
                        </span>
                      </div>

                      {/* Worker Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-[#061E29] text-lg truncate">
                              {worker.name}
                            </h3>
                            <p className="text-sm text-[#5F9598] flex items-center gap-1">
                              <MapPin size={14} /> {worker.city}, {worker.region}
                            </p>
                          </div>
                          {worker.isLabelled && (
                            <span className="bg-[#5F9598]/10 text-[#5F9598] p-1.5 rounded-full shrink-0">
                              <Award size={16} />
                            </span>
                          )}
                        </div>

                        {/* Specialties */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {worker.specialties.slice(0, 2).map(s => (
                            <span 
                              key={s.name} 
                              className="text-[10px] uppercase font-bold px-2 py-1 bg-[#F3F4F4] text-[#1D546D] rounded"
                            >
                              {s.name}
                            </span>
                          ))}
                          {worker.specialties.length > 2 && (
                            <span className="text-[10px] uppercase font-bold px-2 py-1 bg-[#F3F4F4] text-[#5F9598] rounded">
                              +{worker.specialties.length - 2}
                            </span>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between pt-3 border-t border-[#5F9598]/20">
                          <div className="flex gap-4">
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase">Exp.</p>
                              <p className="text-xs font-bold text-[#061E29]">
                                {worker.experience} ans
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase">Note</p>
                              <p className="text-xs font-bold text-[#061E29] flex items-center gap-1">
                                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                {worker.rating.toFixed(1)}
                              </p>
                            </div>
                          </div>
                          <span 
                            className={`text-[10px] font-bold px-2 py-1 rounded ${
                              worker.availability === 'Disponible' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {worker.availability.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-none shadow-lg bg-white">
              <CardContent className="py-12 text-center">
                <p className="text-[#5F9598] text-lg">Aucun travailleur trouvé</p>
                <p className="text-sm text-gray-400 mt-2">
                  {hasActiveFilters 
                    ? "Essayez de modifier vos critères de recherche" 
                    : "Aucun travailleur disponible pour le moment"}
                </p>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Worker Detail Panel */}
        {selectedWorker && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right">
              
              {/* Header */}
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
                <span className="font-bold text-[#061E29]">Profil Détaillé</span>
                <button 
                  onClick={() => setSelectedWorker(null)} 
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20}/>
                </button>
              </div>

              <div className="p-8">
                
                {/* Profile Header */}
                <div className="flex flex-col items-center mb-8">
                  <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-[#1D546D] to-[#5F9598] flex items-center justify-center mb-4 shadow-lg">
                    <span className="text-3xl font-bold text-white">
                      {getInitials(selectedWorker.name)}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-[#061E29]">{selectedWorker.name}</h2>
                  <p className="text-[#5F9598] font-medium flex items-center gap-1">
                    <MapPin size={16} /> {selectedWorker.city}, {selectedWorker.region}
                  </p>
                  
                  {/* Availability Badge */}
                  <span 
                    className={`mt-3 text-xs font-bold px-3 py-1.5 rounded-full ${
                      selectedWorker.availability === 'Disponible' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {selectedWorker.availability}
                  </span>
                </div>

                {/* Bio */}
                <section className="mb-8">
                  <h4 className="text-sm font-bold text-[#1D546D] uppercase mb-2 flex items-center gap-2">
                    Biographie
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {selectedWorker.bio || "Aucune biographie disponible"}
                  </p>
                </section>

                {/* Compétences */}
                <section className="mb-8">
                  <h4 className="text-sm font-bold text-[#1D546D] uppercase mb-3">
                    Compétences & Niveaux
                  </h4>
                  <div className="space-y-2">
                    {selectedWorker.specialties.map((s: Specialty) => (
                      <div 
                        key={s.name} 
                        className="flex justify-between items-center p-3 bg-[#F3F4F4] rounded-lg"
                      >
                        <span className="text-sm font-semibold text-[#061E29]">{s.name}</span>
                        <span className="text-xs bg-[#5F9598] text-white px-2 py-1 rounded">
                          {s.level}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Diplômes */}
                <section className="mb-8">
                  <h4 className="text-sm font-bold text-[#1D546D] uppercase mb-3">Diplômes</h4>
                  {selectedWorker.diplomas.length > 0 ? (
                    selectedWorker.diplomas.map((d: Diploma) => (
                      <div 
                        key={d.title} 
                        className="flex gap-3 p-3 border rounded-lg items-start mb-2"
                      >
                        <GraduationCap className="text-[#5F9598] shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-[#061E29]">{d.title}</p>
                          <p className="text-xs text-gray-500">{d.school} • {d.year}</p>
                          {d.verified && (
                            <span className="text-[10px] text-green-600 flex items-center gap-1 font-bold mt-1">
                              <CheckCircle2 size={12}/> VÉRIFIÉ
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">Aucun diplôme renseigné</p>
                  )}
                </section>

                {/* Stats */}
                <section className="mb-8 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[#F3F4F4] rounded-lg text-center">
                    <p className="text-xs text-gray-400 uppercase mb-1">Expérience</p>
                    <p className="text-2xl font-bold text-[#061E29]">
                      {selectedWorker.experience} <span className="text-sm">ans</span>
                    </p>
                  </div>
                  <div className="p-4 bg-[#F3F4F4] rounded-lg text-center">
                    <p className="text-xs text-gray-400 uppercase mb-1">Note moyenne</p>
                    <p className="text-2xl font-bold text-[#061E29] flex items-center justify-center gap-1">
                      <Star size={20} className="text-yellow-500 fill-yellow-500" />
                      {selectedWorker.rating.toFixed(1)}
                    </p>
                  </div>
                </section>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline"
                    className="border-2 border-[#5F9598] text-[#5F9598] font-bold hover:bg-[#F3F4F4]"
                  >
                    Voir Calendrier
                  </Button>
                  <Button 
                    className="bg-[#5F9598] text-white font-bold hover:bg-[#1D546D] shadow-lg"
                  >
                    Recruter
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default TravailleursPage;