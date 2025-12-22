-- CreateTable
CREATE TABLE "utilisateurs" (
    "id_utilisateur" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" TIMESTAMP(3),
    "hash_mot_de_passe" TEXT,
    "role" TEXT NOT NULL,
    "nom_complet" TEXT,
    "telephone" TEXT,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modification" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id_utilisateur")
);

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
CREATE TABLE "travailleurs" (
    "id_travailleur" TEXT NOT NULL,
    "id_utilisateur" TEXT NOT NULL,
    "id_ville" TEXT,
    "biographie" TEXT,
    "annees_experience" INTEGER,
    "statut_label" TEXT,
    "date_label" TIMESTAMP(3),
    "note_moyenne" DECIMAL(3,2),
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "travailleurs_pkey" PRIMARY KEY ("id_travailleur")
);

-- CreateTable
CREATE TABLE "institutions" (
    "id_institution" TEXT NOT NULL,
    "id_utilisateur" TEXT NOT NULL,
    "id_ville" TEXT,
    "nom_institution" TEXT NOT NULL,
    "adresse" TEXT,
    "localisation" TEXT,
    "url" TEXT,
    "telephone_institution" TEXT,
    "site_web" TEXT,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id_institution")
);

-- CreateTable
CREATE TABLE "administrateurs" (
    "id_administrateur" TEXT NOT NULL,
    "id_utilisateur" TEXT NOT NULL,
    "permissions" TEXT,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "administrateurs_pkey" PRIMARY KEY ("id_administrateur")
);

-- CreateTable
CREATE TABLE "regions" (
    "id_region" TEXT NOT NULL,
    "nom_region" TEXT NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id_region")
);

-- CreateTable
CREATE TABLE "villes" (
    "id_ville" TEXT NOT NULL,
    "id_region" TEXT NOT NULL,
    "nom_ville" TEXT NOT NULL,
    "code_postal" TEXT,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "villes_pkey" PRIMARY KEY ("id_ville")
);

-- CreateTable
CREATE TABLE "experiences" (
    "id_experience" TEXT NOT NULL,
    "id_travailleur" TEXT NOT NULL,
    "titre_poste" TEXT,
    "organisation" TEXT,
    "description" TEXT,
    "duree_mois" INTEGER,
    "date_debut" TIMESTAMP(3),
    "date_fin" TIMESTAMP(3),

    CONSTRAINT "experiences_pkey" PRIMARY KEY ("id_experience")
);

-- CreateTable
CREATE TABLE "diplomes" (
    "id_diplome" TEXT NOT NULL,
    "id_travailleur" TEXT NOT NULL,
    "nom_diplome" TEXT NOT NULL,
    "nom_institution" TEXT,
    "chemin_fichier" TEXT,
    "statut" TEXT,
    "date_verification" TIMESTAMP(3),
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diplomes_pkey" PRIMARY KEY ("id_diplome")
);

-- CreateTable
CREATE TABLE "specialites" (
    "id_specialite" TEXT NOT NULL,
    "id_travailleur" TEXT NOT NULL,
    "nom_specialite" TEXT NOT NULL,
    "niveau" TEXT,

    CONSTRAINT "specialites_pkey" PRIMARY KEY ("id_specialite")
);

-- CreateTable
CREATE TABLE "disponibilites" (
    "id_disponibilite" TEXT NOT NULL,
    "id_travailleur" TEXT NOT NULL,
    "date_disponible" DATE NOT NULL,
    "creneau" TEXT NOT NULL,
    "est_disponible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "disponibilites_pkey" PRIMARY KEY ("id_disponibilite")
);

-- CreateTable
CREATE TABLE "missions" (
    "id_mission" TEXT NOT NULL,
    "id_institution" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "type_public" TEXT,
    "date_debut" TIMESTAMP(3),
    "date_fin" TIMESTAMP(3),
    "urgence" TEXT,
    "statut" TEXT NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "missions_pkey" PRIMARY KEY ("id_mission")
);

-- CreateTable
CREATE TABLE "specialites_requises" (
    "id_specialite_requise" TEXT NOT NULL,
    "id_mission" TEXT NOT NULL,
    "specialite_requise" TEXT NOT NULL,
    "annees_experience_min" INTEGER,

    CONSTRAINT "specialites_requises_pkey" PRIMARY KEY ("id_specialite_requise")
);

-- CreateTable
CREATE TABLE "candidatures" (
    "id_candidature" TEXT NOT NULL,
    "id_travailleur" TEXT NOT NULL,
    "id_mission" TEXT NOT NULL,
    "date_candidature" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" TEXT NOT NULL,
    "message_travailleur" TEXT,
    "date_reponse" TIMESTAMP(3),

    CONSTRAINT "candidatures_pkey" PRIMARY KEY ("id_candidature")
);

-- CreateTable
CREATE TABLE "evaluations" (
    "id_evaluation" TEXT NOT NULL,
    "id_travailleur" TEXT NOT NULL,
    "id_institution" TEXT NOT NULL,
    "note" INTEGER NOT NULL,
    "commentaire" TEXT,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id_evaluation")
);

-- CreateTable
CREATE TABLE "validations" (
    "id_validation" TEXT NOT NULL,
    "id_administrateur" TEXT NOT NULL,
    "id_travailleur" TEXT,
    "id_institution" TEXT,
    "id_mission" TEXT,
    "type_validation" TEXT NOT NULL,
    "statut" TEXT NOT NULL,
    "notes" TEXT,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "validations_pkey" PRIMARY KEY ("id_validation")
);

-- CreateTable
CREATE TABLE "signalements" (
    "id_signalement" TEXT NOT NULL,
    "id_administrateur" TEXT,
    "id_travailleur_emetteur" TEXT,
    "id_institution_emetteur" TEXT,
    "id_travailleur_concerne" TEXT,
    "id_institution_concerne" TEXT,
    "motif" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "statut" TEXT NOT NULL,
    "date_signalement" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_traitement" TIMESTAMP(3),
    "reponse_admin" TEXT,

    CONSTRAINT "signalements_pkey" PRIMARY KEY ("id_signalement")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "travailleurs_id_utilisateur_key" ON "travailleurs"("id_utilisateur");

-- CreateIndex
CREATE UNIQUE INDEX "institutions_id_utilisateur_key" ON "institutions"("id_utilisateur");

-- CreateIndex
CREATE UNIQUE INDEX "administrateurs_id_utilisateur_key" ON "administrateurs"("id_utilisateur");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "villes" ADD CONSTRAINT "villes_id_region_fkey" FOREIGN KEY ("id_region") REFERENCES "regions"("id_region") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_id_travailleur_fkey" FOREIGN KEY ("id_travailleur") REFERENCES "travailleurs"("id_travailleur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diplomes" ADD CONSTRAINT "diplomes_id_travailleur_fkey" FOREIGN KEY ("id_travailleur") REFERENCES "travailleurs"("id_travailleur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialites" ADD CONSTRAINT "specialites_id_travailleur_fkey" FOREIGN KEY ("id_travailleur") REFERENCES "travailleurs"("id_travailleur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilites" ADD CONSTRAINT "disponibilites_id_travailleur_fkey" FOREIGN KEY ("id_travailleur") REFERENCES "travailleurs"("id_travailleur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "missions_id_institution_fkey" FOREIGN KEY ("id_institution") REFERENCES "institutions"("id_institution") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialites_requises" ADD CONSTRAINT "specialites_requises_id_mission_fkey" FOREIGN KEY ("id_mission") REFERENCES "missions"("id_mission") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidatures" ADD CONSTRAINT "candidatures_id_travailleur_fkey" FOREIGN KEY ("id_travailleur") REFERENCES "travailleurs"("id_travailleur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidatures" ADD CONSTRAINT "candidatures_id_mission_fkey" FOREIGN KEY ("id_mission") REFERENCES "missions"("id_mission") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_id_travailleur_fkey" FOREIGN KEY ("id_travailleur") REFERENCES "travailleurs"("id_travailleur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_id_institution_fkey" FOREIGN KEY ("id_institution") REFERENCES "institutions"("id_institution") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validations" ADD CONSTRAINT "validations_id_administrateur_fkey" FOREIGN KEY ("id_administrateur") REFERENCES "administrateurs"("id_administrateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validations" ADD CONSTRAINT "validations_id_travailleur_fkey" FOREIGN KEY ("id_travailleur") REFERENCES "travailleurs"("id_travailleur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validations" ADD CONSTRAINT "validations_id_institution_fkey" FOREIGN KEY ("id_institution") REFERENCES "institutions"("id_institution") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validations" ADD CONSTRAINT "validations_id_mission_fkey" FOREIGN KEY ("id_mission") REFERENCES "missions"("id_mission") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signalements" ADD CONSTRAINT "signalements_id_administrateur_fkey" FOREIGN KEY ("id_administrateur") REFERENCES "administrateurs"("id_administrateur") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signalements" ADD CONSTRAINT "signalements_id_travailleur_emetteur_fkey" FOREIGN KEY ("id_travailleur_emetteur") REFERENCES "travailleurs"("id_travailleur") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signalements" ADD CONSTRAINT "signalements_id_institution_emetteur_fkey" FOREIGN KEY ("id_institution_emetteur") REFERENCES "institutions"("id_institution") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signalements" ADD CONSTRAINT "signalements_id_travailleur_concerne_fkey" FOREIGN KEY ("id_travailleur_concerne") REFERENCES "travailleurs"("id_travailleur") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signalements" ADD CONSTRAINT "signalements_id_institution_concerne_fkey" FOREIGN KEY ("id_institution_concerne") REFERENCES "institutions"("id_institution") ON DELETE SET NULL ON UPDATE CASCADE;
