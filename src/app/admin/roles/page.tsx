"use client";

import React, { useState, useEffect } from 'react';
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
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
import { Shield, Loader2, Search, UserCheck } from 'lucide-react';
import { getAllUsers, updateUserRole } from '@/actions/admin/utilisateurs';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  nomComplet: string | null;
  role: string;
  telephone: string | null;
  dateCreation: string;
}

export default function AdminRoles() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const roles = [
    { value: "Travailleur", label: "Travailleur" },
    { value: "Institution", label: "Institution" },
    { value: "Admin", label: "Administrateur" },
  ];

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await getAllUsers({
        search: search || undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
        page: 1,
        limit: 100,
      });

      if (result.success && result.data) {
        setUsers(result.data);
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
  }, [roleFilter]);

  const handleSearch = () => {
    loadUsers();
  };

  const handleOpenDialog = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setDialogOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) {
      toast.error("Veuillez sélectionner un rôle");
      return;
    }

    if (selectedUser.role === newRole) {
      toast.info("Le rôle est déjà défini sur cette valeur");
      setDialogOpen(false);
      return;
    }

    setUpdating(true);
    try {
      const result = await updateUserRole(
        selectedUser.id, 
        newRole as "Travailleur" | "Institution" | "Admin"
      );
      if (result.success) {
        toast.success("Rôle mis à jour avec succès");
        setDialogOpen(false);
        loadUsers();
      } else {
        toast.error(result.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du rôle");
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, string> = {
      'Travailleur': 'bg-blue-100 text-blue-800',
      'Institution': 'bg-green-100 text-green-800',
      'Admin': 'bg-purple-100 text-purple-800',
    };
    return <Badge className={variants[role] || 'bg-gray-100 text-gray-800'}>{role}</Badge>;
  };

  return (
    <SidebarInset>
      <div className="flex flex-1 flex-col p-6 md:p-8 space-y-6 bg-[#F3F4F4]">
        <div className="bg-[#1D546D] rounded-xl p-6 shadow-lg">
          <h1 className="text-3xl font-bold text-white mb-2">Gestion des rôles</h1>
          <p className="text-[#F3F4F4] text-opacity-90">Gérer les rôles et permissions des utilisateurs</p>
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
              Cliquez sur un utilisateur pour modifier son rôle
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#1D546D]" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôle actuel</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Date création</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length > 0 ? (
                      users.map((user) => (
                        <TableRow 
                          key={user.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleOpenDialog(user)}
                        >
                          <TableCell className="font-medium">{user.nomComplet || "N/A"}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>{user.telephone || "N/A"}</TableCell>
                          <TableCell>
                            {user.dateCreation 
                              ? new Date(user.dateCreation).toLocaleDateString('fr-FR')
                              : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDialog(user);
                              }}
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Modifier
                            </Button>
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
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogue de modification de rôle */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le rôle</DialogTitle>
            <DialogDescription>
              Modifier le rôle de {selectedUser?.nomComplet || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Rôle actuel</Label>
              <div className="p-2 bg-gray-100 rounded-md">
                {selectedUser && getRoleBadge(selectedUser.role)}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-role">Nouveau rôle</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger id="new-role" className="w-full">
                  <SelectValue placeholder="Sélectionnez un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={updating}
            >
              Annuler
            </Button>
            <Button
              onClick={handleUpdateRole}
              disabled={updating || !newRole || selectedUser?.role === newRole}
            >
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Mettre à jour
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarInset>
  );
}

