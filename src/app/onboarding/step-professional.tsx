"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Briefcase, GraduationCap, Star, ChevronLeft, Plus, Upload, FileCheck } from "lucide-react";
import { toast } from "sonner";
import { addWorkerExperience } from "@/actions/worker/experience";
import { uploadDiploma } from "@/actions/worker/upload-diploma";
import { addWorkerSpecialty, getSpecialtyCategories } from "@/actions/worker/specialities";

interface StepProfessionalProps {
  onNext: () => void;
  onBack: () => void;
  isLastStep: boolean;
}

export function StepProfessional({ onNext, onBack, isLastStep }: StepProfessionalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [specialtyCategories, setSpecialtyCategories] = useState<any[]>([]);
  
  // Experiences
  const [experience, setExperience] = useState({
    titrePoste: "",
    organisation: "",
    description: "",
    dateDebut: "",
    dateFin: "",
  });
  const [hasExperience, setHasExperience] = useState(false);

  // Diplomas with PDF upload
  const [diploma, setDiploma] = useState({
    nomDiplome: "",
    nomInstitution: "",
    pdfFile: "", // base64
    fileName: "",
    fileSize: 0,
  });
  const [hasDiploma, setHasDiploma] = useState(false);

  // Specialties
  const [specialty, setSpecialty] = useState({
    idCategorie: "",
    niveau: "",
    anneesExperience: "",
  });
  const [hasSpecialty, setHasSpecialty] = useState(false);

  // Load specialty categories
  useEffect(() => {
    const loadCategories = async () => {
      const result = await getSpecialtyCategories();
      if (result.success && result.data) {
        setSpecialtyCategories(result.data);
      }
    };
    loadCategories();
  }, []);

  const canSubmit = hasExperience && hasDiploma && hasSpecialty;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      toast.error("Seuls les fichiers PDF sont acceptés");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Le fichier ne doit pas dépasser 5MB");
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setDiploma({
        ...diploma,
        pdfFile: base64.split(",")[1], // Remove data:application/pdf;base64,
        fileName: file.name,
        fileSize: file.size,
      });
      toast.success(`Fichier sélectionné: ${file.name}`);
    };
    reader.onerror = () => {
      toast.error("Erreur lors de la lecture du fichier");
    };
    reader.readAsDataURL(file);
  };

  const handleAddExperience = async () => {
    if (!experience.titrePoste || !experience.organisation || !experience.dateDebut) {
      toast.error("Veuillez remplir tous les champs obligatoires de l'expérience");
      return;
    }

    const result = await addWorkerExperience({
      titrePoste: experience.titrePoste,
      organisation: experience.organisation,
      description: experience.description || null,
      dateDebut: new Date(experience.dateDebut),
      dateFin: experience.dateFin ? new Date(experience.dateFin) : null,
    });

    if (result.success) {
      setHasExperience(true);
      toast.success("Expérience ajoutée");
    } else {
      toast.error(result.error || "Erreur");
    }
  };

  const handleAddDiploma = async () => {
    if (!diploma.nomDiplome || !diploma.nomInstitution) {
      toast.error("Veuillez remplir tous les champs du diplôme");
      return;
    }

    if (!diploma.pdfFile) {
      toast.error("Veuillez télécharger le fichier PDF du diplôme");
      return;
    }

    const result = await uploadDiploma({
      nomDiplome: diploma.nomDiplome,
      nomInstitution: diploma.nomInstitution,
      pdfFile: diploma.pdfFile,
      fileName: diploma.fileName,
      fileSize: diploma.fileSize,
    });

    if (result.success) {
      setHasDiploma(true);
      toast.success("Diplôme téléchargé avec succès");
    } else {
      toast.error(result.error || "Erreur");
    }
  };

  const handleAddSpecialty = async () => {
    if (!specialty.idCategorie) {
      toast.error("Veuillez sélectionner une spécialité");
      return;
    }

    const result = await addWorkerSpecialty({
      idCategorie: parseInt(specialty.idCategorie),
      niveau: specialty.niveau as "Débutant" | "Intermédiaire" | "Avancé" | "Expert" | null,
      anneesExperience: specialty.anneesExperience ? parseInt(specialty.anneesExperience) : null,
    });

    if (result.success) {
      setHasSpecialty(true);
      toast.success("Spécialité ajoutée");
    } else {
      toast.error(result.error || "Erreur");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) {
      toast.error("Veuillez compléter au moins une expérience, un diplôme et une spécialité");
      return;
    }

    toast.success("Profil complété avec succès!");
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-[#5F9598] to-[#1D546D] rounded-full mb-2">
          <Briefcase className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-[#061E29]">
          Informations professionnelles
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Ajoutez au moins une expérience, un diplôme et une spécialité
        </p>
      </div>

      {/* Experience */}
      <Card className="border-[#5F9598]/30 bg-[#5F9598]/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-[#5F9598]" />
            Expérience professionnelle
            {hasExperience && (
              <Badge className="bg-green-500 text-white">✓ Ajoutée</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!hasExperience ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Titre du poste *</Label>
                  <Input
                    value={experience.titrePoste}
                    onChange={(e) =>
                      setExperience({ ...experience, titrePoste: e.target.value })
                    }
                    placeholder="Ex: Assistant Social"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Organisation *</Label>
                  <Input
                    value={experience.organisation}
                    onChange={(e) =>
                      setExperience({ ...experience, organisation: e.target.value })
                    }
                    placeholder="Ex: Hôpital"
                    className="h-9"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Date début *</Label>
                  <Input
                    type="date"
                    value={experience.dateDebut}
                    onChange={(e) =>
                      setExperience({ ...experience, dateDebut: e.target.value })
                    }
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Date fin</Label>
                  <Input
                    type="date"
                    value={experience.dateFin}
                    onChange={(e) =>
                      setExperience({ ...experience, dateFin: e.target.value })
                    }
                    className="h-9"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Textarea
                  value={experience.description}
                  onChange={(e) =>
                    setExperience({ ...experience, description: e.target.value })
                  }
                  placeholder="Vos responsabilités..."
                  rows={2}
                  className="text-sm"
                />
              </div>
              <Button
                type="button"
                onClick={handleAddExperience}
                size="sm"
                className="w-full bg-[#5F9598] hover:bg-[#1D546D]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter l'expérience
              </Button>
            </>
          ) : (
            <div className="text-center py-4 text-green-700 flex items-center justify-center gap-2">
              <FileCheck className="h-5 w-5" />
              Expérience enregistrée
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diploma with PDF Upload */}
      <Card className="border-[#5F9598]/30 bg-[#5F9598]/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-[#5F9598]" />
            Diplôme (avec PDF)
            {hasDiploma && (
              <Badge className="bg-green-500 text-white">✓ Ajouté</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!hasDiploma ? (
            <>
              <div className="space-y-1">
                <Label className="text-xs">Nom du diplôme *</Label>
                <Input
                  value={diploma.nomDiplome}
                  onChange={(e) =>
                    setDiploma({ ...diploma, nomDiplome: e.target.value })
                  }
                  placeholder="Ex: Licence en Travail Social"
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Institution *</Label>
                <Input
                  value={diploma.nomInstitution}
                  onChange={(e) =>
                    setDiploma({ ...diploma, nomInstitution: e.target.value })
                  }
                  placeholder="Ex: Université Mohammed V"
                  className="h-9"
                />
              </div>
              
              {/* PDF Upload */}
              <div className="space-y-2">
                <Label className="text-xs">Fichier PDF du diplôme *</Label>
                <div className="border-2 border-dashed border-[#5F9598]/30 rounded-lg p-4 text-center hover:border-[#5F9598] transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="diploma-upload"
                  />
                  <label
                    htmlFor="diploma-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-[#5F9598]" />
                    {diploma.fileName ? (
                      <div className="text-sm">
                        <p className="font-medium text-green-700">
                          ✓ {diploma.fileName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(diploma.fileSize / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">Cliquez pour télécharger</p>
                        <p className="text-xs">PDF uniquement (max 5MB)</p>
                      </div>
                    )}
                  </label>
                </div>
                <p className="text-xs text-amber-600 flex items-start gap-1">
                  <span>⚠️</span>
                  <span>Votre diplôme sera vérifié par un administrateur</span>
                </p>
              </div>

              <Button
                type="button"
                onClick={handleAddDiploma}
                size="sm"
                className="w-full bg-[#5F9598] hover:bg-[#1D546D]"
                disabled={!diploma.pdfFile}
              >
                <Plus className="h-4 w-4 mr-2" />
                Télécharger le diplôme
              </Button>
            </>
          ) : (
            <div className="text-center py-4 text-green-700 flex items-center justify-center gap-2">
              <FileCheck className="h-5 w-5" />
              Diplôme téléchargé (en attente de vérification)
            </div>
          )}
        </CardContent>
      </Card>

      {/* Specialty */}
      <Card className="border-[#5F9598]/30 bg-[#5F9598]/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-[#5F9598]" />
            Spécialité
            {hasSpecialty && (
              <Badge className="bg-green-500 text-white">✓ Ajoutée</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!hasSpecialty ? (
            <>
              <div className="space-y-1">
                <Label className="text-xs">Spécialité *</Label>
                <Select
                  value={specialty.idCategorie}
                  onValueChange={(value) =>
                    setSpecialty({ ...specialty, idCategorie: value })
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialtyCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Niveau</Label>
                  <Select
                    value={specialty.niveau}
                    onValueChange={(value) =>
                      setSpecialty({ ...specialty, niveau: value })
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Débutant">Débutant</SelectItem>
                      <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                      <SelectItem value="Avancé">Avancé</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Années</Label>
                  <Select
                    value={specialty.anneesExperience}
                    onValueChange={(value) =>
                      setSpecialty({ ...specialty, anneesExperience: value })
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Exp" />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year} an{year > 1 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                type="button"
                onClick={handleAddSpecialty}
                size="sm"
                className="w-full bg-[#5F9598] hover:bg-[#1D546D]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter la spécialité
              </Button>
            </>
          ) : (
            <div className="text-center py-4 text-green-700 flex items-center justify-center gap-2">
              <FileCheck className="h-5 w-5" />
              Spécialité enregistrée
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="border-[#1D546D]/30"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !canSubmit}
          className="bg-[#5F9598] hover:bg-[#1D546D] text-white"
        >
          {isLoading ? "Finalisation..." : "Terminer"}
        </Button>
      </div>
    </form>
  );
}