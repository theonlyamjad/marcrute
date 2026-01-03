// src/components/worker/onboarding/step-personal.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue,} from "@/components/ui/select";
import { User, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { updateWorkerProfile } from "@/actions/worker/profile";
import { getRegionsWithCities } from "@/actions/worker/profile";

interface StepPersonalProps {
  onNext: () => void;
  onBack: () => void;
}

export function StepPersonal({ onNext, onBack }: StepPersonalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [regions, setRegions] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    telephone: "",
    idRegion: "",
    idVille: "",
    anneesExperience: 0,
    biographie: "",
  });

  // Load regions
  useEffect(() => {
    const loadRegions = async () => {
      const result = await getRegionsWithCities();
      if (result.success && result.data) {
        setRegions(result.data);
      }
    };
    loadRegions();
  }, []);

  const selectedRegion = regions.find((r) => r.idRegion === formData.idRegion);
  const cities = selectedRegion?.villes || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.telephone || !formData.idVille) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsLoading(true);

    const result = await updateWorkerProfile({
      telephone: formData.telephone,
      idVille: formData.idVille,
      anneesExperience: formData.anneesExperience,
      biographie: formData.biographie || null,
    });

    setIsLoading(false);

    if (result.success) {
      toast.success("Informations personnelles enregistrées");
      onNext();
    } else {
      toast.error(result.error || "Erreur lors de l'enregistrement");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-[#5F9598] to-[#1D546D] rounded-full mb-2">
          <User className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-[#061E29]">
          Informations personnelles
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Partagez quelques informations pour compléter votre profil
        </p>
      </div>

      {/* Form */}
      <Card className="border-[#1D546D]/20">
        <CardContent className="pt-6 space-y-4">
          {/* Phone */}
          <div className="space-y-2">
            <Label>Numéro de téléphone *</Label>
            <Input
              type="tel"
              value={formData.telephone}
              onChange={(e) =>
                setFormData({ ...formData, telephone: e.target.value })
              }
              placeholder="+212600000000 ou 0600000000"
              required
            />
            <p className="text-xs text-gray-500">
              Format: +212600000000 ou 0600000000
            </p>
          </div>

          {/* Region, City, Years - INLINE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Region */}
            <div className="space-y-2">
              <Label>Région *</Label>
              <Select
                value={formData.idRegion}
                onValueChange={(value) => {
                  setFormData({ ...formData, idRegion: value, idVille: "" });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.idRegion} value={region.idRegion}>
                      {region.nomRegion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label>Ville *</Label>
              <Select
                value={formData.idVille}
                onValueChange={(value) =>
                  setFormData({ ...formData, idVille: value })
                }
                disabled={!formData.idRegion}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city: any) => (
                    <SelectItem key={city.idVille} value={city.idVille}>
                      {city.nomVille}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Years of Experience */}
            <div className="space-y-2">
              <Label>Années d'expérience</Label>
              <Select
                value={formData.anneesExperience.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, anneesExperience: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year === 0 ? "Débutant" : `${year}+ ans`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Biography */}
          <div className="space-y-2">
            <Label>Biographie</Label>
            <Textarea
              value={formData.biographie}
              onChange={(e) =>
                setFormData({ ...formData, biographie: e.target.value })
              }
              placeholder="Parlez-nous de vous..."
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 text-right">
              {formData.biographie.length}/1000
            </p>
          </div>
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
          disabled={isLoading || !formData.telephone || !formData.idVille}
          className="bg-[#5F9598] hover:bg-[#1D546D] text-white"
        >
          {isLoading ? "Enregistrement..." : "Continuer"}
        </Button>
      </div>
    </form>
  );
}