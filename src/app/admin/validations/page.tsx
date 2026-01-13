"use client";

import React, { useState, useEffect } from 'react';
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Eye, CheckCircle, XCircle, FileText, Download, FileCheck2 } from 'lucide-react';
import { getAllValidations, updateValidation, verifyDiploma } from '@/actions/admin/validations';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminValidations() {
  const [loading, setLoading] = useState(true);
  const [validations, setValidations] = useState<any[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statutFilter, setStatutFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [selectedValidation, setSelectedValidation] = useState<any>(null);
  const [notes, setNotes] = useState("");
  
  // Diploma verification state
  const [diplomaDialogOpen, setDiplomaDialogOpen] = useState(false);
  const [selectedDiplomas, setSelectedDiplomas] = useState<any[]>([]);
  const [currentDiplomaIndex, setCurrentDiplomaIndex] = useState(0);
  const [diplomaNotes, setDiplomaNotes] = useState("");
  const [verifying, setVerifying] = useState(false);

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

  const handleOpenDiplomaDialog = (validation: any) => {
    if (validation.diplomes && validation.diplomes.length > 0) {
      setSelectedDiplomas(validation.diplomes);
      setCurrentDiplomaIndex(0);
      setDiplomaNotes("");
      setDiplomaDialogOpen(true);
    } else {
      toast.error("Aucun diplôme trouvé pour ce travailleur");
    }
  };

  const handleVerifyDiploma = async (statut: "Vérifié" | "Rejeté") => {
    if (!selectedDiplomas[currentDiplomaIndex]) return;

    setVerifying(true);
    try {
      const result = await verifyDiploma({
        idDiplome: selectedDiplomas[currentDiplomaIndex].idDiplome,
        statut,
        notes: diplomaNotes || undefined,
      });

      if (result.success) {
        toast.success(`Diplôme ${statut.toLowerCase()} avec succès`);
        
        // Move to next diploma or close dialog
        if (currentDiplomaIndex < selectedDiplomas.length - 1) {
          setCurrentDiplomaIndex(currentDiplomaIndex + 1);
          setDiplomaNotes("");
        } else {
          setDiplomaDialogOpen(false);
          setSelectedDiplomas([]);
          setCurrentDiplomaIndex(0);
          loadValidations();
        }
      } else {
        toast.error(result.error || "Erreur lors de la vérification");
      }
    } catch (error) {
      toast.error("Erreur lors de la vérification du diplôme");
      console.error(error);
    } finally {
      setVerifying(false);
    }
  };

  const currentDiploma = selectedDiplomas[currentDiplomaIndex];

  const getStatusBadge = (statut: string) => {
    const variants: Record<string, string> = {
      'En attente': 'bg-amber-100 text-amber-800',
      'Approuvée': 'bg-green-100 text-green-800',
      'Rejetée': 'bg-red-100 text-red-800',
      'Vérifié': 'bg-green-100 text-green-800',
    };
    return <Badge className={variants[statut] || 'bg-gray-100 text-gray-800'}>{statut}</Badge>;
  };

  return (
    <SidebarInset>
      <div className="flex flex-1 flex-col p-6 md:p-8 space-y-6 bg-[#F3F4F4]">
        <div className="bg-[#1D546D] rounded-xl p-6 shadow-lg">
          <h1 className="text-3xl font-bold text-white mb-2">Gestion des validations</h1>
          <p className="text-[#F3F4F4] text-opacity-90">Valider ou rejeter les demandes et vérifier les diplômes</p>
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
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {validation.type === "Diplôme" && <FileCheck2 className="h-4 w-4 text-blue-600" />}
                                {validation.type}
                              </div>
                            </TableCell>
                            <TableCell>{validation.concerne}</TableCell>
                            <TableCell>{getStatusBadge(validation.statut)}</TableCell>
                            <TableCell>{validation.administrateur}</TableCell>
                            <TableCell>{new Date(validation.date).toLocaleDateString('fr-FR')}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {validation.type === "Diplôme" && validation.idTravailleur && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenDiplomaDialog(validation)}
                                    title="Vérifier les diplômes"
                                  >
                                    <FileCheck2 className="h-4 w-4 text-blue-600" />
                                  </Button>
                                )}
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

      {/* Diploma Verification Dialog */}
      <Dialog open={diplomaDialogOpen} onOpenChange={setDiplomaDialogOpen}>
        <DialogContent className="sm:max-w-150">
          <DialogHeader>
            <DialogTitle>Vérification des diplômes</DialogTitle>
            <DialogDescription>
              Diplôme {currentDiplomaIndex + 1} sur {selectedDiplomas.length}
            </DialogDescription>
          </DialogHeader>

          {currentDiploma && (
            <div className="space-y-4 py-4">
              <Card className="border-2 border-[#1D546D] border-opacity-20">
                <CardHeader>
                  <CardTitle className="text-lg">{currentDiploma.nomDiplome}</CardTitle>
                  <CardDescription>
                    {currentDiploma.nomInstitution || "Institution non spécifiée"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Statut actuel:</span>
                    {currentDiploma.statut ? (
                      getStatusBadge(currentDiploma.statut)
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Non vérifié</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Date de création:</span>
                    <span className="text-sm text-gray-600">
                      {new Date(currentDiploma.dateCreation).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  {currentDiploma.cheminFichier && (
                    <div className="pt-2">
                      <a
                        href={currentDiploma.cheminFichier}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-[#1D546D] hover:text-[#5F9598] font-medium"
                      >
                        <FileText className="h-4 w-4" />
                        Voir le diplôme
                        <Download className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="diploma-notes">Notes de vérification</Label>
                <Textarea
                  id="diploma-notes"
                  value={diplomaNotes}
                  onChange={(e) => setDiplomaNotes(e.target.value)}
                  placeholder="Ajouter des notes sur la vérification du diplôme..."
                  rows={3}
                />
              </div>

              {currentDiploma.statut && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    ℹ️ Ce diplôme a déjà été vérifié. Vous pouvez le vérifier à nouveau si nécessaire.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {currentDiplomaIndex > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCurrentDiplomaIndex(currentDiplomaIndex - 1);
                    setDiplomaNotes("");
                  }}
                  disabled={verifying}
                >
                  ← Précédent
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDiplomaDialogOpen(false);
                  setSelectedDiplomas([]);
                  setCurrentDiplomaIndex(0);
                  setDiplomaNotes("");
                }}
                disabled={verifying}
              >
                Annuler
              </Button>
              <Button
                onClick={() => handleVerifyDiploma("Rejeté")}
                variant="destructive"
                disabled={verifying}
              >
                {verifying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeter
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleVerifyDiploma("Vérifié")}
                className="bg-green-600 hover:bg-green-700"
                disabled={verifying}
              >
                {verifying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Vérifier    
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarInset>
  );
}