"use client";

import React, { useState, useEffect } from "react";
import { Building2, Phone, Mail, MapPin, Lock, Save, Loader2, Globe, Eye, EyeClosed } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/enterprise-dashboard/components/app-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  getInstitutionProfile,
  updateInstitution,
  updateUserProfile,
  updatePassword,
  getRegionsWithCities,
} from "@/actions/enterprise/settings";
import { toast } from "sonner";

// --- Interfaces ---
interface Region {
  idRegion: string;
  nomRegion: string;
  villes: { idVille: string; nomVille: string }[];
}

interface City {
  idVille: string;
  nomVille: string;
}

const SettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [profile, setProfile] = useState<{
    institution: {
      nomInstitution: string;
      adresse: string;
      telephoneInstitution: string;
      siteWeb: string;
      url: string;
      idVille: string | null;
      ville: {
        idVille: string;
        nomVille: string;
        region: {
          idRegion: string;
          nomRegion: string;
        };
      } | null;
    };
    user: {
      nomComplet: string;
      telephone: string;
      email: string;
    };
  } | null>(null);

  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  
  const [institutionData, setInstitutionData] = useState({
    nomInstitution: "",
    adresse: "",
    telephoneInstitution: "",
    siteWeb: "",
    url: "",
    idRegion: undefined as string | undefined,
    idVille: undefined as string | undefined,
  });

  const [userData, setUserData] = useState({
    nomComplet: "",
    telephone: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [profileResult, regionsResult] = await Promise.all([
          getInstitutionProfile(),
          getRegionsWithCities(),
        ]);

        if (profileResult.success && profileResult.data) {
          setProfile(profileResult.data);
          
          const inst = profileResult.data.institution;
          setInstitutionData({
            nomInstitution: inst.nomInstitution || "",
            adresse: inst.adresse || "",
            telephoneInstitution: inst.telephoneInstitution || "",
            siteWeb: inst.siteWeb || "",
            url: inst.url || "",
            idRegion: inst.ville?.region?.idRegion || undefined,
            idVille: inst.idVille || undefined,
          });

          setUserData({
            nomComplet: profileResult.data.user.nomComplet || "",
            telephone: profileResult.data.user.telephone || "",
          });
        }

        if (regionsResult.success && regionsResult.data) {
          setRegions(regionsResult.data);
        }
      } catch (error) {
        toast.error("Erreur lors du chargement des paramètres");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Update cities when region changes
  useEffect(() => {
    if (institutionData.idRegion) {
      const selectedRegion = regions.find(r => r.idRegion === institutionData.idRegion);
      if (selectedRegion) {
        setCities(selectedRegion.villes);
      } else {
        setCities([]);
      }
      // Reset ville when region changes
      setInstitutionData(prev => ({ ...prev, idVille: undefined }));
    } else {
      setCities([]);
    }
  }, [institutionData.idRegion, regions]);

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // Save institution
      // Clean phone number (remove spaces) before sending
      const cleanPhone = institutionData.telephoneInstitution 
        ? institutionData.telephoneInstitution.replace(/\s/g, '') 
        : institutionData.telephoneInstitution;
      
      const instResult = await updateInstitution({
        nomInstitution: institutionData.nomInstitution,
        adresse: institutionData.adresse,
        telephoneInstitution: cleanPhone,
        siteWeb: institutionData.siteWeb,
        url: institutionData.url,
        idVille: institutionData.idVille || "",
      });

      // Save user profile
      // Clean phone number (remove spaces) before sending
      const cleanUserPhone = userData.telephone 
        ? userData.telephone.replace(/\s/g, '') 
        : userData.telephone;
      
      const userResult = await updateUserProfile({
        ...userData,
        telephone: cleanUserPhone,
      });

      // Save password if provided
      let passwordResult = { success: true };
      if (passwordData.currentPassword && passwordData.newPassword) {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          toast.error("Les mots de passe ne correspondent pas");
          setSaving(false);
          return;
        }
        passwordResult = await updatePassword(passwordData);
      }

      // Check each result and show specific error messages
      if (!instResult.success) {
        toast.error(instResult.error || "Erreur lors de la mise à jour de l'institution");
        setSaving(false);
        return;
      }
      
      if (!userResult.success) {
        toast.error(userResult.error || "Erreur lors de la mise à jour du profil utilisateur");
        setSaving(false);
        return;
      }
      
      if (!passwordResult.success) {
        toast.error(passwordResult.error || "Erreur lors de la mise à jour du mot de passe");
        setSaving(false);
        return;
      }

      // All succeeded
      toast.success("Paramètres mis à jour avec succès");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      // Reset password visibility
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      const inst = profile.institution;
      setInstitutionData({
        nomInstitution: inst.nomInstitution || "",
        adresse: inst.adresse || "",
        telephoneInstitution: inst.telephoneInstitution || "",
        siteWeb: inst.siteWeb || "",
        url: inst.url || "",
        idRegion: inst.ville?.region?.idRegion || undefined,
        idVille: inst.idVille || undefined,
      });

      setUserData({
        nomComplet: profile.user.nomComplet || "",
        telephone: profile.user.telephone || "",
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Reset password visibility
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
  };

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <div className="flex flex-1 flex-col p-6 md:p-8 space-y-6 bg-[#F3F4F4]">
          
          {/* Header */}
          <div className="bg-[#1D546D] rounded-xl p-6 shadow-lg">
            <h1 className="text-3xl font-bold text-white">Paramètres</h1>
            <p className="text-[#F3F4F4] text-opacity-90 mt-1">
              Gérez les informations de votre institution et votre compte
            </p>
          </div>

          {loading ? (
            <Card className="border-none shadow-lg bg-white">
              <CardContent className="py-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#1D546D] mb-4" />
                <p className="text-[#5F9598] text-lg">Chargement des paramètres...</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* 2-Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* LEFT COLUMN - Institution Info */}
                <Card className="border-none shadow-lg bg-white">
                  <CardContent className="p-6 space-y-6">
                    
                    {/* Institution Section */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 pb-4 border-b">
                        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#1D546D] to-[#5F9598] flex items-center justify-center">
                          <Building2 className="text-white" size={24} />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-[#061E29]">
                            Informations Institution
                          </h2>
                          <p className="text-sm text-[#5F9598]">
                            Détails publics de votre entreprise
                          </p>
                        </div>
                      </div>

                      {/* Nom Institution - NON EDITABLE */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-[#061E29]">
                          Nom de l&apos;institution
                          <span className="text-xs text-[#5F9598] ml-2">(Non modifiable)</span>
                        </Label>
                        <Input
                          value={institutionData.nomInstitution}
                          disabled
                          className="border-[#5F9598] disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </div>

                      {/* Email - NON EDITABLE */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-[#061E29]">
                          Email professionnel
                          <span className="text-xs text-[#5F9598] ml-2">(Non modifiable)</span>
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5F9598]" />
                          <Input
                            value={profile?.user?.email || ""}
                            disabled
                            className="pl-10 border-[#5F9598] disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>

                      {/* Téléphone */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-[#061E29]">
                          Téléphone
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5F9598]" />
                          <Input
                            placeholder="+212 5XX XXX XXX"
                            value={institutionData.telephoneInstitution}
                            onChange={(e) =>
                              setInstitutionData({
                                ...institutionData,
                                telephoneInstitution: e.target.value,
                              })
                            }
                            className="pl-10 border-[#5F9598] focus:border-[#1D546D]"
                          />
                        </div>
                      </div>

                      {/* Adresse */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-[#061E29]">
                          Adresse complète
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-[#5F9598]" />
                          <Input
                            placeholder="N° 2, Rue des écoles, Casablanca"
                            value={institutionData.adresse}
                            onChange={(e) =>
                              setInstitutionData({
                                ...institutionData,
                                adresse: e.target.value,
                              })
                            }
                            className="pl-10 border-[#5F9598] focus:border-[#1D546D]"
                          />
                        </div>
                      </div>

                      {/* Région & Ville on same line */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Région */}
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-[#061E29]">Région</Label>
                          <Select
                            value={institutionData.idRegion}
                            onValueChange={(value) => {
                              setInstitutionData({ ...institutionData, idRegion: value });
                            }}
                          >
                            <SelectTrigger className="border-[#5F9598]">
                              <SelectValue placeholder="Sélectionner une région" />
                            </SelectTrigger>
                            <SelectContent>
                              {regions.map(r => (
                                <SelectItem key={r.idRegion} value={r.idRegion}>
                                  {r.nomRegion}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Ville */}
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-[#061E29]">Ville</Label>
                          <Select
                            value={institutionData.idVille}
                            onValueChange={(value) => {
                              setInstitutionData({ ...institutionData, idVille: value });
                            }}
                            disabled={!institutionData.idRegion}
                          >
                            <SelectTrigger className="border-[#5F9598] disabled:opacity-50">
                              <SelectValue placeholder="Sélectionner une ville" />
                            </SelectTrigger>
                            <SelectContent>
                              {cities.map(c => (
                                <SelectItem key={c.idVille} value={c.idVille}>
                                  {c.nomVille}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Site Web */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-[#061E29]">
                          Site Web
                        </Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5F9598]" />
                          <Input
                            placeholder="https://www.exemple.ma"
                            value={institutionData.siteWeb}
                            onChange={(e) =>
                              setInstitutionData({
                                ...institutionData,
                                siteWeb: e.target.value,
                              })
                            }
                            className="pl-10 border-[#5F9598] focus:border-[#1D546D]"
                          />
                        </div>
                      </div>

                      {/* Localisation */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-[#061E29]">
                          Localisation
                        </Label>
                        <Input
                          placeholder="https://www.google.com/maps"
                          value={institutionData.url}
                          onChange={(e) =>
                            setInstitutionData({
                              ...institutionData,
                              url: e.target.value,
                            })
                          }
                          className="border-[#5F9598] focus:border-[#1D546D]"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* RIGHT COLUMN - Password + Action Buttons */}
                <Card className="border-none shadow-lg bg-white">
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b">
                      <div className="w-12 h-12 rounded-xl bg-linear-to-br from-red-500 to-orange-500 flex items-center justify-center">
                        <Lock className="text-white" size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-[#061E29]">
                          Changer le mot de passe
                        </h2>
                        <p className="text-sm text-[#5F9598]">
                          Sécurité de votre compte
                        </p>
                      </div>
                    </div>

                    {/* Current Password */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-[#061E29]">
                        Mot de passe actuel
                      </Label>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              currentPassword: e.target.value,
                            })
                          }
                          className="border-[#5F9598] focus:border-[#1D546D] pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5F9598] hover:text-[#1D546D] transition-colors"
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
                      <Label className="text-xs font-semibold text-[#061E29]">
                        Nouveau mot de passe
                      </Label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              newPassword: e.target.value,
                            })
                          }
                          className="border-[#5F9598] focus:border-[#1D546D] pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5F9598] hover:text-[#1D546D] transition-colors"
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
                      <Label className="text-xs font-semibold text-[#061E29]">
                        Confirmer le mot de passe
                      </Label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="border-[#5F9598] focus:border-[#1D546D] pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5F9598] hover:text-[#1D546D] transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeClosed className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="pt-4">
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <p className="text-xs text-orange-800">
                          <strong>Note:</strong> Laissez ces champs vides si vous ne souhaitez pas changer votre mot de passe.
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons - Inside Password Card */}
                    <div className="pt-6 border-t">
                      <div className="flex justify-end gap-3">
                        <Button
                          variant="outline"
                          onClick={handleCancel}
                          disabled={saving}
                          className="border-[#1D546D] text-[#1D546D] hover:bg-[#1D546D] hover:text-white"
                        >
                          Annuler
                        </Button>
                        <Button
                          onClick={handleSaveAll}
                          disabled={saving}
                          className="bg-[#1D546D] hover:bg-[#5F9598] text-white"
                        >
                          {saving ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Enregistrement...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Enregistrer les modifications
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SettingsPage;