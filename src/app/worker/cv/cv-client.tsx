"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue,} from "@/components/ui/select";
import {Briefcase,GraduationCap,Star,Plus,Trash2,CheckCircle,AlertCircle,X,} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {addWorkerExperience,deleteWorkerExperience,} from "@/actions/worker/experience";
import {addWorkerDiploma,deleteWorkerDiploma,} from "@/actions/worker/diplomes";
import {addWorkerSpecialty,deleteWorkerSpecialty,} from "@/actions/worker/specialities";

interface CVPageClientProps {
  initialExperiences: any[];
  initialDiplomas: any[];
  initialSpecialties: any[];
  availableCategories: any[];
}

export function CVPageClient({
  initialExperiences,
  initialDiplomas,
  initialSpecialties,
  availableCategories,
}: CVPageClientProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Experiences
  const [experiences, setExperiences] = useState(initialExperiences);
  const [newExperience, setNewExperience] = useState({
    titrePoste: "",
    organisation: "",
    description: "",
    dateDebut: "",
    dateFin: "",
  });
  const [isAddingExperience, setIsAddingExperience] = useState(false);

  // Diplomas
  const [diplomas, setDiplomas] = useState(initialDiplomas);
  const [newDiploma, setNewDiploma] = useState({
    nomDiplome: "",
    nomInstitution: "",
    fileName: "",
    fileSize: 0,
  });
  const [isAddingDiploma, setIsAddingDiploma] = useState(false);

  // Specialties
  const [specialties, setSpecialties] = useState(initialSpecialties);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedYears, setSelectedYears] = useState<number>(0);
  const [isAddingSpecialty, setIsAddingSpecialty] = useState(false);

  // Experience handlers
  const handleAddExperience = async () => {
    if (!newExperience.titrePoste || !newExperience.organisation || !newExperience.dateDebut) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSaving(true);
    const result = await addWorkerExperience({
      titrePoste: newExperience.titrePoste,
      organisation: newExperience.organisation,
      description: newExperience.description || null,
      dateDebut: new Date(newExperience.dateDebut),
      dateFin: newExperience.dateFin ? new Date(newExperience.dateFin) : null,
    });

    if (result.success) {
      setExperiences([...experiences, result.data]);
      setNewExperience({
        titrePoste: "",
        organisation: "",
        description: "",
        dateDebut: "",
        dateFin: "",
      });
      setIsAddingExperience(false);
      toast.success("Expérience ajoutée avec succès!");
    } else {
      toast.error(result.error || "Erreur lors de l'ajout");
    }
    setIsSaving(false);
  };

  const handleDeleteExperience = async (idExperience: string) => {
    const result = await deleteWorkerExperience({ idExperience });
    if (result.success) {
      setExperiences(experiences.filter((exp) => exp.idExperience !== idExperience));
      toast.success("Expérience supprimée");
    } else {
      toast.error(result.error || "Erreur lors de la suppression");
    }
  };

  // Diploma handlers
  const handleAddDiploma = async () => {
    if (!newDiploma.nomDiplome || !newDiploma.nomInstitution) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setIsSaving(true);
    const result = await addWorkerDiploma({
      nomDiplome: newDiploma.nomDiplome,
      nomInstitution: newDiploma.nomInstitution,
      cheminFichier: null,
    });

    if (result.success) {
      setDiplomas([...diplomas, result.data]);
      setNewDiploma({ nomDiplome: "", nomInstitution: "", fileName: "", fileSize: 0 });
      setIsAddingDiploma(false);
      toast.success("Diplôme ajouté avec succès!");
    } else {
      toast.error(result.error || "Erreur lors de l'ajout");
    }
    setIsSaving(false);
  };

  const handleDeleteDiploma = async (idDiplome: string) => {
    const result = await deleteWorkerDiploma({ idDiplome });
    if (result.success) {
      setDiplomas(diplomas.filter((dip) => dip.idDiplome !== idDiplome));
      toast.success("Diplôme supprimé");
    } else {
      toast.error(result.error || "Erreur lors de la suppression");
    }
  };

  // Specialty handlers
  const handleAddSpecialty = async () => {
    if (!selectedCategory) {
      toast.error("Veuillez sélectionner une spécialité");
      return;
    }

    setIsSaving(true);
    const result = await addWorkerSpecialty({
      idCategorie: selectedCategory,
      niveau: (selectedLevel || null) as "Débutant" | "Intermédiaire" | "Avancé" | "Expert" | null,
      anneesExperience: selectedYears || null,
    });

    if (result.success) {
      setSpecialties([...specialties, result.data]);
      setSelectedCategory(null);
      setSelectedLevel("");
      setSelectedYears(0);
      setIsAddingSpecialty(false);
      toast.success("Spécialité ajoutée avec succès!");
    } else {
      toast.error(result.error || "Erreur lors de l'ajout");
    }
    setIsSaving(false);
  };

  const handleDeleteSpecialty = async (idSpecialite: string) => {
    const result = await deleteWorkerSpecialty({ idSpecialite });
    if (result.success) {
      setSpecialties(specialties.filter((spec) => spec.idSpecialite !== idSpecialite));
      toast.success("Spécialité supprimée");
    } else {
      toast.error(result.error || "Erreur lors de la suppression");
    }
  };

  const isCVComplete = () => {
    return experiences.length > 0 && diplomas.length > 0 && specialties.length > 0;
  };

  return (
    <div className="min-h-screen bg-[#F3F4F4]">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#061E29] mb-2">Mon CV</h1>
          <p className="text-gray-600">
            Gérez vos expériences, diplômes et compétences professionnelles
          </p>
        </div>

        {/* Alerts */}
        {!isCVComplete() && (
          <Alert className="mb-6 bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Complétez votre CV pour postuler aux missions (au moins 1 expérience, 1 diplôme et 1 spécialité requis).
            </AlertDescription>
          </Alert>
        )}

        {saveSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800">
              CV enregistré avec succès !
            </AlertDescription>
          </Alert>
        )}

        {/* Main Container */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid grid-cols-3 gap-6">
            {/* LEFT COLUMN - Experiences */}
            <div className="col-span-2 space-y-6">
              <Card className="border-[#1D546D]/20 bg-[#1D546D]/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl text-[#061E29] uppercase flex items-center gap-2">
                      <Briefcase className="h-6 w-6 text-[#5F9598]" />
                      Expériences Professionnelles
                    </CardTitle>
                    <Button
                      onClick={() => setIsAddingExperience(!isAddingExperience)}
                      size="sm"
                      className="bg-[#5F9598] hover:bg-[#1D546D] cursor-pointer"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add Experience Form */}
                  {isAddingExperience && (
                    <div className="border border-[#5F9598] rounded-lg p-4 bg-white space-y-3">
                      <h4 className="font-semibold text-[#061E29] mb-2">
                        Nouvelle Expérience
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Titre du poste *</Label>
                          <Input
                            placeholder="Ex: Assistant Social"
                            className="h-9"
                            value={newExperience.titrePoste}
                            onChange={(e) =>
                              setNewExperience({ ...newExperience, titrePoste: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Organisation *</Label>
                          <Input
                            placeholder="Ex: Hôpital"
                            className="h-9"
                            value={newExperience.organisation}
                            onChange={(e) =>
                              setNewExperience({ ...newExperience, organisation: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Date début *</Label>
                          <Input
                            type="date"
                            className="h-9"
                            value={newExperience.dateDebut}
                            onChange={(e) =>
                              setNewExperience({ ...newExperience, dateDebut: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Date fin</Label>
                          <Input
                            type="date"
                            className="h-9"
                            value={newExperience.dateFin}
                            onChange={(e) =>
                              setNewExperience({ ...newExperience, dateFin: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Description</Label>
                        <Textarea
                          placeholder="Responsabilités et réalisations..."
                          rows={2}
                          className="text-sm"
                          value={newExperience.description}
                          onChange={(e) =>
                            setNewExperience({ ...newExperience, description: e.target.value })
                          }
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsAddingExperience(false)}
                        >
                          Annuler
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleAddExperience}
                          disabled={isSaving}
                          className="bg-[#5F9598] hover:bg-[#1D546D]"
                        >
                          Enregistrer
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Existing Experiences */}
                  {experiences.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-[#1D546D]/20">
                      <Briefcase className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500 text-sm">Aucune expérience ajoutée</p>
                    </div>
                  ) : (
                    experiences.map((exp) => (
                      <div
                        key={exp.idExperience}
                        className="border border-[#1D546D]/10 rounded-lg p-4 bg-white"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-[#061E29]">{exp.titrePoste}</h4>
                            <p className="text-sm text-gray-600">{exp.organisation}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(exp.dateDebut).toLocaleDateString("fr-FR")} -{" "}
                              {exp.dateFin ? new Date(exp.dateFin).toLocaleDateString("fr-FR") : "Présent"}
                            </p>
                            {exp.description && (
                              <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteExperience(exp.idExperience)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Diplomas Section */}
              <Card className="border-[#1D546D]/20 bg-[#1D546D]/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl text-[#061E29] uppercase flex items-center gap-2">
                      <GraduationCap className="h-6 w-6 text-[#5F9598]" />
                      Diplômes
                    </CardTitle>
                    <Button
                      onClick={() => setIsAddingDiploma(!isAddingDiploma)}
                      size="sm"
                      className="bg-[#5F9598] hover:bg-[#1D546D] cursor-pointer"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Add Diploma Form */}
                  {isAddingDiploma && (
                    <div className="border border-[#5F9598] rounded-lg p-4 bg-white space-y-3">
                      <h4 className="font-semibold text-[#061E29]">Nouveau Diplôme</h4>
                      <div className="space-y-2">
                        <Label className="text-xs">Nom du diplôme *</Label>
                        <Input
                          placeholder="Ex: Licence en Travail Social"
                          value={newDiploma.nomDiplome}
                          onChange={(e) =>
                            setNewDiploma({ ...newDiploma, nomDiplome: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Institution *</Label>
                        <Input
                          placeholder="Ex: Université Mohammed V"
                          value={newDiploma.nomInstitution}
                          onChange={(e) =>
                            setNewDiploma({ ...newDiploma, nomInstitution: e.target.value })
                          }
                        />
                      </div>
                      
                      {/* File Upload */}
                      <div className="space-y-2">
                        <Label className="text-xs">Fichier (PDF, JPG, PNG)</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setNewDiploma({ 
                                  ...newDiploma, 
                                  fileName: file.name,
                                  fileSize: file.size 
                                });
                                toast.success(`Fichier sélectionné: ${file.name}`);
                              }
                            }}
                            className="text-sm"
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Formats acceptés: PDF, JPG, PNG (max 5MB)
                        </p>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsAddingDiploma(false);
                            setNewDiploma({ nomDiplome: "", nomInstitution: "", fileName: "", fileSize: 0 });
                          }}
                        >
                          Annuler
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleAddDiploma}
                          disabled={isSaving}
                          className="bg-[#5F9598] hover:bg-[#1D546D]"
                        >
                          {isSaving ? "Enregistrement..." : "Enregistrer"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {diplomas.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-[#1D546D]/20">
                      <GraduationCap className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500 text-sm">Aucun diplôme ajouté</p>
                    </div>
                  ) : (
                    diplomas.map((diplome) => (
                      <div
                        key={diplome.idDiplome}
                        className="flex items-center justify-between p-3 border border-[#1D546D]/10 rounded-lg bg-white"
                      >
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-[#5F9598]" />
                          <div>
                            <p className="text-sm font-medium text-[#061E29]">
                              {diplome.nomDiplome}
                            </p>
                            <p className="text-xs text-gray-500">{diplome.nomInstitution}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  diplome.statut === "Vérifié" 
                                    ? "bg-green-50 text-green-700 border-green-200" 
                                    : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                }`}
                              >
                                {diplome.statut || "En attente"}
                              </Badge>
                              {diplome.cheminFichier && (
                                <Badge variant="outline" className="text-xs">
                                  📎 Fichier joint
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDiploma(diplome.idDiplome)}
                          className="text-red-600 hover:text-red-700 h-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* RIGHT COLUMN - Specialties */}
            <div className="space-y-6">
              <Card className="border-[#5F9598]/30 bg-[#5F9598]/10">
                <CardHeader>
                  <CardTitle className="text-xl text-[#061E29] uppercase flex items-center gap-2">
                    <Star className="h-5 w-5 text-[#5F9598]" />
                    Spécialités
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add Specialty Button */}
                  {!isAddingSpecialty ? (
                    <Button
                      onClick={() => setIsAddingSpecialty(true)}
                      size="sm"
                      className="w-full bg-[#5F9598] hover:bg-[#1D546D]"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter une spécialité
                    </Button>
                  ) : (
                    <div className="space-y-3 border border-[#5F9598] rounded-lg p-3 bg-white">
                      <Select
                        value={selectedCategory?.toString()}
                        onValueChange={(value) => setSelectedCategory(parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une spécialité" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                        <SelectTrigger>
                          <SelectValue placeholder="Niveau" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Débutant">Débutant</SelectItem>
                          <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                          <SelectItem value="Avancé">Avancé</SelectItem>
                          <SelectItem value="Expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={selectedYears.toString()}
                        onValueChange={(value) => setSelectedYears(parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Années d'expérience" />
                        </SelectTrigger>
                        <SelectContent>
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year} {year > 1 ? "ans" : "an"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setIsAddingSpecialty(false)}
                        >
                          Annuler
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-[#5F9598] hover:bg-[#1D546D]"
                          onClick={handleAddSpecialty}
                          disabled={isSaving || !selectedCategory}
                        >
                          Ajouter
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Specialties List */}
                  {specialties.length > 0 ? (
                    <div className="space-y-2">
                      {specialties.map((spec) => (
                        <div
                          key={spec.idSpecialite}
                          className="flex items-center justify-between p-2 bg-white rounded border border-[#5F9598]/20"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[#061E29]">
                              {spec.categorie?.name || spec.nomSpecialite}
                            </p>
                            <div className="flex gap-2 mt-1">
                              {spec.niveau && (
                                <Badge variant="outline" className="text-xs">
                                  {spec.niveau}
                                </Badge>
                              )}
                              {spec.anneesExperience !== null && (
                                <Badge variant="outline" className="text-xs">
                                  {spec.anneesExperience} an{spec.anneesExperience > 1 ? "s" : ""}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSpecialty(spec.idSpecialite)}
                            className="text-red-600 hover:text-red-700 h-7"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-white rounded-lg border-2 border-dashed border-[#5F9598]/20">
                      <Star className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500 text-xs">Aucune spécialité</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}