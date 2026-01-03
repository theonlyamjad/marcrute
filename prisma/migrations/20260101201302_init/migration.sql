-- AlterTable
ALTER TABLE "specialites" ADD COLUMN     "annees_experience" INTEGER,
ADD COLUMN     "id_categorie" INTEGER;

-- AlterTable
ALTER TABLE "specialites_requises" ADD COLUMN     "est_obligatoire" BOOLEAN DEFAULT true,
ADD COLUMN     "id_categorie" INTEGER,
ADD COLUMN     "niveau_requis" VARCHAR(50);

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

-- AddForeignKey
ALTER TABLE "specialites" ADD CONSTRAINT "specialites_id_categorie_fkey" FOREIGN KEY ("id_categorie") REFERENCES "categories_specialites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialites_institutions" ADD CONSTRAINT "specialites_institutions_id_institution_fkey" FOREIGN KEY ("id_institution") REFERENCES "institutions"("id_institution") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialites_institutions" ADD CONSTRAINT "specialites_institutions_id_categorie_fkey" FOREIGN KEY ("id_categorie") REFERENCES "categories_specialites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialites_requises" ADD CONSTRAINT "specialites_requises_id_categorie_fkey" FOREIGN KEY ("id_categorie") REFERENCES "categories_specialites"("id") ON DELETE SET NULL ON UPDATE CASCADE;
