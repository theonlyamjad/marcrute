export interface Candidature {
  idCandidature: string;
  idTravailleur: string;
  idMission: string;
  dateCandidature: Date;
  statut: "En attente" | "Acceptée" | "Refusée" | "Annulée";
  messageTravailleur: string | null;
  dateReponse: Date | null;
  mission: {
    idMission: string;
    titre: string;
    typePublic: string | null;
    dateDebut: Date | null;
    dateFin: Date | null;
    urgence: string | null;
    institution: {
      nomInstitution: string;
      ville: {
        nomVille: string;
        region: {
          nomRegion: string;
        };
      };
    };
  };
  travailleur?: {
    idTravailleur: string;
    utilisateur: {
      nomComplet: string;
      email: string;
    };
  };
}

export interface CandidatureStats {
  total: number;
  enAttente: number;
  acceptee: number;
  refusee: number;
  annulee: number;
}

export interface CandidatureFilters {
  statut?: "En attente" | "Acceptée" | "Refusée" | "Annulée" | "all";
  dateDebut?: Date;
  dateFin?: Date;
}