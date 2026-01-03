"use client";

import React, { useState, useEffect } from 'react';
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
  Send,
  Loader2
} from 'lucide-react';

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/enterprise-dashboard/components/app-sidebar';
import { getIssuedSignalements, getReceivedSignalements, createSignalement, getWorkersForSignalement } from '@/actions/enterprise/reports';
import { toast } from 'sonner';

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
  const [issuedReports, setIssuedReports] = useState<Report[]>([]);
  const [receivedReports, setReceivedReports] = useState<Report[]>([]);
  const [workers, setWorkers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    idTravailleurConcerne: "",
    motif: "",
    description: "",
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [issuedResult, receivedResult, workersResult] = await Promise.all([
          getIssuedSignalements(),
          getReceivedSignalements(),
          getWorkersForSignalement(),
        ]);

        if (issuedResult.success && issuedResult.data) {
          setIssuedReports(issuedResult.data.map(r => ({
            id: r.id,
            workerName: r.workerName,
            motive: r.motive,
            description: r.description,
            status: r.status,
            dateCreated: r.dateCreated,
            dateProcessed: r.dateProcessed,
            adminResponse: r.adminResponse,
          })));
        }

        if (receivedResult.success && receivedResult.data) {
          setReceivedReports(receivedResult.data.map(r => ({
            id: r.id,
            workerName: r.workerName,
            emitterName: r.emitterName,
            motive: r.motive,
            description: r.description,
            status: r.status,
            dateCreated: r.dateCreated,
            dateProcessed: r.dateProcessed,
            adminResponse: r.adminResponse,
          })));
        }

        if (workersResult.success && workersResult.data) {
          setWorkers(workersResult.data);
        }
      } catch (error) {
        toast.error("Erreur lors du chargement des signalements");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSubmitReport = async () => {
    if (!formData.motif || !formData.description) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const result = await createSignalement({
      idTravailleurConcerne: formData.idTravailleurConcerne || null,
      motif: formData.motif,
      description: formData.description,
    });

    if (result.success) {
      toast.success("Signalement créé avec succès");
      setFormData({
        idTravailleurConcerne: "",
        motif: "",
        description: "",
      });
      // Recharger les données
      const issuedResult = await getIssuedSignalements();
      if (issuedResult.success && issuedResult.data) {
        setIssuedReports(issuedResult.data.map(r => ({
          id: r.id,
          workerName: r.workerName,
          motive: r.motive,
          description: r.description,
          status: r.status,
          dateCreated: r.dateCreated,
          dateProcessed: r.dateProcessed,
          adminResponse: r.adminResponse,
        })));
      }
      setActiveTab('issued');
    } else {
      toast.error(result.error || "Erreur lors de la création du signalement");
    }
  };

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
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#1D546D] mb-4" />
                <p className="text-[#5F9598] text-lg ml-4">Chargement des signalements...</p>
              </div>
            ) : (
              <>
                {activeTab === 'issued' && <ReportsList reports={issuedReports} type="issued" />}
                {activeTab === 'received' && <ReportsList reports={receivedReports} type="received" />}
                {activeTab === 'create' && <CreateReportForm workers={workers} formData={formData} setFormData={setFormData} onSubmit={handleSubmitReport} />}
              </>
            )}
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

const CreateReportForm = ({ 
  workers, 
  formData, 
  setFormData, 
  onSubmit 
}: { 
  workers: { id: string; name: string }[];
  formData: { idTravailleurConcerne: string; motif: string; description: string };
  setFormData: (data: any) => void;
  onSubmit: () => void;
}) => (
  <div className="max-w-2xl bg-white border rounded-2xl p-8 shadow-sm">
    <h2 className="text-xl font-bold text-[#061E29] mb-6">Déposer un nouveau signalement</h2>
    <div className="space-y-6">
      <div>
        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Travailleur concerné</label>
        <select 
          className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#5F9598] outline-none"
          value={formData.idTravailleurConcerne}
          onChange={(e) => setFormData({ ...formData, idTravailleurConcerne: e.target.value })}
        >
          <option value="">Sélectionner un travailleur (optionnel)</option>
          {workers.map(w => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Motif du signalement</label>
        <select 
          className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#5F9598] outline-none"
          value={formData.motif}
          onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
        >
          <option value="">Sélectionner un motif</option>
          {MOTIVES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Description détaillée</label>
        <textarea 
          placeholder="Décrivez précisément les faits..."
          className="w-full border rounded-xl p-4 text-sm focus:ring-2 focus:ring-[#5F9598] outline-none h-40 bg-[#F3F4F4]/20"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        ></textarea>
        <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
          <Info size={12}/> Votre signalement sera examiné par nos administrateurs sous 24h.
        </p>
      </div>

      <button 
        onClick={onSubmit}
        className="w-full bg-[#061E29] text-white font-bold py-4 rounded-xl hover:bg-[#1D546D] transition-all flex items-center justify-center gap-2"
      >
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