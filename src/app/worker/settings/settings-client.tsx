// src/app/worker/settings/settings-client.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue,} from "@/components/ui/select";
import { User, Lock, Save, CheckCircle, Eye, EyeClosed, Briefcase } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { updateWorkerProfile } from "@/actions/worker/profile";
import { toast } from "sonner";

interface SettingsPageClientProps {
  initialProfile: {
    nomComplet: string;
    email: string;
    telephone: string;
    idVille: string;
    biographie: string;
    regionId: string;
    anneesExperience: number | null;
  };
  regions: Array<{ value: string; label: string }>;
  villes: Array<{ value: string; label: string; regionId: string }>;
}

export function SettingsPageClient({
  initialProfile,
  regions,
  villes,
}: SettingsPageClientProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Personal Info
  const [profile, setProfile] = useState(initialProfile);
  const [selectedRegion, setSelectedRegion] = useState(initialProfile.regionId);
  const [filteredVilles, setFilteredVilles] = useState(villes);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Filter cities when region changes
  useEffect(() => {
    if (selectedRegion) {
      const filtered = villes.filter((ville) => ville.regionId === selectedRegion);
      setFilteredVilles(filtered);
      
      const currentVilleInRegion = filtered.find((v) => v.value === profile.idVille);
      if (!currentVilleInRegion) {
        setProfile((prev) => ({ ...prev, idVille: "" }));
      }
    } else {
      setFilteredVilles(villes);
    }
  }, [selectedRegion, villes, profile.idVille]);

  const handleSaveProfile = async () => {
    // Basic validation
    if (profile.telephone && !/^[\+\d\s\-\(\)]+$/.test(profile.telephone)) {
      toast.error("Format de téléphone invalide");
      return;
    }

    setIsSaving(true);

    try {
      const result = await updateWorkerProfile({
        telephone: profile.telephone || undefined,
        idVille: profile.idVille || null,
        biographie: profile.biographie || null,
        anneesExperience: profile.anneesExperience,
      });

      if (result.success) {
        setSaveSuccess(true);
        toast.success("Profil mis à jour avec succès!");
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        toast.error(result.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setIsSaving(true);
    
    // TODO: Implement password change API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setIsSaving(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    
    toast.success("Mot de passe changé avec succès!");
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F3F4F4]">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#061E29] mb-2">Paramètres</h1>
          <p className="text-gray-600">
            Gérez vos informations personnelles et préférences
          </p>
        </div>

        {/* Success Alert */}
        {saveSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800">
              Modifications enregistrées avec succès !
            </AlertDescription>
          </Alert>
        )}

        {/* Main Container */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid grid-cols-2 gap-6">
            {/* LEFT SIDE - Personal Information */}
            <Card className="border-[#1D546D]/20 bg-[#1D546D]/5">
              <CardHeader>
                <CardTitle className="text-2xl text-[#061E29] uppercase flex items-center gap-2">
                  <User className="h-6 w-6 text-[#5F9598]" />
                  Informations Personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Name and Email (readonly) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom Complet</Label>
                    <Input
                      value={profile.nomComplet}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={profile.email} disabled className="bg-gray-100" />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label>Téléphone *</Label>
                  <Input
                    value={profile.telephone}
                    onChange={(e) =>
                      setProfile({ ...profile, telephone: e.target.value })
                    }
                    placeholder="+212 6 00 00 00 00"
                  />
                  <p className="text-xs text-gray-500">
                    Format: +212 6 00 00 00 00 ou 0600000000
                  </p>
                </div>

                {/* Region and City */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Région *</Label>
                    <Select
                      value={selectedRegion}
                      onValueChange={(value) => {
                        setSelectedRegion(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre région" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region.value} value={region.value}>
                            {region.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Ville *</Label>
                    <Select
                      value={profile.idVille}
                      onValueChange={(value) =>
                        setProfile({ ...profile, idVille: value })
                      }
                      disabled={!selectedRegion}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre ville" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredVilles.map((ville) => (
                          <SelectItem key={ville.value} value={ville.value}>
                            {ville.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Years of Experience */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Années d'expérience
                  </Label>
                  <Select
                    value={profile.anneesExperience?.toString() || ""}
                    onValueChange={(value) =>
                      setProfile({
                        ...profile,
                        anneesExperience: value ? parseInt(value) : null,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez vos années d'expérience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Débutant (0 an)</SelectItem>
                      <SelectItem value="1">1 an</SelectItem>
                      <SelectItem value="2">2 ans</SelectItem>
                      <SelectItem value="3">3 ans</SelectItem>
                      <SelectItem value="4">4 ans</SelectItem>
                      <SelectItem value="5">5 ans</SelectItem>
                      <SelectItem value="6">6-10 ans</SelectItem>
                      <SelectItem value="10">10-15 ans</SelectItem>
                      <SelectItem value="15">15-20 ans</SelectItem>
                      <SelectItem value="20">20+ ans</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label>Biographie</Label>
                  <Textarea
                    placeholder="Parlez-nous de vous, vos motivations, vos objectifs professionnels..."
                    rows={5}
                    value={profile.biographie}
                    onChange={(e) =>
                      setProfile({ ...profile, biographie: e.target.value })
                    }
                    maxLength={1000}
                  />
                  <p className="text-xs text-gray-500">
                    Cette biographie sera visible par les institutions ({profile.biographie.length}/1000 caractères)
                  </p>
                </div>

                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="w-full bg-[#5F9598] hover:bg-[#1D546D] cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer les informations
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* RIGHT SIDE - Change Password */}
            <Card className="border-[#5F9598]/30 bg-[#5F9598]/10">
              <CardHeader>
                <CardTitle className="text-2xl text-[#061E29] uppercase flex items-center gap-2">
                  <Lock className="h-6 w-6 text-[#5F9598]" />
                  Changer le mot de passe
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Password */}
                <div className="space-y-2">
                  <Label>Mot de passe actuel</Label>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Entrez votre mot de passe actuel"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showCurrentPassword ? (
                        <EyeClosed className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label>Nouveau mot de passe</Label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Au moins 8 caractères"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? (
                        <EyeClosed className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label>Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Retapez le nouveau mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <EyeClosed className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleChangePassword}
                  disabled={
                    isSaving || !currentPassword || !newPassword || !confirmPassword
                  }
                  className="w-full bg-[#5F9598] hover:bg-[#1D546D] cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Modification...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Changer le mot de passe
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}