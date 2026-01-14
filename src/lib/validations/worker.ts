// src/lib/validations/worker.ts
import { z } from "zod";

// ========================================
// PROFILE VALIDATIONS
// ========================================

export const updateProfileSchema = z.object({
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères").max(50).optional(),
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(50).optional(),
  telephone: z.string().regex(/^(\+212|0)[5-7]\d{8}$/,"Le numéro doit commencer par +212 ou 0, suivi de 5/6/7 et 8 chiffres").optional(),
  idVille: z.string().optional().nullable(),
  biographie: z.string().max(1000, "La biographie ne doit pas dépasser 1000 caractères").optional().nullable(),
  anneesExperience: z.number().int().min(0).max(50).optional().nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ========================================
// SPECIALITY VALIDATIONS
// ========================================

export const addSpecialitySchema = z.object({
  idCategorie: z.number().int().min(1).max(20, "Catégorie invalide"),
  niveau: z.enum(["Débutant", "Intermédiaire", "Avancé", "Expert"]).optional().nullable(),
  anneesExperience: z.number().int().min(0).max(50).optional().nullable(),
});

export const deleteSpecialitySchema = z.object({
  idSpecialite: z.string().cuid(),
});

export type AddSpecialityInput = z.infer<typeof addSpecialitySchema>;
export type DeleteSpecialityInput = z.infer<typeof deleteSpecialitySchema>;

// ========================================
// EXPERIENCE VALIDATIONS
// ========================================

export const addExperienceSchema = z.object({
  titrePoste: z.string().min(2, "Le titre du poste est requis").max(100),
  organisation: z.string().min(2, "Le nom de l'organisation est requis").max(100),
  description: z.string().max(500, "La description ne doit pas dépasser 500 caractères").optional().nullable(),
  dateDebut: z.date(),
  dateFin: z.date().optional().nullable(),
  dureeMois: z.number().int().min(1).optional().nullable(),
}).refine(
  (data) => {
    if (data.dateFin && data.dateDebut) {
      return data.dateFin >= data.dateDebut;
    }
    return true;
  },
  {
    message: "La date de fin doit être après la date de début",
    path: ["dateFin"],
  }
);

export const updateExperienceSchema = z.object({
  idExperience: z.string().cuid(),
  titrePoste: z.string().min(2).max(100).optional(),
  organisation: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  dateDebut: z.date().optional(),
  dateFin: z.date().optional().nullable(),
  dureeMois: z.number().int().min(1).optional().nullable(),
});

export const deleteExperienceSchema = z.object({
  idExperience: z.string().cuid(),
});

export type AddExperienceInput = z.infer<typeof addExperienceSchema>;
export type UpdateExperienceInput = z.infer<typeof updateExperienceSchema>;
export type DeleteExperienceInput = z.infer<typeof deleteExperienceSchema>;

// ========================================
// DIPLOMA VALIDATIONS
// ========================================

export const addDiplomaSchema = z.object({
  nomDiplome: z.string().min(2, "Le nom du diplôme est requis").max(100),
  nomInstitution: z.string().min(2, "Le nom de l'institution est requis").max(100),
  cheminFichier: z.string().min(1).optional().nullable()
});

export const deleteDiplomaSchema = z.object({
  idDiplome: z.string().cuid(),
});

export type AddDiplomaInput = z.infer<typeof addDiplomaSchema>;
export type DeleteDiplomaInput = z.infer<typeof deleteDiplomaSchema>;

// ========================================
// AVAILABILITY VALIDATIONS
// ========================================

export const addAvailabilitySchema = z.object({
  dateDisponible: z.date(),
  creneau: z.enum(["Matin", "Après-midi", "Soir", "Journée complète"]),
  estDisponible: z.boolean().default(true),
});

export const updateAvailabilitySchema = z.object({
  idDisponibilite: z.string().cuid(),
  dateDisponible: z.date().optional(),
  creneau: z.enum(["Matin", "Après-midi", "Soir", "Journée complète"]).optional(),
  estDisponible: z.boolean().optional(),
});

export const deleteAvailabilitySchema = z.object({
  idDisponibilite: z.string().cuid(),
});

export type AddAvailabilityInput = z.infer<typeof addAvailabilitySchema>;
export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;
export type DeleteAvailabilityInput = z.infer<typeof deleteAvailabilitySchema>;

// ========================================
// APPLICATION VALIDATIONS
// ========================================

export const createApplicationSchema = z.object({
  idMission: z.string().cuid(),
});

export const cancelApplicationSchema = z.object({
  idCandidature: z.string().cuid(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type CancelApplicationInput = z.infer<typeof cancelApplicationSchema>;

// ========================================
// MISSION FILTERS
// ========================================

export const missionFiltersSchema = z.object({
  idVille: z.string().optional(),
  idCategorie: z.number().int().optional(),
  urgence: z.enum(["Normale", "Haute", "Urgente"]).optional(),
  dateDebut: z.date().optional(),
  dateFin: z.date().optional(),
});

export type MissionFilters = z.infer<typeof missionFiltersSchema>;