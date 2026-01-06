"use client";

import React, { useState, useEffect } from 'react';
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '@/actions/admin/categories';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function AdminCategories() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [name, setName] = useState("");

  const loadCategories = async () => {
    setLoading(true);
    try {
      const result = await getAllCategories();

      if (result.success && result.data) {
        setCategories(result.data);
      } else {
        toast.error(result.error || "Erreur lors du chargement");
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des catégories");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Le nom est requis");
      return;
    }

    const result = await createCategory({ name: name.trim() });
    if (result.success) {
      toast.success("Catégorie créée");
      setName("");
      setIsDialogOpen(false);
      loadCategories();
    } else {
      toast.error(result.error || "Erreur lors de la création");
    }
  };

  const handleUpdate = async () => {
    if (!name.trim()) {
      toast.error("Le nom est requis");
      return;
    }

    const result = await updateCategory({
      id: editingCategory.id,
      name: name.trim(),
    });

    if (result.success) {
      toast.success("Catégorie mise à jour");
      setName("");
      setEditingCategory(null);
      setIsDialogOpen(false);
      loadCategories();
    } else {
      toast.error(result.error || "Erreur lors de la mise à jour");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
      return;
    }

    const result = await deleteCategory(id);
    if (result.success) {
      toast.success("Catégorie supprimée");
      loadCategories();
    } else {
      toast.error(result.error || "Erreur lors de la suppression");
    }
  };

  const openEditDialog = (category: any) => {
    setEditingCategory(category);
    setName(category.name);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingCategory(null);
    setName("");
    setIsDialogOpen(true);
  };

  return (
    <SidebarInset>
      <div className="flex flex-1 flex-col p-6 md:p-8 space-y-6 bg-[#F3F4F4]">
        <div className="bg-[#1D546D] rounded-xl p-6 shadow-lg">
          <h1 className="text-3xl font-bold text-white mb-2">Gestion des catégories</h1>
          <p className="text-[#F3F4F4] text-opacity-90">Gérer les catégories de spécialités</p>
        </div>

        <Card className="border-none shadow-lg bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Liste des catégories</CardTitle>
              <CardDescription>
                {categories.length} catégorie(s) au total
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCategory
                      ? "Modifiez les informations de la catégorie"
                      : "Créez une nouvelle catégorie de spécialité"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nom de la catégorie</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Soins de santé"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={editingCategory ? handleUpdate : handleCreate}>
                    {editingCategory ? "Modifier" : "Créer"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                      <TableHead>ID</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Utilisations</TableHead>
                      <TableHead>Date création</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.id}</TableCell>
                          <TableCell>{category.name}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Badge variant="outline">
                                {category.count.travailleurs} travailleurs
                              </Badge>
                              <Badge variant="outline">
                                {category.count.institutions} institutions
                              </Badge>
                              <Badge variant="outline">
                                {category.count.missions} missions
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(category.dateCreation).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(category)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(category.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-[#5F9598]">
                          Aucune catégorie trouvée
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
    </SidebarInset>
  );
}

