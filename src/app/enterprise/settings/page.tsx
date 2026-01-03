"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  User,
  Settings2,
  Globe,
  Phone,
  Mail,
  MapPin,
  Lock,
  Bell,
  Save,
  Camera,
  Loader2,
} from "lucide-react";

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/enterprise-dashboard/components/app-sidebar";
import {
  getInstitutionProfile,
  updateInstitution,
  updateUserProfile,
  updatePassword,
  getRegionsWithCities,
} from "@/actions/enterprise/settings";
import { toast } from "sonner";

// --- Interfaces ---

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState<
    "institution" | "account" | "prefs"
  >("institution");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<{
    institution?: {
      nomInstitution?: string | null;
      adresse?: string | null;
      localisation?: string | null;
      url?: string | null;
      telephoneInstitution?: string | null;
      siteWeb?: string | null;
      idVille?: string | null;
      ville?: unknown;
    };
    user?: {
      nomComplet?: string | null;
      telephone?: string | null;
      email?: string | null;
    };
  } | null>(null);
  const [regions, setRegions] = useState<
    Array<{
      nomRegion: string;
      villes: Array<{ idVille: string; nomVille: string }>;
    }>
  >([]);
  const [institutionData, setInstitutionData] = useState({
    nomInstitution: "",
    adresse: "",
    localisation: "",
    url: "",
    telephoneInstitution: "",
    siteWeb: "",
    idVille: "",
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
          setInstitutionData({
            nomInstitution: profileResult.data.institution.nomInstitution || "",
            adresse: profileResult.data.institution.adresse || "",
            localisation: profileResult.data.institution.localisation || "",
            url: profileResult.data.institution.url || "",
            telephoneInstitution:
              profileResult.data.institution.telephoneInstitution || "",
            siteWeb: profileResult.data.institution.siteWeb || "",
            idVille: profileResult.data.institution.idVille || "",
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

  const handleSaveInstitution = async () => {
    setSaving(true);
    try {
      const result = await updateInstitution(institutionData);
      if (result.success) {
        toast.success("Paramètres de l'institution mis à jour");
      } else {
        toast.error(result.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveUser = async () => {
    setSaving(true);
    try {
      const result = await updateUserProfile(userData);
      if (result.success) {
        toast.success("Profil utilisateur mis à jour");
      } else {
        toast.error(result.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setSaving(true);
    try {
      const result = await updatePassword(passwordData);
      if (result.success) {
        toast.success("Mot de passe mis à jour");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(result.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-white">
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h1 className="text-xl font-bold text-[#061E29]">Paramètres</h1>
          </div>
        </header>

        <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
          {/* --- Navigation Interne --- */}
          <aside className="w-full md:w-64 border-r p-4 bg-[#F3F4F4]/20">
            <nav className="space-y-1">
              <NavButton
                active={activeSection === "institution"}
                onClick={() => setActiveSection("institution")}
                icon={<Building2 size={18} />}
                label="Institution"
              />
              <NavButton
                active={activeSection === "account"}
                onClick={() => setActiveSection("account")}
                icon={<User size={18} />}
                label="Compte Utilisateur"
              />
              <NavButton
                active={activeSection === "prefs"}
                onClick={() => setActiveSection("prefs")}
                icon={<Settings2 size={18} />}
                label="Préférences"
              />
            </nav>
          </aside>

          {/* --- Contenu Principal --- */}
          <main className="flex-1 overflow-y-auto p-8 bg-white">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#1D546D] mb-4" />
                <p className="text-[#5F9598] text-lg ml-4">
                  Chargement des paramètres...
                </p>
              </div>
            ) : (
              <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                {/* SECTION : PROFIL INSTITUTION */}
                {activeSection === "institution" && (
                  <section className="space-y-6">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-2xl bg-[#F3F4F4] flex items-center justify-center border-2 border-dashed border-[#5F9598]">
                          <Building2 size={32} className="text-[#5F9598]" />
                        </div>
                        <button className="absolute -bottom-2 -right-2 p-2 bg-[#061E29] text-white rounded-lg hover:bg-[#5F9598] transition-colors shadow-lg">
                          <Camera size={14} />
                        </button>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-[#061E29]">
                          Profil de l&apos;institution
                        </h2>
                        <p className="text-sm text-gray-500">
                          Gérez les informations publiques de votre entreprise
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField
                        label="Nom de l'institution"
                        placeholder="Ex: OCP Group"
                        value={institutionData.nomInstitution}
                        onChange={(e) =>
                          setInstitutionData({
                            ...institutionData,
                            nomInstitution: e.target.value,
                          })
                        }
                      />
                      <InputField
                        label="Téléphone"
                        placeholder="+212 5XX XXX XXX"
                        icon={<Phone size={14} />}
                        value={institutionData.telephoneInstitution}
                        onChange={(e) =>
                          setInstitutionData({
                            ...institutionData,
                            telephoneInstitution: e.target.value,
                          })
                        }
                      />
                      <div className="md:col-span-2">
                        <InputField
                          label="Adresse complète"
                          placeholder="N° 2, Rue des écoles, Casablanca"
                          icon={<MapPin size={14} />}
                          value={institutionData.adresse}
                          onChange={(e) =>
                            setInstitutionData({
                              ...institutionData,
                              adresse: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1 block mb-1.5">
                          Ville / Région
                        </label>
                        <select
                          className="w-full border rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#5F9598] outline-none"
                          value={institutionData.idVille}
                          onChange={(e) =>
                            setInstitutionData({
                              ...institutionData,
                              idVille: e.target.value,
                            })
                          }
                        >
                          <option value="">Sélectionner une ville</option>
                          {regions.map((region) =>
                            region.villes.map(
                              (ville: {
                                idVille: string;
                                nomVille: string;
                              }) => (
                                <option
                                  key={ville.idVille}
                                  value={ville.idVille}
                                >
                                  {ville.nomVille} - {region.nomRegion}
                                </option>
                              )
                            )
                          )}
                        </select>
                      </div>
                      <InputField
                        label="Coordonnées GPS"
                        placeholder="33.5731, -7.5898"
                        value={institutionData.localisation}
                        onChange={(e) =>
                          setInstitutionData({
                            ...institutionData,
                            localisation: e.target.value,
                          })
                        }
                      />
                      <InputField
                        label="Site Web"
                        placeholder="https://www.exemple.ma"
                        icon={<Globe size={14} />}
                        value={institutionData.siteWeb}
                        onChange={(e) =>
                          setInstitutionData({
                            ...institutionData,
                            siteWeb: e.target.value,
                          })
                        }
                      />
                      <InputField
                        label="URL personnalisée"
                        placeholder="marcrute.ma/ocp"
                        value={institutionData.url}
                        onChange={(e) =>
                          setInstitutionData({
                            ...institutionData,
                            url: e.target.value,
                          })
                        }
                      />
                    </div>
                  </section>
                )}

                {/* SECTION : COMPTE UTILISATEUR */}
                {activeSection === "account" && (
                  <section className="space-y-6">
                    <h2 className="text-xl font-bold text-[#061E29] mb-6">
                      Compte Utilisateur
                    </h2>
                    <div className="grid grid-cols-1 gap-6">
                      <InputField
                        label="Nom complet du responsable"
                        placeholder="Ahmed Benjelloun"
                        value={userData.nomComplet}
                        onChange={(e) =>
                          setUserData({
                            ...userData,
                            nomComplet: e.target.value,
                          })
                        }
                      />
                      <InputField
                        label="Email professionnel"
                        placeholder={
                          profile?.user?.email || "a.benjelloun@institution.ma"
                        }
                        icon={<Mail size={14} />}
                        disabled
                      />
                      <InputField
                        label="Téléphone direct"
                        placeholder="+212 6XX XXX XXX"
                        value={userData.telephone}
                        onChange={(e) =>
                          setUserData({
                            ...userData,
                            telephone: e.target.value,
                          })
                        }
                      />

                      <div className="pt-6 border-t">
                        <h3 className="text-sm font-bold text-[#061E29] mb-4 flex items-center gap-2">
                          <Lock size={16} /> Changer le mot de passe
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InputField
                            label="Mot de passe actuel"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                currentPassword: e.target.value,
                              })
                            }
                          />
                          <div></div>
                          <InputField
                            label="Nouveau mot de passe"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                newPassword: e.target.value,
                              })
                            }
                          />
                          <InputField
                            label="Confirmer le mot de passe"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                confirmPassword: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* SECTION : PRÉFÉRENCES */}
                {activeSection === "prefs" && (
                  <section className="space-y-8">
                    <h2 className="text-xl font-bold text-[#061E29]">
                      Préférences de la plateforme
                    </h2>

                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Bell size={16} /> Notifications
                      </h3>
                      <div className="space-y-3">
                        <ToggleItem label="Recevoir les nouveaux rapports par email" />
                        <ToggleItem label="Alertes de fin de mission" />
                        <ToggleItem label="Newsletter mensuelle MARcrute" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase block mb-2">
                          Langue de l&apos;interface
                        </label>
                        <select className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#5F9598] outline-none">
                          <option>Français (FR)</option>
                          <option>Arabe (AR)</option>
                          <option>Anglais (EN)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase block mb-2">
                          Fuseau horaire
                        </label>
                        <select className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#5F9598] outline-none">
                          <option>(GMT+01:00) Casablanca</option>
                          <option>(GMT+00:00) London</option>
                        </select>
                      </div>
                    </div>
                  </section>
                )}

                {/* BARRE D'ACTION FIXE EN BAS DU CONTENU */}
                <div className="mt-12 pt-6 border-t flex justify-end gap-3">
                  <button
                    className="px-6 py-2 border rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
                    onClick={() => {
                      if (activeSection === "institution") {
                        setInstitutionData({
                          nomInstitution:
                            profile?.institution?.nomInstitution || "",
                          adresse: profile?.institution?.adresse || "",
                          localisation:
                            profile?.institution?.localisation || "",
                          url: profile?.institution?.url || "",
                          telephoneInstitution:
                            profile?.institution?.telephoneInstitution || "",
                          siteWeb: profile?.institution?.siteWeb || "",
                          idVille: profile?.institution?.idVille || "",
                        });
                      } else if (activeSection === "account") {
                        setUserData({
                          nomComplet: profile?.user?.nomComplet || "",
                          telephone: profile?.user?.telephone || "",
                        });
                        setPasswordData({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                      }
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    className="px-6 py-2 bg-[#061E29] text-white rounded-xl text-sm font-bold hover:bg-[#1D546D] transition-all flex items-center gap-2 shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => {
                      if (activeSection === "institution") {
                        handleSaveInstitution();
                      } else if (activeSection === "account") {
                        if (
                          passwordData.currentPassword ||
                          passwordData.newPassword
                        ) {
                          handleSavePassword();
                        }
                        handleSaveUser();
                      }
                    }}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />{" "}
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save size={16} /> Enregistrer les modifications
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

// --- Sous-composants réutilisables ---

const NavButton = ({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
      active
        ? "bg-white text-[#5F9598] shadow-sm"
        : "text-gray-500 hover:text-[#061E29] hover:bg-white/50"
    }`}
  >
    {icon} {label}
  </button>
);

const InputField = ({
  label,
  placeholder,
  type = "text",
  icon,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5F9598]">
          {icon}
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full border rounded-xl py-2.5 px-4 ${
          icon ? "pl-10" : ""
        } text-sm focus:ring-2 focus:ring-[#5F9598] outline-none transition-all hover:border-[#5F9598]/50 disabled:bg-gray-100 disabled:cursor-not-allowed`}
      />
    </div>
  </div>
);

const ToggleItem = ({ label }: { label: string }) => (
  <label className="flex items-center justify-between p-1 cursor-pointer group">
    <span className="text-sm text-gray-600 group-hover:text-[#061E29] transition-colors">
      {label}
    </span>
    <div className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" />
      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#5F9598]"></div>
    </div>
  </label>
);

export default SettingsPage;
