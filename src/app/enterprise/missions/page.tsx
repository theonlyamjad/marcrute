"use client";
import React, { JSX, useState, useEffect } from "react";
import { AppSidebar } from "@/components/enterprise-dashboard/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {Card,CardContent,CardDescription,CardHeader,CardTitle,} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from "@/components/ui/select";
import {Dialog,DialogContent,DialogFooter,DialogHeader,DialogTitle,} from "@/components/ui/dialog";
import {DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import {Plus,MoreVertical,Edit,Trash2,Eye,Filter,Search,Calendar as CalendarIcon,Loader2,} from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import {getMissions,createMission,updateMission,deleteMission,getSpecialtyCategories,} from "@/actions/enterprise/missions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Types TypeScript
interface SpecialiteRequise {
  specialiteRequise: string;
  anneesExperienceMin: number;
  idCategorie?: number | null;
}

interface SpecialtyCategory {
  id: number;
  name: string;
}

interface Mission {
  id: string;
  titre: string;
  description: string;
  typePublic: string;
  dateDebut: string;
  dateFin: string;
  urgence: "Normale" | "Haute" | "Urgente";
  statut: "Brouillon" | "Active" | "Terminée" | "Annulée";
  specialitesRequises: SpecialiteRequise[];
  nombreCandidatures: number;
  dateCreation: string;
}

// Experience ranges for select
const EXPERIENCE_RANGES = [
  { value: "0", label: "0-1 an" },
  { value: "1", label: "1-5 ans" },
  { value: "5", label: "5-10 ans" },
  { value: "10", label: "10+ ans" },
];

const getStatusBadge = (statut: Mission["statut"]): JSX.Element => {
  const variants: Record<Mission["statut"], string> = {
    Brouillon: "bg-gray-100 text-gray-800 border-gray-300",
    Active: "bg-[#5F9598] bg-opacity-20 text-[#1D546D] border-[#5F9598]",
    Terminée: "bg-green-100 text-green-800 border-green-300",
    Annulée: "bg-red-100 text-red-800 border-red-300",
  };
  return (
    <Badge className={`${variants[statut]} border font-medium`}>{statut}</Badge>
  );
};

const getUrgenceBadge = (urgence: Mission["urgence"]): JSX.Element => {
  const variants: Record<Mission["urgence"], string> = {
    Urgente: "bg-red-100 text-red-800 border-red-300",
    Haute: "bg-orange-100 text-orange-800 border-orange-300",
    Normale: "bg-[#1D546D] bg-opacity-10 text-[#1D546D] border-[#1D546D]",
  };
  return (
    <Badge className={`${variants[urgence]} border font-medium`}>
      {urgence}
    </Badge>
  );
};

// Helper function to get experience label
const getExperienceLabel = (years: number): string => {
  if (years === 0) return "0-1 an";
  if (years === 1) return "1-5 ans";
  if (years === 5) return "5-10 ans";
  if (years === 10) return "10+ ans";
  return `${years} ans min`;
};

const MissionCard: React.FC<{
  mission: Mission;
  onEdit: () => void;
  onDelete: () => void;
  onViewCandidatures: () => void;
}> = ({ mission, onEdit, onDelete, onViewCandidatures }) => {
  return (
    <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <CardTitle className="text-xl text-[#061E29]">
                {mission.titre}
              </CardTitle>
              {getStatusBadge(mission.statut)}
              {getUrgenceBadge(mission.urgence)}
            </div>
            <CardDescription className="text-[#5F9598] line-clamp-2">
              {mission.description}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-[#1D546D]">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="cursor-pointer text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {mission.dateDebut && (
              <div className="flex items-center gap-2 text-[#5F9598]">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  Du {new Date(mission.dateDebut).toLocaleDateString("fr-FR")}
                </span>
              </div>
            )}
            {mission.dateFin && (
              <div className="flex items-center gap-2 text-[#5F9598]">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  Au {new Date(mission.dateFin).toLocaleDateString("fr-FR")}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#061E29]">
              Spécialités requises:
            </p>
            <div className="flex gap-2 flex-wrap">
              {mission.specialitesRequises.map((spec, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-xs bg-[#F3F4F4] text-[#1D546D] border-[#5F9598]"
                >
                  {spec.specialiteRequise} ({getExperienceLabel(spec.anneesExperienceMin)})
                </Badge>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#5F9598] border-opacity-20">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#5F9598]">
                {mission.nombreCandidatures} candidature
                {mission.nombreCandidatures !== 1 ? "s" : ""}
              </span>
              <Button
                onClick={onViewCandidatures}
                variant="outline"
                size="sm"
                className="border-[#1D546D] text-[#1D546D] hover:bg-[#1D546D] hover:text-white"
              >
                Voir les candidatures
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MissionFormDialog: React.FC<{
  mission?: Mission;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}> = ({ mission, open, onOpenChange, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categories, setCategories] = useState<SpecialtyCategory[]>([]);
  const [formData, setFormData] = useState<Partial<Mission>>({
    titre: "",
    description: "",
    dateDebut: "",
    dateFin: "",
    urgence: "Normale",
    statut: "Brouillon",
    specialitesRequises: [],
  });
  const [dateDebut, setDateDebut] = useState<Date | undefined>();
  const [dateFin, setDateFin] = useState<Date | undefined>();
  const [specialitePrincipale, setSpecialitePrincipale] = useState<{
    idCategorie: number | null;
    nom: string;
  }>({ idCategorie: null, nom: "" });
  const [anneesExperience, setAnneesExperience] = useState<string>("0");

  // Charger les catégories de spécialités
  useEffect(() => {
    if (open) {
      const loadCategories = async () => {
        setLoadingCategories(true);
        try {
          const result = await getSpecialtyCategories();
          if (result.success && result.data) {
            setCategories(result.data);
          }
        } catch (error) {
          console.error("Error loading categories:", error);
        } finally {
          setLoadingCategories(false);
        }
      };
      loadCategories();
    }
  }, [open]);

  useEffect(() => {
    if (mission && open) {
      setFormData(mission);
      // Définir les dates
      setDateDebut(mission.dateDebut ? new Date(mission.dateDebut) : undefined);
      setDateFin(mission.dateFin ? new Date(mission.dateFin) : undefined);
      // Définir la spécialité principale si disponible
      if (mission.specialitesRequises.length > 0) {
        const premiereSpec = mission.specialitesRequises[0];
        setSpecialitePrincipale({
          idCategorie: premiereSpec.idCategorie || null,
          nom: premiereSpec.specialiteRequise,
        });
        // Convert years to range value
        const years = premiereSpec.anneesExperienceMin || 0;
        if (years >= 10) setAnneesExperience("10");
        else if (years >= 5) setAnneesExperience("5");
        else if (years >= 1) setAnneesExperience("1");
        else setAnneesExperience("0");
      } else {
        setSpecialitePrincipale({ idCategorie: null, nom: "" });
        setAnneesExperience("0");
      }
    } else if (open) {
      setFormData({
        titre: "",
        description: "",
        dateDebut: "",
        dateFin: "",
        urgence: "Normale",
        statut: "Brouillon",
        specialitesRequises: [],
      });
      setDateDebut(undefined);
      setDateFin(undefined);
      setSpecialitePrincipale({ idCategorie: null, nom: "" });
      setAnneesExperience("0");
    }
  }, [mission, open]);

  const handleSpecialitePrincipaleChange = (categoryId: string) => {
    const category = categories.find((c) => c.id.toString() === categoryId);
    if (category) {
      setSpecialitePrincipale({
        idCategorie: category.id,
        nom: category.name,
      });
      // Auto-remplir le titre basé sur la spécialité
      if (!mission) {
        setFormData({
          ...formData,
          titre: category.name,
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.titre) {
      toast.error("Le titre est requis");
      return;
    }

    if (!dateDebut || !dateFin) {
      toast.error("Les dates de début et de fin sont requises");
      return;
    }

    setLoading(true);
    try {
      // Créer la liste des spécialités avec uniquement la spécialité principale
      const specialitesRequises = [];

      // Ajouter la spécialité principale si elle existe
      if (specialitePrincipale.idCategorie && specialitePrincipale.nom) {
        specialitesRequises.push({
          specialiteRequise: specialitePrincipale.nom,
          anneesExperienceMin: parseInt(anneesExperience),
          idCategorie: specialitePrincipale.idCategorie,
          estObligatoire: true,
        });
      }

      const missionData = {
        titre: formData.titre!,
        description: formData.description || null,
        typePublic: null,
        dateDebut: dateDebut,
        dateFin: dateFin,
        urgence: formData.urgence || "Normale",
        statut: formData.statut || "Brouillon",
        specialitesRequises: specialitesRequises,
      };

      let result;
      if (mission) {
        result = await updateMission({ ...missionData, idMission: mission.id });
      } else {
        result = await createMission(missionData);
      }

      if (result.success) {
        toast.success(
          mission
            ? "Mission mise à jour avec succès"
            : "Mission créée avec succès"
        );
        onOpenChange(false);
        onSave();
      } else {
        toast.error(result.error || "Une erreur est survenue");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#061E29]">
            {mission ? "Modifier la mission" : "Créer une nouvelle mission"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Spécialité principale - DISABLED IN EDIT MODE */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#061E29]">
              Spécialité principale <span className="text-red-500">*</span>
              {mission && <span className="text-xs text-[#5F9598] ml-2">(Non modifiable)</span>}
            </Label>
            {loadingCategories ? (
              <div className="flex items-center gap-2 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-[#1D546D]" />
                <span className="text-sm text-[#5F9598]">Chargement...</span>
              </div>
            ) : (
              <Select
                value={specialitePrincipale.idCategorie?.toString() || ""}
                onValueChange={handleSpecialitePrincipaleChange}
                disabled={!!mission}
              >
                <SelectTrigger className="w-full h-11 border border-[#5F9598] focus:border-[#1D546D] disabled:opacity-60 disabled:cursor-not-allowed">
                  <SelectValue placeholder="Sélectionnez la spécialité principale" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Années d'expérience - SELECT BOX */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#061E29]">
              Années d&apos;expérience requises
            </Label>
            <Select
              value={anneesExperience}
              onValueChange={setAnneesExperience}
            >
              <SelectTrigger className="w-full h-11 border border-[#5F9598] focus:border-[#1D546D]">
                <SelectValue placeholder="Sélectionner l'expérience" />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_RANGES.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Titre - DISABLED IN EDIT MODE */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#061E29]">
              Titre du poste <span className="text-red-500">*</span>
              {mission && <span className="text-xs text-[#5F9598] ml-2">(Non modifiable)</span>}
            </Label>
            <Input
              value={formData.titre}
              onChange={(e) =>
                setFormData({ ...formData, titre: e.target.value })
              }
              placeholder="Ex: Psychologue clinicien"
              className="w-full h-11 border border-[#5F9598] focus:border-[#1D546D] disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={!!mission}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#061E29]">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Décrivez les responsabilités et compétences requises..."
              rows={5}
              className="w-full border border-[#5F9598] focus:border-[#1D546D] resize-none"
            />
          </div>

          {/* Dates - FIXED */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[#061E29]">
                Date de début <span className="text-red-500">*</span>
              </Label>
              <DatePicker
                date={dateDebut}
                onSelect={(date) => {
                  setDateDebut(date);
                }}
                placeholder="La date de début"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[#061E29]">
                Date de fin <span className="text-red-500">*</span>
              </Label>
              <DatePicker
                date={dateFin}
                onSelect={(date) => {
                  setDateFin(date);
                }}
                placeholder="La date de fin"
                disabled={!dateDebut}
              />
            </div>
          </div>

          {/* Urgence et Statut */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[#061E29]">
                Urgence <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.urgence}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    urgence: value as Mission["urgence"],
                  })
                }
              >
                <SelectTrigger className="w-full h-11 border border-[#5F9598] focus:border-[#1D546D]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normale">Normale</SelectItem>
                  <SelectItem value="Haute">Haute</SelectItem>
                  <SelectItem value="Urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[#061E29]">
                Statut <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.statut}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    statut: value as Mission["statut"],
                  })
                }
              >
                <SelectTrigger className="w-full h-11 border border-[#5F9598] focus:border-[#1D546D]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Brouillon">Brouillon</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Terminée">Terminée</SelectItem>
                  <SelectItem value="Annulée">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-[#1D546D] hover:bg-[#061E29] text-white"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {mission ? "Mise à jour..." : "Création..."}
              </>
            ) : mission ? (
              "Mettre à jour"
            ) : (
              "Créer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Missions: React.FC = () => {
  const router = useRouter();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatut, setFilterStatut] = useState<string>("all");
  const [filterUrgence, setFilterUrgence] = useState<string>("all");
  const [editingMission, setEditingMission] = useState<Mission | undefined>();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Charger les missions
  const loadMissions = async () => {
    setLoading(true);
    try {
      const result = await getMissions({
        statut: filterStatut,
        urgence: filterUrgence,
        search: searchTerm || undefined,
      });

      if (result.success && result.data) {
        setMissions(result.data);
      } else {
        toast.error(result.error || "Erreur lors du chargement des missions");
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des missions");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatut, filterUrgence]);

  // Recherche avec debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadMissions();
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const filteredMissions = missions.filter((mission) => {
    const matchSearch =
      mission.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatut =
      filterStatut === "all" || mission.statut === filterStatut;
    const matchUrgence =
      filterUrgence === "all" || mission.urgence === filterUrgence;

    return matchSearch && matchStatut && matchUrgence;
  });

  const handleSaveMission = async () => {
    await loadMissions();
    setEditingMission(undefined);
  };

  const handleDeleteMission = async (id: string) => {
    try {
      const result = await deleteMission(id);
      if (result.success) {
        toast.success("Mission supprimée avec succès");
        await loadMissions();
      } else {
        toast.error(result.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression");
      console.error(error);
    }
  };

  const handleViewCandidatures = (missionId: string) => {
    // Redirect to candidature page with mission filter
    router.push(`/enterprise/candidature?mission=${missionId}`);
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <div className="flex flex-1 flex-col p-6 md:p-8 space-y-6 bg-[#F3F4F4]">
          {/* En-tête */}
          <div className="flex items-center justify-between bg-[#1D546D] rounded-xl p-6 shadow-lg">
            <div>
              <h1 className="text-3xl font-bold text-white">Mes Missions</h1>
              <p className="text-[#F3F4F4] text-opacity-90 mt-1">
                Gérez vos missions et consultez les candidatures
              </p>
            </div>
            <MissionFormDialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
              onSave={handleSaveMission}
            />
            {editingMission && (
              <MissionFormDialog
                mission={editingMission}
                open={isEditDialogOpen}
                onOpenChange={(open) => {
                  setIsEditDialogOpen(open);
                  if (!open) setEditingMission(undefined);
                }}
                onSave={handleSaveMission}
              />
            )}
            <Button
              className="bg-[#061E29] text-white hover:bg-[#5F9598]"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer nouvelle mission
            </Button>
          </div>

          {/* Barre de recherche et filtres */}
          <Card className="border-none shadow-lg bg-white">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Search bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#5F9598]" />
                  <Input
                    placeholder="Rechercher une mission..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-[#5F9598] focus:border-[#1D546D]"
                  />
                </div>

                {/* Filters in one row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Select value={filterStatut} onValueChange={setFilterStatut}>
                    <SelectTrigger className="border-[#5F9598]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="Brouillon">Brouillon</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Terminée">Terminée</SelectItem>
                      <SelectItem value="Annulée">Annulée</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filterUrgence}
                    onValueChange={setFilterUrgence}
                  >
                    <SelectTrigger className="border-[#5F9598]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Urgence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes urgences</SelectItem>
                      <SelectItem value="Normale">Normale</SelectItem>
                      <SelectItem value="Haute">Haute</SelectItem>
                      <SelectItem value="Urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilterStatut("all");
                      setFilterUrgence("all");
                      setSearchTerm("");
                    }}
                    className="border-[#1D546D] text-[#1D546D] hover:bg-[#1D546D] hover:text-white"
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des missions */}
          {loading ? (
            <Card className="border-none shadow-lg bg-white">
              <CardContent className="py-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#1D546D] mb-4" />
                <p className="text-[#5F9598] text-lg">
                  Chargement des missions...
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
              {filteredMissions.length > 0 ? (
                filteredMissions.map((mission) => (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    onEdit={() => {
                      setEditingMission(mission);
                      setIsEditDialogOpen(true);
                    }}
                    onDelete={() => handleDeleteMission(mission.id)}
                    onViewCandidatures={() =>
                      handleViewCandidatures(mission.id)
                    }
                  />
                ))
              ) : (
                <Card className="border-none shadow-lg bg-white">
                  <CardContent className="py-12 text-center">
                    <p className="text-[#5F9598] text-lg">
                      Aucune mission trouvée
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Missions;