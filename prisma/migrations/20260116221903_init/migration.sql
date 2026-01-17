/*
  Warnings:

  - The primary key for the `administrateurs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `candidatures` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `diplomes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `disponibilites` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `evaluations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `experiences` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `institutions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `missions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `regions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `signalements` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `specialites` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `specialites_requises` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `travailleurs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `utilisateurs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `validations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `villes` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "administrateurs" DROP CONSTRAINT "administrateurs_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "candidatures" DROP CONSTRAINT "candidatures_id_mission_fkey";

-- DropForeignKey
ALTER TABLE "candidatures" DROP CONSTRAINT "candidatures_id_travailleur_fkey";

-- DropForeignKey
ALTER TABLE "diplomes" DROP CONSTRAINT "diplomes_id_travailleur_fkey";

-- DropForeignKey
ALTER TABLE "disponibilites" DROP CONSTRAINT "disponibilites_id_travailleur_fkey";

-- DropForeignKey
ALTER TABLE "evaluations" DROP CONSTRAINT "evaluations_id_institution_fkey";

-- DropForeignKey
ALTER TABLE "evaluations" DROP CONSTRAINT "evaluations_id_travailleur_fkey";

-- DropForeignKey
ALTER TABLE "experiences" DROP CONSTRAINT "experiences_id_travailleur_fkey";

-- DropForeignKey
ALTER TABLE "institutions" DROP CONSTRAINT "institutions_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "institutions" DROP CONSTRAINT "institutions_id_ville_fkey";

-- DropForeignKey
ALTER TABLE "missions" DROP CONSTRAINT "missions_id_institution_fkey";

-- DropForeignKey
ALTER TABLE "signalements" DROP CONSTRAINT "signalements_id_administrateur_fkey";

-- DropForeignKey
ALTER TABLE "signalements" DROP CONSTRAINT "signalements_id_institution_concerne_fkey";

-- DropForeignKey
ALTER TABLE "signalements" DROP CONSTRAINT "signalements_id_institution_emetteur_fkey";

-- DropForeignKey
ALTER TABLE "signalements" DROP CONSTRAINT "signalements_id_travailleur_concerne_fkey";

-- DropForeignKey
ALTER TABLE "signalements" DROP CONSTRAINT "signalements_id_travailleur_emetteur_fkey";

-- DropForeignKey
ALTER TABLE "specialites" DROP CONSTRAINT "specialites_id_travailleur_fkey";

-- DropForeignKey
ALTER TABLE "specialites_requises" DROP CONSTRAINT "specialites_requises_id_mission_fkey";

-- DropForeignKey
ALTER TABLE "travailleurs" DROP CONSTRAINT "travailleurs_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "travailleurs" DROP CONSTRAINT "travailleurs_id_ville_fkey";

-- DropForeignKey
ALTER TABLE "validations" DROP CONSTRAINT "validations_id_administrateur_fkey";

-- DropForeignKey
ALTER TABLE "validations" DROP CONSTRAINT "validations_id_institution_fkey";

-- DropForeignKey
ALTER TABLE "validations" DROP CONSTRAINT "validations_id_mission_fkey";

-- DropForeignKey
ALTER TABLE "validations" DROP CONSTRAINT "validations_id_travailleur_fkey";

-- DropForeignKey
ALTER TABLE "villes" DROP CONSTRAINT "villes_id_region_fkey";

-- AlterTable
ALTER TABLE "administrateurs" DROP CONSTRAINT "administrateurs_pkey",
ADD COLUMN     "id_super_admin" TEXT,
ALTER COLUMN "id_administrateur" DROP DEFAULT,
ALTER COLUMN "id_administrateur" SET DATA TYPE TEXT,
ALTER COLUMN "id_utilisateur" SET DATA TYPE TEXT,
ADD CONSTRAINT "administrateurs_pkey" PRIMARY KEY ("id_administrateur");
DROP SEQUENCE "administrateurs_id_administrateur_seq";

-- AlterTable
ALTER TABLE "candidatures" DROP CONSTRAINT "candidatures_pkey",
ALTER COLUMN "id_candidature" DROP DEFAULT,
ALTER COLUMN "id_candidature" SET DATA TYPE TEXT,
ALTER COLUMN "id_travailleur" SET DATA TYPE TEXT,
ALTER COLUMN "id_mission" SET DATA TYPE TEXT,
ADD CONSTRAINT "candidatures_pkey" PRIMARY KEY ("id_candidature");
DROP SEQUENCE "candidatures_id_candidature_seq";

-- AlterTable
ALTER TABLE "diplomes" DROP CONSTRAINT "diplomes_pkey",
ALTER COLUMN "id_diplome" DROP DEFAULT,
ALTER COLUMN "id_diplome" SET DATA TYPE TEXT,
ALTER COLUMN "id_travailleur" SET DATA TYPE TEXT,
ADD CONSTRAINT "diplomes_pkey" PRIMARY KEY ("id_diplome");
DROP SEQUENCE "diplomes_id_diplome_seq";

-- AlterTable
ALTER TABLE "disponibilites" DROP CONSTRAINT "disponibilites_pkey",
ALTER COLUMN "id_disponibilite" DROP DEFAULT,
ALTER COLUMN "id_disponibilite" SET DATA TYPE TEXT,
ALTER COLUMN "id_travailleur" SET DATA TYPE TEXT,
ADD CONSTRAINT "disponibilites_pkey" PRIMARY KEY ("id_disponibilite");
DROP SEQUENCE "disponibilites_id_disponibilite_seq";

-- AlterTable
ALTER TABLE "evaluations" DROP CONSTRAINT "evaluations_pkey",
ALTER COLUMN "id_evaluation" DROP DEFAULT,
ALTER COLUMN "id_evaluation" SET DATA TYPE TEXT,
ALTER COLUMN "id_travailleur" SET DATA TYPE TEXT,
ALTER COLUMN "id_institution" SET DATA TYPE TEXT,
ADD CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id_evaluation");
DROP SEQUENCE "evaluations_id_evaluation_seq";

-- AlterTable
ALTER TABLE "experiences" DROP CONSTRAINT "experiences_pkey",
ALTER COLUMN "id_experience" DROP DEFAULT,
ALTER COLUMN "id_experience" SET DATA TYPE TEXT,
ALTER COLUMN "id_travailleur" SET DATA TYPE TEXT,
ADD CONSTRAINT "experiences_pkey" PRIMARY KEY ("id_experience");
DROP SEQUENCE "experiences_id_experience_seq";

-- AlterTable
ALTER TABLE "institutions" DROP CONSTRAINT "institutions_pkey",
ALTER COLUMN "id_institution" DROP DEFAULT,
ALTER COLUMN "id_institution" SET DATA TYPE TEXT,
ALTER COLUMN "id_utilisateur" SET DATA TYPE TEXT,
ALTER COLUMN "id_ville" SET DATA TYPE TEXT,
ADD CONSTRAINT "institutions_pkey" PRIMARY KEY ("id_institution");
DROP SEQUENCE "institutions_id_institution_seq";

-- AlterTable
ALTER TABLE "missions" DROP CONSTRAINT "missions_pkey",
ALTER COLUMN "id_mission" DROP DEFAULT,
ALTER COLUMN "id_mission" SET DATA TYPE TEXT,
ALTER COLUMN "id_institution" SET DATA TYPE TEXT,
ADD CONSTRAINT "missions_pkey" PRIMARY KEY ("id_mission");
DROP SEQUENCE "missions_id_mission_seq";

-- AlterTable
ALTER TABLE "regions" DROP CONSTRAINT "regions_pkey",
ALTER COLUMN "id_region" DROP DEFAULT,
ALTER COLUMN "id_region" SET DATA TYPE TEXT,
ADD CONSTRAINT "regions_pkey" PRIMARY KEY ("id_region");
DROP SEQUENCE "regions_id_region_seq";

-- AlterTable
ALTER TABLE "signalements" DROP CONSTRAINT "signalements_pkey",
ALTER COLUMN "id_signalement" DROP DEFAULT,
ALTER COLUMN "id_signalement" SET DATA TYPE TEXT,
ALTER COLUMN "id_administrateur" SET DATA TYPE TEXT,
ALTER COLUMN "id_travailleur_emetteur" SET DATA TYPE TEXT,
ALTER COLUMN "id_institution_emetteur" SET DATA TYPE TEXT,
ALTER COLUMN "id_travailleur_concerne" SET DATA TYPE TEXT,
ALTER COLUMN "id_institution_concerne" SET DATA TYPE TEXT,
ADD CONSTRAINT "signalements_pkey" PRIMARY KEY ("id_signalement");
DROP SEQUENCE "signalements_id_signalement_seq";

-- AlterTable
ALTER TABLE "specialites" DROP CONSTRAINT "specialites_pkey",
ADD COLUMN     "annees_experience" INTEGER,
ADD COLUMN     "id_categorie" INTEGER,
ALTER COLUMN "id_specialite" DROP DEFAULT,
ALTER COLUMN "id_specialite" SET DATA TYPE TEXT,
ALTER COLUMN "id_travailleur" SET DATA TYPE TEXT,
ADD CONSTRAINT "specialites_pkey" PRIMARY KEY ("id_specialite");
DROP SEQUENCE "specialites_id_specialite_seq";

-- AlterTable
ALTER TABLE "specialites_requises" DROP CONSTRAINT "specialites_requises_pkey",
ADD COLUMN     "est_obligatoire" BOOLEAN DEFAULT true,
ADD COLUMN     "id_categorie" INTEGER,
ADD COLUMN     "niveau_requis" VARCHAR(50),
ALTER COLUMN "id_specialite_requise" DROP DEFAULT,
ALTER COLUMN "id_specialite_requise" SET DATA TYPE TEXT,
ALTER COLUMN "id_mission" SET DATA TYPE TEXT,
ADD CONSTRAINT "specialites_requises_pkey" PRIMARY KEY ("id_specialite_requise");
DROP SEQUENCE "specialites_requises_id_specialite_requise_seq";

-- AlterTable
ALTER TABLE "travailleurs" DROP CONSTRAINT "travailleurs_pkey",
ALTER COLUMN "id_travailleur" DROP DEFAULT,
ALTER COLUMN "id_travailleur" SET DATA TYPE TEXT,
ALTER COLUMN "id_utilisateur" SET DATA TYPE TEXT,
ALTER COLUMN "id_ville" SET DATA TYPE TEXT,
ADD CONSTRAINT "travailleurs_pkey" PRIMARY KEY ("id_travailleur");
DROP SEQUENCE "travailleurs_id_travailleur_seq";

-- AlterTable
ALTER TABLE "utilisateurs" DROP CONSTRAINT "utilisateurs_pkey",
ADD COLUMN     "email_verified" TIMESTAMP(3),
ADD COLUMN     "nom" TEXT,
ADD COLUMN     "prenom" TEXT,
ALTER COLUMN "id_utilisateur" DROP DEFAULT,
ALTER COLUMN "id_utilisateur" SET DATA TYPE TEXT,
ALTER COLUMN "hash_mot_de_passe" DROP NOT NULL,
ADD CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id_utilisateur");
DROP SEQUENCE "utilisateurs_id_utilisateur_seq";

-- AlterTable
ALTER TABLE "validations" DROP CONSTRAINT "validations_pkey",
ADD COLUMN     "id_diplome" TEXT,
ALTER COLUMN "id_validation" DROP DEFAULT,
ALTER COLUMN "id_validation" SET DATA TYPE TEXT,
ALTER COLUMN "id_administrateur" SET DATA TYPE TEXT,
ALTER COLUMN "id_travailleur" SET DATA TYPE TEXT,
ALTER COLUMN "id_institution" SET DATA TYPE TEXT,
ALTER COLUMN "id_mission" SET DATA TYPE TEXT,
ADD CONSTRAINT "validations_pkey" PRIMARY KEY ("id_validation");
DROP SEQUENCE "validations_id_validation_seq";

-- AlterTable
ALTER TABLE "villes" DROP CONSTRAINT "villes_pkey",
ALTER COLUMN "id_ville" DROP DEFAULT,
ALTER COLUMN "id_ville" SET DATA TYPE TEXT,
ALTER COLUMN "id_region" SET DATA TYPE TEXT,
ADD CONSTRAINT "villes_pkey" PRIMARY KEY ("id_ville");
DROP SEQUENCE "villes_id_ville_seq";

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "super_admins" (
    "id_super_admin" TEXT NOT NULL,
    "id_utilisateur" TEXT NOT NULL,
    "permissions" TEXT,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "super_admins_pkey" PRIMARY KEY ("id_super_admin")
);

-- CreateTable
CREATE TABLE "bans" (
    "id_ban" TEXT NOT NULL,
    "id_utilisateur" TEXT NOT NULL,
    "id_administrateur" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duree_type" TEXT NOT NULL,
    "duree_valeur" INTEGER,
    "date_ban" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_expiration" TIMESTAMP(3),
    "est_actif" BOOLEAN NOT NULL DEFAULT true,
    "date_desactivation" TIMESTAMP(3),

    CONSTRAINT "bans_pkey" PRIMARY KEY ("id_ban")
);

-- CreateTable
CREATE TABLE "categories_specialites" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_specialites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialites_institutions" (
    "id_specialite" TEXT NOT NULL,
    "id_institution" TEXT NOT NULL,
    "id_categorie" INTEGER NOT NULL,
    "est_principale" BOOLEAN NOT NULL DEFAULT false,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "specialites_institutions_pkey" PRIMARY KEY ("id_specialite")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "super_admins_id_utilisateur_key" ON "super_admins"("id_utilisateur");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "super_admins" ADD CONSTRAINT "super_admins_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travailleurs" ADD CONSTRAINT "travailleurs_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travailleurs" ADD CONSTRAINT "travailleurs_id_ville_fkey" FOREIGN KEY ("id_ville") REFERENCES "villes"("id_ville") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institutions" ADD CONSTRAINT "institutions_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institutions" ADD CONSTRAINT "institutions_id_ville_fkey" FOREIGN KEY ("id_ville") REFERENCES "villes"("id_ville") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "administrateurs" ADD CONSTRAINT "administrateurs_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "administrateurs" ADD CONSTRAINT "administrateurs_id_super_admin_fkey" FOREIGN KEY ("id_super_admin") REFERENCES "super_admins"("id_super_admin") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bans" ADD CONSTRAINT "bans_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bans" ADD CONSTRAINT "bans_id_administrateur_fkey" FOREIGN KEY ("id_administrateur") REFERENCES "administrateurs"("id_administrateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "villes" ADD CONSTRAINT "villes_id_region_fkey" FOREIGN KEY ("id_region") REFERENCES "regions"("id_region") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_id_travailleur_fkey" FOREIGN KEY ("id_travailleur") REFERENCES "travailleurs"("id_travailleur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diplomes" ADD CONSTRAINT "diplomes_id_travailleur_fkey" FOREIGN KEY ("id_travailleur") REFERENCES "travailleurs"("id_travailleur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialites" ADD CONSTRAINT "specialites_id_travailleur_fkey" FOREIGN KEY ("id_travailleur") REFERENCES "travailleurs"("id_travailleur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialites" ADD CONSTRAINT "specialites_id_categorie_fkey" FOREIGN KEY ("id_categorie") REFERENCES "categories_specialites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialites_institutions" ADD CONSTRAINT "specialites_institutions_id_institution_fkey" FOREIGN KEY ("id_institution") REFERENCES "institutions"("id_institution") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialites_institutions" ADD CONSTRAINT "specialites_institutions_id_categorie_fkey" FOREIGN KEY ("id_categorie") REFERENCES "categories_specialites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilites" ADD CONSTRAINT "disponibilites_id_travailleur_fkey" FOREIGN KEY ("id_travailleur") REFERENCES "travailleurs"("id_travailleur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "missions_id_institution_fkey" FOREIGN KEY ("id_institution") REFERENCES "institutions"("id_institution") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialites_requises" ADD CONSTRAINT "specialites_requises_id_mission_fkey" FOREIGN KEY ("id_mission") REFERENCES "missions"("id_mission") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialites_requises" ADD CONSTRAINT "specialites_requises_id_categorie_fkey" FOREIGN KEY ("id_categorie") REFERENCES "categories_specialites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidatures" ADD CONSTRAINT "candidatures_id_mission_fkey" FOREIGN KEY ("id_mission") REFERENCES "missions"("id_mission") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidatures" ADD CONSTRAINT "candidatures_id_travailleur_fkey" FOREIGN KEY ("id_travailleur") REFERENCES "travailleurs"("id_travailleur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_id_institution_fkey" FOREIGN KEY ("id_institution") REFERENCES "institutions"("id_institution") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_id_travailleur_fkey" FOREIGN KEY ("id_travailleur") REFERENCES "travailleurs"("id_travailleur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validations" ADD CONSTRAINT "validations_id_administrateur_fkey" FOREIGN KEY ("id_administrateur") REFERENCES "administrateurs"("id_administrateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validations" ADD CONSTRAINT "validations_id_institution_fkey" FOREIGN KEY ("id_institution") REFERENCES "institutions"("id_institution") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validations" ADD CONSTRAINT "validations_id_mission_fkey" FOREIGN KEY ("id_mission") REFERENCES "missions"("id_mission") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validations" ADD CONSTRAINT "validations_id_travailleur_fkey" FOREIGN KEY ("id_travailleur") REFERENCES "travailleurs"("id_travailleur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signalements" ADD CONSTRAINT "signalements_id_administrateur_fkey" FOREIGN KEY ("id_administrateur") REFERENCES "administrateurs"("id_administrateur") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signalements" ADD CONSTRAINT "signalements_id_institution_concerne_fkey" FOREIGN KEY ("id_institution_concerne") REFERENCES "institutions"("id_institution") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signalements" ADD CONSTRAINT "signalements_id_institution_emetteur_fkey" FOREIGN KEY ("id_institution_emetteur") REFERENCES "institutions"("id_institution") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signalements" ADD CONSTRAINT "signalements_id_travailleur_concerne_fkey" FOREIGN KEY ("id_travailleur_concerne") REFERENCES "travailleurs"("id_travailleur") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signalements" ADD CONSTRAINT "signalements_id_travailleur_emetteur_fkey" FOREIGN KEY ("id_travailleur_emetteur") REFERENCES "travailleurs"("id_travailleur") ON DELETE SET NULL ON UPDATE CASCADE;
