export interface Worker {
  idTravailleur: string;
  idUtilisateur: string;
  idVille: string | null;
  biographie: string | null;
  anneesExperience: number | null;
  noteMoyenne: number | null;
  statutLabel: string | null;
  dateLabel: Date | null;
  dateCreation: Date;
  utilisateur?: {
    idUtilisateur: string;
    email: string;
    nomComplet: string;
    telephone: string | null;
    role: string;
    emailVerifie: boolean;
  };
  ville?: {
    idVille: string;
    nomVille: string;
    idRegion: string;
    region: {
      idRegion: string;
      nomRegion: string;
    };
  };
}

export interface WorkerExperience {
  idExperience: string;
  idTravailleur: string;
  titrePoste: string;
  organisation: string;
  description: string | null;
  dateDebut: Date;
  dateFin: Date | null;
  dureeMois: number | null;
}

export interface WorkerDiploma {
  idDiplome: string;
  idTravailleur: string;
  nomDiplome: string;
  nomInstitution: string | null;
  dateCreation: Date;
  cheminFichier: string | null;
  statut: string | null;
  dateVerification: Date | null;
}

export interface WorkerSpecialty {
  idSpecialite: string;
  idTravailleur: string;
  nomSpecialite: string;
  niveau: string | null;
  anneesExperience: number | null;
  idCategorie: number | null;
  categorie?: {
    id: number;
    name: string;
  };
}

export interface WorkerAvailability {
  idDisponibilite: string;
  idTravailleur: string;
  dateDisponible: Date;
  creneau: "Matin" | "Après-midi" | "Soir" | "Journée complète";
  estDisponible: boolean;
}

export interface WorkerProfile {
  worker: Worker;
  experiences: WorkerExperience[];
  diplomas: WorkerDiploma[];
  specialties: WorkerSpecialty[];
  availabilities: WorkerAvailability[];
}

export interface WorkerStats {
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  completedMissions: number;
  averageRating: number;
}