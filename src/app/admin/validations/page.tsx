"use client";

import React, { useState, useEffect } from 'react';
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, CheckCircle, XCircle, Eye, Filter } from 'lucide-react';
import { getAllDiplomesForValidation, getFilterOptions, getCitiesByRegion, verifyDiploma } from '@/actions/admin/validations';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function AdminValidations() {
  const [loading, setLoading] = useState(true);
  const [diplomes, setDiplomes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statutFilter, setStatutFilter] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  
  // Filter options
  const [regions, setRegions] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [specialtyCategories, setSpecialtyCategories] = useState<any[]>([]);
  
  // Diploma verification
  const [selectedDiploma, setSelectedDiploma] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [verifying, setVerifying] = useState(false);
  
  // PDF viewer dialog
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");

  const hasActiveFilters = searchTerm !== "" || statutFilter !== "all" || selectedRegion !== "all" || selectedCity !== "all" || selectedSpecialty !== "all";

  const filteredCities = selectedRegion === "all" ? [] : cities.filter((city: any) => city.idRegion === selectedRegion);

  // Load filter options on mount
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Load cities when region changes
  useEffect(() => {
    if (selectedRegion && selectedRegion !== "all") {
      loadCities(selectedRegion);
    } else {
      setCities([]);
      setSelectedCity("all");
    }
  }, [selectedRegion]);

  // Load diplomas when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadDiplomes();
    }, searchTerm ? 500 : 0);

    return () => clearTimeout(timeoutId);
  }, [page, statutFilter, selectedRegion, selectedCity, selectedSpecialty, searchTerm]);

  const loadFilterOptions = async () => {
    try {
      const result = await getFilterOptions();
      if (result.success && result.data) {
        setRegions(result.data.regions);
        setSpecialtyCategories(result.data.specialites);
      }
    } catch (error) {
      console.error("Error loading filter options:", error);
    }
  };

  const loadCities = async (regionId: string) => {
    try {
      const result = await getCitiesByRegion(regionId);
      if (result.success && result.data) {
        setCities(result.data);
      }
    } catch (error) {
      console.error("Error loading cities:", error);
    }
  };

  const loadDiplomes = async () => {
    setLoading(true);
    try {
      const result = await getAllDiplomesForValidation({
        statut: statutFilter !== "all" ? statutFilter : undefined,
        regionId: selectedRegion !== "all" ? selectedRegion : undefined,
        villeId: selectedCity !== "all" ? selectedCity : undefined,
        specialiteId: selectedSpecialty !== "all" ? selectedSpecialty : undefined,
        search: searchTerm || undefined,
        page,
        limit: 20,
      });

      if (result.success && result.data) {
        setDiplomes(result.data);
        setPagination(result.pagination);
      } else {
        toast.error(result.error || "Erreur lors du chargement");
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des diplômes");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadDiplomes();
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatutFilter("all");
    setSelectedRegion("all");
    setSelectedCity("all");
    setSelectedSpecialty("all");
    setPage(1);
  };

  const handleVerifyDiploma = async (statut: "Vérifié" | "Rejeté") => {
    if (!selectedDiploma) return;

    setVerifying(true);
    try {
      const result = await verifyDiploma({
        idDiplome: selectedDiploma.idDiplome,
        statut,
        notes: notes || undefined,
      });

      if (result.success) {
        toast.success(`Diplôme ${statut.toLowerCase()} avec succès`);
        setPdfDialogOpen(false);
        setSelectedDiploma(null);
        setNotes("");
        loadDiplomes();
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

  const handleViewPDF = (diplome: any) => {
    setSelectedDiploma(diplome);
    setPdfUrl(diplome.cheminFichier);
    setPdfDialogOpen(true);
  };

  const getStatusBadge = (statut: string) => {
    const variants: Record<string, string> = {
      'En attente': 'bg-amber-100 text-amber-800',
      'Vérifié': 'bg-green-100 text-green-800',
      'Rejeté': 'bg-red-100 text-red-800',
    };
    return <Badge className={variants[statut] || 'bg-gray-100 text-gray-800'}>{statut}</Badge>;
  };

  return (
    <SidebarInset>
      <div className="flex flex-1 flex-col p-6 md:p-8 space-y-6 bg-[#F3F4F4]">
        <div className="bg-[#1D546D] rounded-xl p-6 shadow-lg">
          <h1 className="text-3xl font-bold text-white mb-2">Vérification des diplômes</h1>
          <p className="text-[#F3F4F4] text-opacity-90">Valider les diplômes des travailleurs</p>
        </div>

        {/* Filters Card */}
        <Card className="border-[#1D546D]/20 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-[#061E29] flex items-center gap-2">
                <Filter className="h-5 w-5 text-[#5F9598]" />
                Filtres
              </CardTitle>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-[#5F9598] hover:text-[#1D546D]"
                >
                  Réinitialiser
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un travailleur..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>

              {/* Status */}
              <Select
                value={statutFilter}
                onValueChange={(value) => {
                  setStatutFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="En attente">En attente</SelectItem>
                  <SelectItem value="Vérifié">Vérifié</SelectItem>
                  <SelectItem value="Rejeté">Rejeté</SelectItem>
                </SelectContent>
              </Select>

              {/* Region */}
              <Select
                value={selectedRegion}
                onValueChange={(value) => {
                  setSelectedRegion(value);
                  setSelectedCity("all");
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Région" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les régions</SelectItem>
                  {regions.map((region) => (
                    <SelectItem key={region.idRegion} value={region.idRegion}>
                      {region.nomRegion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* City */}
              <Select
                value={selectedCity}
                onValueChange={(value) => {
                  setSelectedCity(value);
                  setPage(1);
                }}
                disabled={selectedRegion === "all"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ville" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les villes</SelectItem>
                  {filteredCities.map((city: any) => (
                    <SelectItem key={city.idVille} value={city.idVille}>
                      {city.nomVille}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Specialty */}
              <Select
                value={selectedSpecialty}
                onValueChange={(value) => {
                  setSelectedSpecialty(value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Spécialité" />
                </SelectTrigger>
                <SelectContent className="max-h-75">
                  <SelectItem value="all">Toutes les spécialités</SelectItem>
                  {specialtyCategories.map((cat) => (
                    <React.Fragment key={cat.idCategorieSpecialite}>
                      <div className="px-2 py-1.5 text-sm font-semibold text-gray-500 bg-gray-50 pointer-events-none">
                        {cat.nomCategorie}
                      </div>
                      {cat.specialites.map((spec: any) => (
                        <SelectItem 
                          key={spec.idSpecialite} 
                          value={spec.idSpecialite}
                          className="pl-6"
                        >
                          {spec.nomSpecialite}
                        </SelectItem>
                      ))}
                    </React.Fragment>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Diplomas Table */}
        <Card className="border-none shadow-lg bg-white">
          <CardHeader>
            <CardTitle>
              Liste des diplômes
              {pagination && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({pagination.total} diplôme{pagination.total > 1 ? 's' : ''})
                </span>
              )}
            </CardTitle>
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
                        <TableHead>Travailleur</TableHead>
                        <TableHead>Diplôme</TableHead>
                        <TableHead>Institution</TableHead>
                        <TableHead>Région / Ville</TableHead>
                        <TableHead>Spécialités</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {diplomes.length > 0 ? (
                        diplomes.map((diplome) => (
                          <TableRow key={diplome.idDiplome}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{diplome.travailleur.nom}</p>
                                <p className="text-xs text-gray-500">{diplome.travailleur.email}</p>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{diplome.nomDiplome}</TableCell>
                            <TableCell>{diplome.nomInstitution || "N/A"}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p>{diplome.travailleur.region}</p>
                                <p className="text-gray-500">{diplome.travailleur.ville}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {diplome.travailleur.specialites.slice(0, 2).map((spec: any, idx: number) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {spec.nom}
                                  </Badge>
                                ))}
                                {diplome.travailleur.specialites.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{diplome.travailleur.specialites.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(diplome.statut)}</TableCell>
                            <TableCell>
                              {new Date(diplome.dateCreation).toLocaleDateString('fr-FR')}
                            </TableCell>
                            <TableCell className="text-right">
                              {diplome.cheminFichier ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleViewPDF(diplome);
                                  }}
                                  title="Voir et vérifier le diplôme"
                                  className="text-[#1D546D] hover:text-[#5F9598]"
                                >
                                  <Eye className="h-5 w-5" />
                                </Button>
                              ) : (
                                <Badge variant="outline" className="text-xs text-red-600">
                                  Aucun fichier
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-[#5F9598]">
                            Aucun diplôme trouvé
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
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

      {/* PDF Viewer Dialog with Verification */}
      <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
        <DialogContent className="max-w-none! w-[90vw] h-[55vw] flex flex-col p-6">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Visualisation et vérification du diplôme</DialogTitle>
                <DialogDescription className="mt-1">
                  {selectedDiploma?.nomDiplome} - {selectedDiploma?.travailleur.nom}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto border-2 rounded-lg bg-gray-100 flex items-center justify-center min-h-0">
            {pdfUrl && (
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0 bg-white shadow-2xl rounded"
                title="PDF Viewer"
              />
            )}
          </div>

          <DialogFooter className="flex justify-between items-center pt-4">
            <div className="flex-1">
              {selectedDiploma?.statut !== "En attente" && (
                <div className="bg-yellow-200 border-2 border-yellow-500 p-3 w-85 rounded-lg font-black">
                  <p className="text-sm text-yellow-800 ">
                    Ce diplôme a déjà été {selectedDiploma?.statut.toLowerCase()}
                    {selectedDiploma?.dateVerification && (
                      <span className="ml-1 ">
                        le {new Date(selectedDiploma.dateVerification).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleVerifyDiploma("Rejeté")}
                variant="destructive"
                disabled={verifying || selectedDiploma?.statut !== "En attente"}
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
                disabled={verifying || selectedDiploma?.statut !== "En attente"}
              >
                {verifying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approuver
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