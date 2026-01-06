"use client";

import React, { useState, useEffect } from 'react';
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Eye, CheckCircle } from 'lucide-react';
import { getAllSignalements, updateSignalement } from '@/actions/admin/signalements';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function AdminSignalements() {
  const [loading, setLoading] = useState(true);
  const [signalements, setSignalements] = useState<any[]>([]);
  const [statutFilter, setStatutFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [selectedSignalement, setSelectedSignalement] = useState<any>(null);
  const [reponseAdmin, setReponseAdmin] = useState("");

  const loadSignalements = async () => {
    setLoading(true);
    try {
      const result = await getAllSignalements({
        statut: statutFilter !== "all" ? statutFilter : undefined,
        page,
        limit: 20,
      });

      if (result.success && result.data) {
        setSignalements(result.data);
        setPagination(result.pagination);
      } else {
        toast.error(result.error || "Erreur lors du chargement");
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des signalements");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSignalements();
  }, [page, statutFilter]);

  const handleUpdateStatus = async (id: string, statut: string) => {
    const result = await updateSignalement({
      idSignalement: id,
      statut: statut as "En attente" | "En cours" | "Résolu",
      reponseAdmin: reponseAdmin || undefined,
    });

    if (result.success) {
      toast.success("Signalement mis à jour");
      setReponseAdmin("");
      setSelectedSignalement(null);
      loadSignalements();
    } else {
      toast.error(result.error || "Erreur lors de la mise à jour");
    }
  };

  const getStatusBadge = (statut: string) => {
    const variants: Record<string, string> = {
      'En attente': 'bg-amber-100 text-amber-800',
      'En cours': 'bg-blue-100 text-blue-800',
      'Résolu': 'bg-green-100 text-green-800',
    };
    return <Badge className={variants[statut] || 'bg-gray-100 text-gray-800'}>{statut}</Badge>;
  };

  return (
    <SidebarInset>
      <div className="flex flex-1 flex-col p-6 md:p-8 space-y-6 bg-[#F3F4F4]">
        <div className="bg-[#1D546D] rounded-xl p-6 shadow-lg">
          <h1 className="text-3xl font-bold text-white mb-2">Gestion des signalements</h1>
          <p className="text-[#F3F4F4] text-opacity-90">Traiter les signalements des utilisateurs</p>
        </div>

        <Card className="border-none shadow-lg bg-white">
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={statutFilter} onValueChange={setStatutFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="En attente">En attente</SelectItem>
                <SelectItem value="En cours">En cours</SelectItem>
                <SelectItem value="Résolu">Résolu</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white">
          <CardHeader>
            <CardTitle>Liste des signalements</CardTitle>
            <CardDescription>
              {pagination && `Total: ${pagination.total} signalement(s)`}
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
                        <TableHead>Motif</TableHead>
                        <TableHead>Émetteur</TableHead>
                        <TableHead>Concerne</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {signalements.length > 0 ? (
                        signalements.map((signalement) => (
                          <TableRow key={signalement.id}>
                            <TableCell className="font-medium">{signalement.motif}</TableCell>
                            <TableCell>{signalement.emetteur}</TableCell>
                            <TableCell>{signalement.concerne}</TableCell>
                            <TableCell>{getStatusBadge(signalement.statut)}</TableCell>
                            <TableCell>{new Date(signalement.date).toLocaleDateString('fr-FR')}</TableCell>
                            <TableCell className="text-right">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" onClick={() => {
                                    setSelectedSignalement(signalement);
                                    setReponseAdmin(signalement.reponseAdmin || "");
                                  }}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Détails du signalement</DialogTitle>
                                    <DialogDescription>
                                      Motif: {signalement.motif} | Statut: {signalement.statut}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <p className="text-sm font-medium">Description:</p>
                                      <p className="text-sm text-gray-600">{signalement.description}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Émetteur:</p>
                                      <p className="text-sm text-gray-600">{signalement.emetteur}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Concerne:</p>
                                      <p className="text-sm text-gray-600">{signalement.concerne}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Réponse admin:</p>
                                      <Textarea
                                        value={reponseAdmin}
                                        onChange={(e) => setReponseAdmin(e.target.value)}
                                        placeholder="Ajouter une réponse..."
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() => handleUpdateStatus(signalement.id, "En cours")}
                                        variant="outline"
                                      >
                                        Marquer en cours
                                      </Button>
                                      <Button
                                        onClick={() => handleUpdateStatus(signalement.id, "Résolu")}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Résoudre
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-[#5F9598]">
                            Aucun signalement trouvé
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

