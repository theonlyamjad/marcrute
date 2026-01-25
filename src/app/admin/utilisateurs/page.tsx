"use client";

import React, { useState, useEffect } from "react";
import { SidebarInset } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Search,
  Trash2,
  Ban as BanIcon,
  ShieldAlert,
} from "lucide-react";
import { getAllUsers, deleteUser } from "@/actions/admin/utilisateurs";
import { createBan, checkUserBanStatus } from "@/actions/admin/bans";
import { toast } from "sonner";

export default function AdminUtilisateurs() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  // Ban dialog state
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [banData, setBanData] = useState({
    titre: "",
    description: "",
    dureeType: "days" as "hours" | "days" | "months" | "years" | "permanent",
    dureeValeur: 1,
  });
  const [banning, setBanning] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await getAllUsers({
        search: search || undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
        page,
        limit: 20,
      });

      if (result.success && result.data) {
        // Check ban status for each user
        const usersWithBanStatus = await Promise.all(
          result.data.map(async (user: any) => {
            const banStatus = await checkUserBanStatus(user.id);
            return {
              ...user,
              isBanned: banStatus.isBanned || false,
              banInfo: banStatus.data || null,
            };
          }),
        );
        setUsers(usersWithBanStatus);
        setPagination(result.pagination);
      } else {
        toast.error(result.error || "Erreur lors du chargement");
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des utilisateurs");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, roleFilter]);

  const handleSearch = () => {
    setPage(1);
    loadUsers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      return;
    }

    const result = await deleteUser(id);
    if (result.success) {
      toast.success("Utilisateur supprimé");
      loadUsers();
    } else {
      toast.error(result.error || "Erreur lors de la suppression");
    }
  };

  const handleOpenBanDialog = (user: any) => {
    setSelectedUser(user);
    setBanData({
      titre: "",
      description: "",
      dureeType: "days",
      dureeValeur: 1,
    });
    setBanDialogOpen(true);
  };

  const handleBanUser = async () => {
    if (!selectedUser) return;

    if (!banData.titre.trim()) {
      toast.error("Le titre est requis");
      return;
    }

    if (!banData.description.trim()) {
      toast.error("La description est requise");
      return;
    }

    if (
      banData.dureeType !== "permanent" &&
      (!banData.dureeValeur || banData.dureeValeur <= 0)
    ) {
      toast.error("La durée doit être supérieure à 0");
      return;
    }

    setBanning(true);
    try {
      const result = await createBan({
        idUtilisateur: selectedUser.id,
        titre: banData.titre,
        description: banData.description,
        dureeType: banData.dureeType,
        dureeValeur:
          banData.dureeType === "permanent" ? undefined : banData.dureeValeur,
      });

      if (result.success) {
        toast.success("Utilisateur banni avec succès");
        setBanDialogOpen(false);
        loadUsers();
      } else {
        toast.error(result.error || "Erreur lors du bannissement");
      }
    } catch (error) {
      toast.error("Erreur lors du bannissement");
      console.error(error);
    } finally {
      setBanning(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, string> = {
      Travailleur: "bg-blue-100 text-blue-800",
      Institution: "bg-green-100 text-green-800",
      Administrateur: "bg-purple-100 text-purple-800",
    };
    return (
      <Badge className={variants[role] || "bg-gray-100 text-gray-800"}>
        {role}
      </Badge>
    );
  };

  const getDurationLabel = (type: string) => {
    const labels: Record<string, string> = {
      hours: "Heures",
      days: "Jours",
      months: "Mois",
      years: "Années",
      permanent: "Permanent",
    };
    return labels[type] || type;
  };

  return (
    <SidebarInset>
      <div className="flex flex-1 flex-col p-6 md:p-8 space-y-6 bg-[#F3F4F4]">
        <div className="bg-[#1D546D] rounded-xl p-6 shadow-lg">
          <h1 className="text-3xl font-bold text-white mb-2">
            Gestion des utilisateurs
          </h1>
          <p className="text-[#F3F4F4] text-opacity-90">
            Gérer tous les utilisateurs de la plateforme
          </p>
        </div>

        <Card className="border-none shadow-lg bg-white">
          <CardHeader>
            <CardTitle>Recherche et filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Rechercher par nom ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Tous les rôles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="Travailleur">Travailleur</SelectItem>
                  <SelectItem value="Institution">Institution</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Rechercher
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white">
          <CardHeader>
            <CardTitle>Liste des utilisateurs</CardTitle>
            <CardDescription>
              {pagination && `Total: ${pagination.total} utilisateur(s)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#1D546D]" />
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Téléphone</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date création</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length > 0 ? (
                        users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              {user.nomComplet || "N/A"}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                            <TableCell>{user.telephone || "N/A"}</TableCell>
                            <TableCell>
                              {user.isBanned ? (
                                <Badge className="bg-red-100 text-red-800 border-red-200">
                                  <ShieldAlert className="h-3 w-3 mr-1" />
                                  Banni
                                </Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  Actif
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {new Date(user.dateCreation).toLocaleDateString(
                                "fr-FR",
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenBanDialog(user)}
                                  disabled={
                                    user.isBanned || user.role === "Admin"
                                  }
                                  title={
                                    user.isBanned
                                      ? "Utilisateur déjà banni"
                                      : user.role === "Admin"
                                        ? "Impossible de bannir un admin"
                                        : "Bannir l'utilisateur"
                                  }
                                >
                                  <BanIcon className="h-4 w-4 text-orange-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(user.id)}
                                  disabled={user.role === "Admin"}
                                  title={
                                    user.role === "Admin"
                                      ? "Impossible de supprimer un admin"
                                      : "Supprimer l'utilisateur"
                                  }
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-8 text-[#5F9598]"
                          >
                            Aucun utilisateur trouvé
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-[#5F9598]">
                      Page {pagination.page} sur {pagination.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Précédent
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPage((p) => Math.min(pagination.totalPages, p + 1))
                        }
                        disabled={page === pagination.totalPages}
                      >
                        Suivant
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ban Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>Bannir l'utilisateur</DialogTitle>
            <DialogDescription>
              Bannir {selectedUser?.nomComplet || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ban-titre">Titre du ban *</Label>
              <Input
                id="ban-titre"
                value={banData.titre}
                onChange={(e) =>
                  setBanData({ ...banData, titre: e.target.value })
                }
                placeholder="Ex: Violation des conditions d'utilisation"
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ban-description">Description / Raison *</Label>
              <Textarea
                id="ban-description"
                value={banData.description}
                onChange={(e) =>
                  setBanData({ ...banData, description: e.target.value })
                }
                placeholder="Expliquez la raison du bannissement..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ban-duree-type">Type de durée *</Label>
              <Select
                value={banData.dureeType}
                onValueChange={(value: any) =>
                  setBanData({ ...banData, dureeType: value })
                }
              >
                <SelectTrigger id="ban-duree-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hours">Heures</SelectItem>
                  <SelectItem value="days">Jours</SelectItem>
                  <SelectItem value="months">Mois</SelectItem>
                  <SelectItem value="years">Années</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {banData.dureeType !== "permanent" && (
              <div className="space-y-2">
                <Label htmlFor="ban-duree-valeur">
                  Durée ({getDurationLabel(banData.dureeType)}) *
                </Label>
                <Input
                  id="ban-duree-valeur"
                  type="number"
                  min="1"
                  value={banData.dureeValeur}
                  onChange={(e) =>
                    setBanData({
                      ...banData,
                      dureeValeur: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
            )}

            {banData.dureeType === "permanent" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-medium">
                  ⚠️ Attention: Ce bannissement sera permanent et ne pourra être
                  levé que manuellement par un administrateur.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBanDialogOpen(false)}
              disabled={banning}
            >
              Annuler
            </Button>
            <Button
              onClick={handleBanUser}
              disabled={banning}
              className="bg-red-600 hover:bg-red-700"
            >
              {banning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Bannissement...
                </>
              ) : (
                <>
                  <BanIcon className="h-4 w-4 mr-2" />
                  Bannir
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarInset>
  );
}
