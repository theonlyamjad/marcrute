"use client";

import React, { useState, useEffect } from 'react';
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, CheckCircle, XCircle, Eye, Filter, RotateCcw } from 'lucide-react';
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
  
  const [regions, setRegions] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [specialtyCategories, setSpecialtyCategories] = useState<any[]>([]);
  
  const [selectedDiploma, setSelectedDiploma] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");

  const hasActiveFilters = searchTerm !== "" || statutFilter !== "all" || selectedRegion !== "all" || selectedCity !== "all" || selectedSpecialty !== "all";

  useEffect(() => {
    const loadInitialOptions = async () => {
      const result = await getFilterOptions();
      if (result.success && result.data) {
        setRegions(result.data.regions || []);
        setSpecialtyCategories(result.data.specialites || []);
      }
    };
    loadInitialOptions();
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      if (selectedRegion !== "all") {
        const result = await getCitiesByRegion(selectedRegion);
        if (result.success && result.data) {
          setCities(result.data);
        } else {
          setCities([]);
        }
      } else {
        setCities([]);
        setSelectedCity("all");
      }
    };
    fetchCities();
  }, [selectedRegion]);

  const loadDiplomes = async () => {
    setLoading(true);
    try {
      const result = await getAllDiplomesForValidation({
        status: statutFilter,
        regionId: selectedRegion,
        specialtyId: selectedSpecialty,
        search: searchTerm,
        page,
        limit: 20,
        villeId: selectedCity 
      });

      if (result.success && result.data) {
        setDiplomes(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(loadDiplomes, 300);
    return () => clearTimeout(debounce);
  }, [page, statutFilter, selectedRegion, selectedCity, selectedSpecialty, searchTerm]);

  const handleVerifyDiploma = async (statut: "Vérifié" | "Rejeté") => {
    if (!selectedDiploma) return;
    setVerifying(true);
    try {
      const result = await verifyDiploma({
        idDiplome: selectedDiploma.idDiplome,
        statut: statut,
        notes: notes || "Validé par l'administration"
      });
      if (result.success) {
        toast.success(`Diplôme marqué comme ${statut}`);
        setPdfDialogOpen(false);
        loadDiplomes();
      } else {
        toast.error(result.error || "Erreur lors de la validation");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setVerifying(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatutFilter("all");
    setSelectedRegion("all");
    setSelectedCity("all");
    setSelectedSpecialty("all");
    setPage(1);
  };

  const getStatusBadge = (statut: string) => {
    const styles: any = {
      'En attente': 'bg-amber-100 text-amber-800 border-amber-200',
      'Vérifié': 'bg-green-100 text-green-800 border-green-200',
      'Rejeté': 'bg-red-100 text-red-800 border-red-200',
    };
    return <Badge variant="outline" className={`${styles[statut] || 'bg-gray-100'} font-medium`}>{statut}</Badge>;
  };

  return (
    <SidebarInset>
      <div className="flex flex-1 flex-col p-6 md:p-8 space-y-6 bg-[#F3F4F4]">
        {/* Header Section */}
        <div className="bg-[#1D546D] rounded-xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Vérification Administrative</h1>
            <p className="text-blue-50/80">Gestion et validation des certifications professionnelles</p>
          </div>
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/10 text-center">
            <div className="text-white/60 text-xs uppercase tracking-wider font-bold">Total Diplômes</div>
            <div className="text-white text-2xl font-mono">{pagination?.total || 0}</div>
          </div>
        </div>

        {/* Improved Filter Section */}
        <Card className="border-none shadow-sm overflow-visible">
          <CardHeader className="pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-[#1D546D]">
                <Filter className="h-4 w-4" /> FILTRER LA RECHERCHE
              </CardTitle>
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetFilters} 
                  className="text-gray-500 hover:text-red-600 h-8 gap-2 border-gray-200"
                >
                  <RotateCcw className="h-3 w-3" /> Réinitialiser
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col space-y-4">
              {/* Row 1: Search and Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Rechercher par nom de travailleur ou email..." 
                    className="pl-10 h-10 border-gray-200 focus-visible:ring-[#1D546D]" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statutFilter} onValueChange={setStatutFilter}>
                  <SelectTrigger className="h-10 border-gray-200">
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="En attente">En attente</SelectItem>
                    <SelectItem value="Vérifié">Vérifié</SelectItem>
                    <SelectItem value="Rejeté">Rejeté</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Row 2: Location and Specialty */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="h-10 border-gray-200">
                    <SelectValue placeholder="Région" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les régions</SelectItem>
                    {regions.map((r) => <SelectItem key={r.idRegion} value={r.idRegion}>{r.nomRegion}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={selectedCity} onValueChange={setSelectedCity} disabled={selectedRegion === "all"}>
                  <SelectTrigger className="h-10 border-gray-200">
                    <SelectValue placeholder={selectedRegion === "all" ? "Choisir une région d'abord" : "Ville"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les villes</SelectItem>
                    {cities.map((c) => <SelectItem key={c.idVille} value={c.idVille}>{c.nomVille}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger className="h-10 border-gray-200">
                    <SelectValue placeholder="Catégorie de métier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {specialtyCategories.map((s) => <SelectItem key={s.idSpecialite} value={s.idSpecialite}>{s.nomSpecialite}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
 
        {/* Data Table */}
        <Card className="border-none shadow-sm overflow-hidden bg-white">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="border-b border-gray-100">
                <TableHead className="w-75 py-4 text-[#1D546D] font-bold">TRAVAILLEUR</TableHead>
                <TableHead className="text-[#1D546D] font-bold">DIPLÔME</TableHead>
                <TableHead className="text-[#1D546D] font-bold">LOCALISATION</TableHead>
                <TableHead className="text-[#1D546D] font-bold">STATUT</TableHead>
                <TableHead className="text-right text-[#1D546D] font-bold">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="h-40 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-[#1D546D] opacity-20" /></TableCell></TableRow>
              ) : diplomes.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-32 text-center text-gray-400 italic">Aucun diplôme trouvé pour ces critères.</TableCell></TableRow>
              ) : (
                diplomes.map((diplome) => (
                  <TableRow key={diplome.idDiplome} className="hover:bg-gray-50/80 transition-colors border-b border-gray-50 last:border-0">
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{diplome.travailleur?.utilisateur?.nomComplet}</span>
                        <span className="text-xs text-gray-500 font-medium">{diplome.travailleur?.utilisateur?.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-700">{diplome.nomDiplome}</span>
                        <span className="text-[11px] text-[#5F9598] uppercase tracking-tighter font-bold">{diplome.nomInstitution}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs flex flex-col">
                        <span className="font-bold text-gray-600">{diplome.travailleur?.ville?.region?.nomRegion}</span>
                        <span className="text-gray-400">{diplome.travailleur?.ville?.nomVille}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(diplome.statut)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="bg-[#1D546D]/5 text-[#1D546D] hover:bg-[#1D546D] hover:text-white transition-all font-bold text-xs"
                        onClick={() => {
                          setSelectedDiploma(diplome);
                          // Utiliser l'API pour servir le PDF (gère base64 et fichiers publics)
                          setPdfUrl(diplome.cheminFichier 
                            ? `/api/admin/diplomas/${diplome.idDiplome}/view`
                            : "");
                          setPdfDialogOpen(true);
                        }}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1.5" /> EXAMINER
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* PDF Dialog remains the same */}
      <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
        <DialogContent className="max-w-none! w-[90vw] h-[45vw] flex flex-col p-6">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-2xl text-[#1D546D]">Vérification du document</DialogTitle>
            <DialogDescription className="font-medium text-gray-600">
              {selectedDiploma?.nomDiplome} — {selectedDiploma?.travailleur?.utilisateur?.nomComplet}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 bg-gray-200 rounded-lg border-4 border-gray-100 overflow-hidden mt-4 relative">
            {pdfUrl ? (
              <iframe src={pdfUrl} className="w-full h-full" title="PDF Viewer" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                <XCircle className="h-12 w-12 opacity-20" />
                <p>Le fichier n&apos;est pas accessible.</p>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-3 pt-6 border-t mt-4">
             <div className="flex-1 flex items-center">
                {selectedDiploma?.statut !== "En attente" && (
                   <Badge className="bg-amber-500 text-white border-none px-3 py-1">TRAITÉ : {selectedDiploma?.statut}</Badge>
                )}
             </div>
             <div className="flex gap-2">
               <Button 
                 variant="outline" 
                 className="border-red-200 text-red-600 hover:bg-red-50 font-bold"
                 disabled={verifying || selectedDiploma?.statut !== "En attente"}
                 onClick={() => handleVerifyDiploma("Rejeté")}
               >
                 {verifying ? <Loader2 className="animate-spin h-4 w-4" /> : <XCircle className="h-4 w-4 mr-2" />}
                 REJETER LE DIPLÔME
               </Button>
               <Button 
                 className="bg-[#1D546D] hover:bg-[#061E29] text-white font-bold px-8"
                 disabled={verifying || selectedDiploma?.statut !== "En attente"}
                 onClick={() => handleVerifyDiploma("Vérifié")}
               >
                 {verifying ? <Loader2 className="animate-spin h-4 w-4" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                 APPROUVER
               </Button>
             </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarInset>
  );
}