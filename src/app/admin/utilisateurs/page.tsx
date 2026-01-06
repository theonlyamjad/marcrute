"use client";

import React, { useState, useEffect } from 'react';
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, UserPlus, Trash2 } from 'lucide-react';
import { getAllUsers, deleteUser } from '@/actions/admin/utilisateurs';
import { toast } from 'sonner';

export default function AdminUtilisateurs() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

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
        setUsers(result.data);
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

  const getRoleBadge = (role: string) => {
    const variants: Record<string, string> = {
      'Travailleur': 'bg-blue-100 text-blue-800',
      'Institution': 'bg-green-100 text-green-800',
      'Administrateur': 'bg-purple-100 text-purple-800',
    };
    return <Badge className={variants[role] || 'bg-gray-100 text-gray-800'}>{role}</Badge>;
  };

  return (
    <SidebarInset>
      <div className="flex flex-1 flex-col p-6 md:p-8 space-y-6 bg-[#F3F4F4]">
        <div className="bg-[#1D546D] rounded-xl p-6 shadow-lg">
          <h1 className="text-3xl font-bold text-white mb-2">Gestion des utilisateurs</h1>
          <p className="text-[#F3F4F4] text-opacity-90">Gérer tous les utilisateurs de la plateforme</p>
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
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
                  <SelectItem value="Admin">Admin</SelectItem>
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
                        <TableHead>Date création</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length > 0 ? (
                        users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.nomComplet || "N/A"}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                            <TableCell>{user.telephone || "N/A"}</TableCell>
                            <TableCell>{new Date(user.dateCreation).toLocaleDateString('fr-FR')}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id)}>
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-[#5F9598]">
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
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Précédent
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
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
    </SidebarInset>
  );
}

