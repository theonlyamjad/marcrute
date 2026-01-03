"use client";

import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  Settings2, 
  ShieldCheck, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  Lock, 
  Bell, 
  Smartphone,
  History,
  Save,
  Camera
} from 'lucide-react';

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/enterprise-dashboard/components/app-sidebar';

// --- Interfaces ---
interface Session {
  id: string;
  device: string;
  location: string;
  date: string;
  isCurrent: boolean;
}

const MOCK_SESSIONS: Session[] = [
  { id: "1", device: "Chrome / MacOS", location: "Casablanca, Maroc", date: "Actif maintenant", isCurrent: true },
  { id: "2", device: "Safari / iPhone 15", location: "Rabat, Maroc", date: "Il y a 2 heures", isCurrent: false },
];

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState<'institution' | 'account' | 'prefs' | 'security'>('institution');

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
                active={activeSection === 'institution'} 
                onClick={() => setActiveSection('institution')}
                icon={<Building2 size={18} />}
                label="Institution"
              />
              <NavButton 
                active={activeSection === 'account'} 
                onClick={() => setActiveSection('account')}
                icon={<User size={18} />}
                label="Compte Utilisateur"
              />
              <NavButton 
                active={activeSection === 'prefs'} 
                onClick={() => setActiveSection('prefs')}
                icon={<Settings2 size={18} />}
                label="Préférences"
              />
              <NavButton 
                active={activeSection === 'security'} 
                onClick={() => setActiveSection('security')}
                icon={<ShieldCheck size={18} />}
                label="Sécurité"
              />
            </nav>
          </aside>

          {/* --- Contenu Principal --- */}
          <main className="flex-1 overflow-y-auto p-8 bg-white">
            <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-500">
              
              {/* SECTION : PROFIL INSTITUTION */}
              {activeSection === 'institution' && (
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
                      <h2 className="text-xl font-bold text-[#061E29]">Profil de l&apos;institution</h2>
                      <p className="text-sm text-gray-500">Gérez les informations publiques de votre entreprise</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Nom de l'institution" placeholder="Ex: OCP Group" />
                    <InputField label="Téléphone" placeholder="+212 5XX XXX XXX" icon={<Phone size={14}/>} />
                    <div className="md:col-span-2">
                      <InputField label="Adresse complète" placeholder="N° 2, Rue des écoles, Casablanca" icon={<MapPin size={14}/>} />
                    </div>
                    <InputField label="Ville / Région" placeholder="Grand Casablanca" />
                    <InputField label="Coordonnées GPS" placeholder="33.5731, -7.5898" />
                    <InputField label="Site Web" placeholder="https://www.exemple.ma" icon={<Globe size={14}/>} />
                    <InputField label="URL personnalisée" placeholder="marcrute.ma/ocp" />
                  </div>
                </section>
              )}

              {/* SECTION : COMPTE UTILISATEUR */}
              {activeSection === 'account' && (
                <section className="space-y-6">
                  <h2 className="text-xl font-bold text-[#061E29] mb-6">Compte Utilisateur</h2>
                  <div className="grid grid-cols-1 gap-6">
                    <InputField label="Nom complet du responsable" placeholder="Ahmed Benjelloun" />
                    <InputField label="Email professionnel" placeholder="a.benjelloun@institution.ma" icon={<Mail size={14}/>} />
                    <InputField label="Téléphone direct" placeholder="+212 6XX XXX XXX" />
                    
                    <div className="pt-6 border-t">
                      <h3 className="text-sm font-bold text-[#061E29] mb-4 flex items-center gap-2">
                        <Lock size={16}/> Changer le mot de passe
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Nouveau mot de passe" type="password" />
                        <InputField label="Confirmer le mot de passe" type="password" />
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* SECTION : PRÉFÉRENCES */}
              {activeSection === 'prefs' && (
                <section className="space-y-8">
                  <h2 className="text-xl font-bold text-[#061E29]">Préférences de la plateforme</h2>
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <Bell size={16}/> Notifications
                    </h3>
                    <div className="space-y-3">
                      <ToggleItem label="Recevoir les nouveaux rapports par email" />
                      <ToggleItem label="Alertes de fin de mission" />
                      <ToggleItem label="Newsletter mensuelle MARcrute" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Langue de l&apos;interface</label>
                      <select className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#5F9598] outline-none">
                        <option>Français (FR)</option>
                        <option>Arabe (AR)</option>
                        <option>Anglais (EN)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Fuseau horaire</label>
                      <select className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#5F9598] outline-none">
                        <option>(GMT+01:00) Casablanca</option>
                        <option>(GMT+00:00) London</option>
                      </select>
                    </div>
                  </div>
                </section>
              )}

              {/* SECTION : SÉCURITÉ */}
              {activeSection === 'security' && (
                <section className="space-y-8">
                  <h2 className="text-xl font-bold text-[#061E29]">Sécurité & Accès</h2>
                  
                  {/* 2FA */}
                  <div className="p-4 border border-[#5F9598]/30 rounded-2xl bg-[#5F9598]/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl text-[#5F9598] shadow-sm">
                        <Smartphone size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-[#061E29]">Authentification à deux facteurs (2FA)</p>
                        <p className="text-xs text-gray-500">Ajoutez une couche de sécurité supplémentaire à votre compte.</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-[#5F9598] text-white text-xs font-bold rounded-lg">Activer</button>
                  </div>

                  {/* Sessions Actives */}
                  <div>
                    <h3 className="text-sm font-bold text-[#061E29] mb-4 flex items-center gap-2">
                      <History size={16}/> Sessions actives
                    </h3>
                    <div className="space-y-3">
                      {MOCK_SESSIONS.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-4 border rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${session.isCurrent ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <div>
                              <p className="text-sm font-bold text-[#061E29]">{session.device}</p>
                              <p className="text-[10px] text-gray-400 uppercase">{session.location} • {session.date}</p>
                            </div>
                          </div>
                          {!session.isCurrent && (
                            <button className="text-[10px] font-bold text-red-500 hover:underline">Déconnecter</button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* BARRE D'ACTION FIXE EN BAS DU CONTENU */}
              <div className="mt-12 pt-6 border-t flex justify-end gap-3">
                <button className="px-6 py-2 border rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all">Annuler</button>
                <button className="px-6 py-2 bg-[#061E29] text-white rounded-xl text-sm font-bold hover:bg-[#1D546D] transition-all flex items-center gap-2 shadow-lg shadow-black/10">
                  <Save size={16} /> Enregistrer les modifications
                </button>
              </div>

            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

// --- Sous-composants réutilisables ---

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
      active 
      ? 'bg-white text-[#5F9598] shadow-sm' 
      : 'text-gray-500 hover:text-[#061E29] hover:bg-white/50'
    }`}
  >
    {icon} {label}
  </button>
);

const InputField = ({ label, placeholder, type = "text", icon }: { label: string, placeholder?: string, type?: string, icon?: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5F9598]">{icon}</div>}
      <input 
        type={type} 
        placeholder={placeholder}
        className={`w-full border rounded-xl py-2.5 px-4 ${icon ? 'pl-10' : ''} text-sm focus:ring-2 focus:ring-[#5F9598] outline-none transition-all hover:border-[#5F9598]/50`}
      />
    </div>
  </div>
);

const ToggleItem = ({ label }: { label: string }) => (
  <label className="flex items-center justify-between p-1 cursor-pointer group">
    <span className="text-sm text-gray-600 group-hover:text-[#061E29] transition-colors">{label}</span>
    <div className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" />
      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#5F9598]"></div>
    </div>
  </label>
);

export default SettingsPage;