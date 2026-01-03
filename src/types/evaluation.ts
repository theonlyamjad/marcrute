export interface Evaluation {
  idEvaluation: string;
  idTravailleur: string;
  idInstitution: string;
  note: number;
  commentaire: string | null;
  dateCreation: Date;
  institution: {
    idInstitution: string;
    nomInstitution: string;
    ville: {
      nomVille: string;
      region: {
        nomRegion: string;
      };
    };
    utilisateur?: {
      nomComplet: string;
      email: string;
    };
  };
  travailleur?: {
    idTravailleur: string;
    utilisateur: {
      nomComplet: string;
    };
  };
}

export interface EvaluationStats {
  total: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface EvaluationFilters {
  rating?: number;
  dateDebut?: Date;
  dateFin?: Date;
}

export interface TopEvaluator {
  institution: {
    idInstitution: string;
    nomInstitution: string;
    ville: {
      nomVille: string;
      region: {
        nomRegion: string;
      };
    };
  };
  evaluationCount: number;
  averageRating: number;
}