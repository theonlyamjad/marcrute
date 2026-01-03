export interface Mission {
  idMission: string;
  idInstitution: string;
  titre: string;
  description: string | null;
  typePublic: string | null;
  dateDebut: Date | null;
  dateFin: Date | null;
  urgence: string | null;
  statut: string;
  dateCreation: Date;
  institution: {
    nomInstitution: string;
    ville: {
      nomVille: string;
      region: {
        nomRegion: string;
      };
    } | null;
  };
  specialitesRequises: SpecialiteRequise[];
}

export interface SpecialiteRequise {
  idSpecialiteRequise: string;
  idMission: string;
  specialiteRequise: string;
  anneesExperienceMin: number | null;
}

export interface MissionFilters {
  search?: string;
  typeContrat?: string[];
  specialites?: string[];
  villes?: string[];
  experienceMin?: number;
  urgence?: string[];
}

export interface FilterOption {
  value: string;
  label: string;
}