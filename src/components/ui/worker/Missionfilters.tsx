"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { MissionFilters as MissionFiltersType } from "@/types/mission";

interface MissionFiltersProps {
  filters: MissionFiltersType;
  onFiltersChange: (filters: MissionFiltersType) => void;
  villes: { value: string; label: string }[];
  specialites: { value: string; label: string }[];
}

const TYPE_CONTRAT_OPTIONS = [
  { value: "CDI", label: "CDI" },
  { value: "CDD", label: "CDD" },
  { value: "Stage", label: "Stage" },
  { value: "Freelance", label: "Freelance" },
  { value: "Interim", label: "Intérim" },
];

const EXPERIENCE_OPTIONS = [
  { value: "0", label: "Débutant (0-1 an)" },
  { value: "1", label: "1-3 ans" },
  { value: "3", label: "3-5 ans" },
  { value: "5", label: "5+ ans" },
];

const URGENCE_OPTIONS = [
  { value: "Urgent", label: "Urgent" },
  { value: "Normal", label: "Normal" },
  { value: "Flexible", label: "Flexible" },
];

export function MissionFilters({
  filters,
  onFiltersChange,
  villes,
  specialites,
}: MissionFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || "");

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    onFiltersChange({ ...filters, search: value });
  };

  const addFilter = (type: keyof MissionFiltersType, value: string) => {
    if (type === "search" || type === "experienceMin") return;

    // If "none" is selected, do nothing
    if (value === "none") return;

    const currentValues = (filters[type] as string[]) || [];
    if (!currentValues.includes(value)) {
      onFiltersChange({
        ...filters,
        [type]: [...currentValues, value],
      });
    }
  };

  const removeFilter = (type: keyof MissionFiltersType, value: string) => {
    if (type === "search" || type === "experienceMin") return;

    const currentValues = (filters[type] as string[]) || [];
    onFiltersChange({
      ...filters,
      [type]: currentValues.filter((v) => v !== value),
    });
  };

  const setExperienceFilter = (value: string) => {
    if (value === "none" || !value) {
      onFiltersChange({
        ...filters,
        experienceMin: undefined,
      });
    } else {
      onFiltersChange({
        ...filters,
        experienceMin: parseInt(value),
      });
    }
  };

  const clearAllFilters = () => {
    onFiltersChange({});
    setSearchInput("");
  };

  const hasActiveFilters =
    filters.search ||
    (filters.typeContrat && filters.typeContrat.length > 0) ||
    (filters.specialites && filters.specialites.length > 0) ||
    (filters.villes && filters.villes.length > 0) ||
    (filters.urgence && filters.urgence.length > 0) ||
    filters.experienceMin !== undefined;

  return (
    <div className="space-y-4">
      {/* Search and Filter Dropdowns */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher une mission..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 border-[#1D546D]/30 focus:border-[#5F9598]"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap gap-2">
          {/* Type de contrat */}
          <Select value="" onValueChange={(value) => addFilter("typeContrat", value)}>
            <SelectTrigger className="w-35 border-[#1D546D]/30">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucun</SelectItem>
              {TYPE_CONTRAT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Spécialité */}
          <Select value="" onValueChange={(value) => addFilter("specialites", value)}>
            <SelectTrigger className="w-35 border-[#1D546D]/30">
              <SelectValue placeholder="Spécialité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucun</SelectItem>
              {specialites.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Ville */}
          <Select value="" onValueChange={(value) => addFilter("villes", value)}>
            <SelectTrigger className="w-35 border-[#1D546D]/30">
              <SelectValue placeholder="Ville" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucun</SelectItem>
              {villes.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Expérience */}
          <Select
            value={filters.experienceMin?.toString() || ""}
            onValueChange={setExperienceFilter}
          >
            <SelectTrigger className="w-35 border-[#1D546D]/30">
              <SelectValue placeholder="Expérience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucun</SelectItem>
              {EXPERIENCE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Urgence */}
          <Select value="" onValueChange={(value) => addFilter("urgence", value)}>
            <SelectTrigger className="w-35 border-[#1D546D]/30">
              <SelectValue placeholder="Urgence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucun</SelectItem>
              {URGENCE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Filtres actifs:</span>

          {/* Type Contrat badges */}
          {filters.typeContrat?.map((type) => (
            <Badge
              key={type}
              variant="secondary"
              className="bg-[#5F9598]/10 text-[#1D546D] hover:bg-[#5F9598]/20"
            >
              {type}
              <button
                onClick={() => removeFilter("typeContrat", type)}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {/* Specialites badges */}
          {filters.specialites?.map((spec) => (
            <Badge
              key={spec}
              variant="secondary"
              className="bg-[#5F9598]/10 text-[#1D546D] hover:bg-[#5F9598]/20"
            >
              {spec}
              <button
                onClick={() => removeFilter("specialites", spec)}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {/* Villes badges */}
          {filters.villes?.map((ville) => (
            <Badge
              key={ville}
              variant="secondary"
              className="bg-[#5F9598]/10 text-[#1D546D] hover:bg-[#5F9598]/20"
            >
              {ville}
              <button
                onClick={() => removeFilter("villes", ville)}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {/* Experience badge */}
          {filters.experienceMin !== undefined && (
            <Badge
              variant="secondary"
              className="bg-[#5F9598]/10 text-[#1D546D] hover:bg-[#5F9598]/20"
            >
              {EXPERIENCE_OPTIONS.find(
                (opt) => opt.value === filters.experienceMin?.toString()
              )?.label || `${filters.experienceMin}+ ans`}
              <button
                onClick={() => setExperienceFilter("")}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {/* Urgence badges */}
          {filters.urgence?.map((urg) => (
            <Badge
              key={urg}
              variant="secondary"
              className="bg-[#5F9598]/10 text-[#1D546D] hover:bg-[#5F9598]/20"
            >
              {urg}
              <button
                onClick={() => removeFilter("urgence", urg)}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {/* Clear all button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Tout effacer
          </Button>
        </div>
      )}
    </div>
  );
}