-- AlterTable
ALTER TABLE "administrateurs" ADD COLUMN     "id_super_admin" TEXT;

-- AlterTable
ALTER TABLE "validations" ADD COLUMN     "id_diplome" TEXT;

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

-- CreateIndex
CREATE UNIQUE INDEX "super_admins_id_utilisateur_key" ON "super_admins"("id_utilisateur");

-- AddForeignKey
ALTER TABLE "super_admins" ADD CONSTRAINT "super_admins_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "administrateurs" ADD CONSTRAINT "administrateurs_id_super_admin_fkey" FOREIGN KEY ("id_super_admin") REFERENCES "super_admins"("id_super_admin") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bans" ADD CONSTRAINT "bans_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bans" ADD CONSTRAINT "bans_id_administrateur_fkey" FOREIGN KEY ("id_administrateur") REFERENCES "administrateurs"("id_administrateur") ON DELETE RESTRICT ON UPDATE CASCADE;
