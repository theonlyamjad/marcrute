"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Lock,
  Save,
  CheckCircle,
  Eye, 
  EyeClosed
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";


// Mock data - TODO: Replace with actual API calls
const MOCK_USER = {
  nomComplet: "Amjad Bouazzaoui",
  email: "amjad@example.com",
  telephone: "+212 6 12 34 56 78",
  ville: "agadir",
  region: "souss-massa",
  codePostal: "80000",
  adresse: "",
  biographie: "",
};

const REGIONS = [
  { value: "tanger-tetouan-al-hoceima", label: "Tanger-Tétouan-Al Hoceïma" },
  { value: "oriental", label: "L'Oriental" },
  { value: "fes-meknes", label: "Fès-Meknès" },
  { value: "rabat-sale-kenitra", label: "Rabat-Salé-Kénitra" },
  { value: "beni-mellal-khenifra", label: "Béni Mellal-Khénifra" },
  { value: "casablanca-settat", label: "Casablanca-Settat" },
  { value: "marrakech-safi", label: "Marrakech-Safi" },
  { value: "draa-tafilalet", label: "Drâa-Tafilalet" },
  { value: "souss-massa", label: "Souss-Massa" },
  { value: "guelmim-oued-noun", label: "Guelmim-Oued Noun" },
  { value: "laayoune-sakia-el-hamra", label: "Laâyoune-Sakia El Hamra" },
  { value: "dakhla-oued-ed-dahab", label: "Dakhla-Oued Ed-Dahab" },
];

const VILLES = [
  { value: "agadir", label: "Agadir" },
  { value: "casablanca", label: "Casablanca" },
  { value: "rabat", label: "Rabat" },
  { value: "marrakech", label: "Marrakech" },
  { value: "tanger", label: "Tanger" },
  { value: "fes", label: "Fès" },
  { value: "meknes", label: "Meknès" },
  { value: "sale", label: "Salé" },
  { value: "kenitra", label: "Kénitra" },
  { value: "oujda", label: "Oujda" },
];

export default function WorkerSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Personal Info
  const [profile, setProfile] = useState(MOCK_USER);
  
  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    // TODO: Save to API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }
    if (newPassword.length < 8) {
      alert("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    
    setIsSaving(true);
    // TODO: Change password via API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    
    // Reset fields
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    
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
                      <Input value={profile.nomComplet} disabled className="bg-gray-100" />
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
                  </div>

                  {/* Region and City */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Région *</Label>
                      <Select
                        value={profile.region}
                        onValueChange={(value) =>
                          setProfile({ ...profile, region: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez votre région" />
                        </SelectTrigger>
                        <SelectContent>
                          {REGIONS.map((region) => (
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
                        value={profile.ville}
                        onValueChange={(value) =>
                          setProfile({ ...profile, ville: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez votre ville" />
                        </SelectTrigger>
                        <SelectContent>
                          {VILLES.map((ville) => (
                            <SelectItem key={ville.value} value={ville.value}>
                              {ville.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Postal Code */}
                  <div className="space-y-2">
                    <Label>Code Postal *</Label>
                    <Input
                      value={profile.codePostal}
                      onChange={(e) =>
                        setProfile({ ...profile, codePostal: e.target.value })
                      }
                      placeholder="Ex: 80000"
                      maxLength={5}
                    />
                  </div>

                  {/* Home Address */}
                  <div className="space-y-2">
                    <Label>Adresse *</Label>
                    <Textarea
                      placeholder="Numéro, rue, quartier..."
                      rows={2}
                      value={profile.adresse}
                      onChange={(e) =>
                        setProfile({ ...profile, adresse: e.target.value })
                      }
                    />
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
                    />
                    <p className="text-xs text-gray-500">
                      Cette biographie sera visible par les institutions
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
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                    disabled={isSaving || !currentPassword || !newPassword || !confirmPassword}
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