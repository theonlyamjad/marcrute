"use client";

import React, { useState, useEffect } from 'react';
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, CheckCircle, XCircle, Eye } from 'lucide-react';
import { getAllValidations, updateValidation } from '@/actions/admin/validations';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function AdminValidations() {
  const [loading, setLoading] = useState(true);
  const [validations, setValidations] = useState<any[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statutFilter, setStatutFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [selectedValidation, setSelectedValidation] = useState<any>(null);
  const [notes, setNotes] = useState("");

  const loadValidations = async () => {
    setLoading(true);
    try {
      const result = await getAllValidations({
        type: typeFilter !== "all" ? typeFilter : undefined,
        statut: statutFilter !== "all" ? statutFilter : undefined,
        page,
        limit: 20,
      });

      if (result.success && result.data) {
        setValidations(result.data);
        setPagination(result.pagination);
      } else {
        toast.error(result.error || "Erreur lors du chargement");
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des validations");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadValidations();
  }, [page, typeFilter, statutFilter]);

  const handleUpdateStatus = async (id: string, statut: string) => {
    const result = await updateValidation({
      idValidation: id,
      statut: statut as "En attente" | "Approuvée" | "Rejetée",
      notes: notes || undefined,
    });

    if (result.success) {
      toast.success("Validation mise à jour");
      setNotes("");
      setSelectedValidation(null);
      loadValidations();
    } else {
      toast.error(result.error || "Erreur lors de la mise à jour");
    }
  };

  const getStatusBadge = (statut: string) => {
    const variants: Record<string, string> = {
      'En attente': 'bg-amber-100 text-amber-800',
      'Approuvée': 'bg-green-100 text-green-800',
      'Rejetée': 'bg-red-100 text-red-800',
    };
    return <Badge className={variants[statut] || 'bg-gray-100 text-gray-800'}>{statut}</Badge>;
  };

  return (
    <SidebarInset>
      <div className="flex flex-1 flex-col p-6 md:p-8 space-y-6 bg-[#F3F4F4]">
        <div className="bg-[#1D546D] rounded-xl p-6 shadow-lg">
          <h1 className="text-3xl font-bold text-white mb-2">Gestion des validations</h1>
          <p className="text-[#F3F4F4] text-opacity-90">Valider ou rejeter les demandes</p>
        </div>

        <Card className="border-none shadow-lg bg-white">
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="Diplôme">Diplôme</SelectItem>
                  <SelectItem value="Profil">Profil</SelectItem>
                  <SelectItem value="Mission">Mission</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statutFilter} onValueChange={setStatutFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="En attente">En attente</SelectItem>
                  <SelectItem value="Approuvée">Approuvée</SelectItem>
                  <SelectItem value="Rejetée">Rejetée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white">
          <CardHeader>
            <CardTitle>Liste des validations</CardTitle>
            <CardDescription>
              {pagination && `Total: ${pagination.total} validation(s)`}
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
                        <TableHead>Type</TableHead>
                        <TableHead>Concerne</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Administrateur</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validations.length > 0 ? (
                        validations.map((validation) => (
                          <TableRow key={validation.id}>
                            <TableCell className="font-medium">{validation.type}</TableCell>
                            <TableCell>{validation.concerne}</TableCell>
                            <TableCell>{getStatusBadge(validation.statut)}</TableCell>
                            <TableCell>{validation.administrateur}</TableCell>
                            <TableCell>{new Date(validation.date).toLocaleDateString('fr-FR')}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => {
                                      setSelectedValidation(validation);
                                      setNotes(validation.notes || "");
                                    }}>
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Détails de la validation</DialogTitle>
                                      <DialogDescription>
                                        Type: {validation.type} | Statut: {validation.statut}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <p className="text-sm font-medium">Concerne:</p>
                                        <p className="text-sm text-gray-600">{validation.concerne}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">Notes:</p>
                                        <Textarea
                                          value={notes}
                                          onChange={(e) => setNotes(e.target.value)}
                                          placeholder="Ajouter des notes..."
                                        />
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          onClick={() => handleUpdateStatus(validation.id, "Approuvée")}
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Approuver
                                        </Button>
                                        <Button
                                          onClick={() => handleUpdateStatus(validation.id, "Rejetée")}
                                          variant="destructive"
                                        >
                                          <XCircle className="h-4 w-4 mr-2" />
                                          Rejeter
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-[#5F9598]">
                            Aucune validation trouvée
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

