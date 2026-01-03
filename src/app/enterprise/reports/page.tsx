"use client";

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  PlusCircle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  User,
  Info,
  Send
} from 'lucide-react';

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/enterprise-dashboard/components/app-sidebar';

// --- Interfaces ---
export type ReportStatus = "en attente" | "traité" | "rejeté";

export interface Report {
  id: string;
  workerName: string;
  motive: string;
  description: string;
  status: ReportStatus;
  dateCreated: string;
  dateProcessed?: string;
  adminResponse?: string;
  emitterName?: string; // Pour les rapports reçus
}

// --- Mock Data ---
const ISSUED_REPORTS: Report[] = [
  {
    id: "REP-001",
    workerName: "Karim Idrissi",
    motive: "Absence injustifiée",
    description: "Le travailleur ne s'est pas présenté au poste le 12/01 sans prévenir.",
    status: "traité",
    dateCreated: "12/01/2026",
    dateProcessed: "14/01/2026",
    adminResponse: "Le travailleur a reçu un avertissement formel. Ses disponibilités ont été suspendues."
  },
  {
    id: "REP-002",
    workerName: "Siham Touzani",
    motive: "Comportement inapproprié",
    description: "Non-respect des consignes de sécurité sur le chantier.",
    status: "en attente",
    dateCreated: "15/01/2026"
  }
];

const RECEIVED_REPORTS: Report[] = [
  {
    id: "REP-RX-01",
    workerName: "Vous (Entreprise)",
    emitterName: "Youssef Amrani (Travailleur)",
    motive: "Retard de paiement",
    description: "La mission du 05/01 n'a toujours pas été réglée.",
    status: "traité",
    dateCreated: "10/01/2026",
    dateProcessed: "11/01/2026",
    adminResponse: "Paiement confirmé par l'entreprise, dossier clos."
  }
];

const MOTIVES = [
  "Absence injustifiée",
  "Retard répété",
  "Manquement aux consignes de sécurité",
  "Qualité de travail insuffisante",
  "Comportement inapproprié",
  "Autre"
];

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState<'issued' | 'received' | 'create'>('issued');

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-white">
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h1 className="text-xl font-bold text-[#061E29]">Centre de Signalements</h1>
          </div>
        </header>

        <main className="p-6 max-w-6xl mx-auto w-full">
          {/* Navigation Onglets */}
          <div className="flex gap-4 mb-8 bg-[#F3F4F4] p-1 rounded-xl w-fit">
            <TabButton 
              active={activeTab === 'issued'} 
              onClick={() => setActiveTab('issued')}
              icon={<Send size={16} />}
              label="Signalements émis"
            />
            <TabButton 
              active={activeTab === 'received'} 
              onClick={() => setActiveTab('received')}
              icon={<ShieldAlert size={16} />}
              label="Signalements reçus"
            />
            <TabButton 
              active={activeTab === 'create'} 
              onClick={() => setActiveTab('create')}
              icon={<PlusCircle size={16} />}
              label="Nouveau signalement"
            />
          </div>

          <div className="animate-in fade-in duration-500">
            {activeTab === 'issued' && <ReportsList reports={ISSUED_REPORTS} type="issued" />}
            {activeTab === 'received' && <ReportsList reports={RECEIVED_REPORTS} type="received" />}
            {activeTab === 'create' && <CreateReportForm />}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

// --- Sous-composants ---

const ReportsList = ({ reports, type }: { reports: Report[], type: 'issued' | 'received' }) => (
  <div className="space-y-4">
    {reports.length === 0 ? (
      <div className="text-center py-20 text-gray-400">Aucun signalement trouvé.</div>
    ) : (
      reports.map((report) => (
        <div key={report.id} className="border rounded-2xl p-6 hover:shadow-sm transition-all bg-white">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#F3F4F4] rounded-xl text-[#1D546D]">
                <AlertTriangle size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#5F9598] uppercase tracking-wider">{report.id}</span>
                  <StatusBadge status={report.status} />
                </div>
                <h3 className="font-bold text-[#061E29] text-lg">{report.motive}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <User size={14} /> {type === 'issued' ? `Contre : ${report.workerName}` : `Émis par : ${report.emitterName}`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 flex items-center justify-end gap-1">
                <Clock size={12} /> Créé le {report.dateCreated}
              </p>
              {report.dateProcessed && (
                <p className="text-xs text-[#5F9598] font-medium mt-1">Traité le {report.dateProcessed}</p>
              )}
            </div>
          </div>

          <div className="bg-[#F3F4F4]/50 p-4 rounded-xl mb-4">
            <p className="text-sm text-[#061E29] leading-relaxed">
              <span className="font-bold block mb-1 text-[10px] uppercase text-gray-400">Description du litige :</span>
              {report.description}
            </p>
          </div>

          {report.adminResponse && (
            <div className="border-l-4 border-[#5F9598] bg-[#5F9598]/5 p-4 rounded-r-xl">
              <p className="text-sm text-[#1D546D]">
                <span className="font-bold flex items-center gap-2 mb-1">
                  <MessageSquare size={14} /> Réponse de l&apos;administrateur :
                </span>
                {report.adminResponse}
              </p>
            </div>
          )}
        </div>
      ))
    )}
  </div>
);

const CreateReportForm = () => (
  <div className="max-w-2xl bg-white border rounded-2xl p-8 shadow-sm">
    <h2 className="text-xl font-bold text-[#061E29] mb-6">Déposer un nouveau signalement</h2>
    <div className="space-y-6">
      <div>
        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Travailleur concerné</label>
        <select className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#5F9598] outline-none">
          <option>Sélectionner un travailleur</option>
          <option>Karim Idrissi</option>
          <option>Sarah Bensaid</option>
        </select>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Motif du signalement</label>
        <select className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#5F9598] outline-none">
          {MOTIVES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Description détaillée</label>
        <textarea 
          placeholder="Décrivez précisément les faits..."
          className="w-full border rounded-xl p-4 text-sm focus:ring-2 focus:ring-[#5F9598] outline-none h-40 bg-[#F3F4F4]/20"
        ></textarea>
        <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
          <Info size={12}/> Votre signalement sera examiné par nos administrateurs sous 24h.
        </p>
      </div>

      <button className="w-full bg-[#061E29] text-white font-bold py-4 rounded-xl hover:bg-[#1D546D] transition-all flex items-center justify-center gap-2">
        <Send size={18} /> Envoyer le signalement
      </button>
    </div>
  </div>
);

// --- Petits composants UI ---

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
      active ? 'bg-white text-[#061E29] shadow-sm' : 'text-gray-500 hover:text-[#061E29]'
    }`}
  >
    {icon} {label}
  </button>
);

const StatusBadge = ({ status }: { status: ReportStatus }) => {
  const styles = {
    "en attente": "bg-orange-100 text-orange-600",
    "traité": "bg-green-100 text-green-600",
    "rejeté": "bg-red-100 text-red-600"
  };
  const icons = {
    "en attente": <Clock size={12} />,
    "traité": <CheckCircle size={12} />,
    "rejeté": <XCircle size={12} />
  };

  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase ${styles[status]}`}>
      {icons[status]} {status}
    </span>
  );
};

export default ReportsPage;