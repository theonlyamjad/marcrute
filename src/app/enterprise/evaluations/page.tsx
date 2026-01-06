"use client";
import React, { useState, useEffect } from "react";
import {Star,ClipboardCheck,Filter,TrendingUp,Calendar,Send,Loader2,} from "lucide-react";
import {SidebarProvider,SidebarInset,SidebarTrigger,} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/enterprise-dashboard/components/app-sidebar";
import {getPendingEvaluations,createEvaluation,getEvaluationsHistory,getEvaluationStats,} from "@/actions/enterprise/evaluations";
import { toast } from "sonner";

// --- Interfaces ---
interface PendingMission {
  id: string;
  idTravailleur: string;
  workerName: string;
  workerPhoto: string;
  missionTitle: string;
  endDate: string;
}

interface Evaluation {
  id: string;
  workerName: string;
  workerPhoto: string;
  missionTitle: string;
  rating: number;
  comment: string;
  date: string;
}

const Evaluations = () => {
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [pending, setPending] = useState<PendingMission[]>([]);
  const [history, setHistory] = useState<Evaluation[]>([]);
  const [stats, setStats] = useState({
    averageRating: "0",
    totalEvaluations: 0,
    positivePercentage: "0%",
  });
  const [selectedMission, setSelectedMission] = useState<PendingMission | null>(
    null
  );
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [pendingResult, historyResult, statsResult] = await Promise.all([
          getPendingEvaluations(),
          getEvaluationsHistory(),
          getEvaluationStats(),
        ]);

        if (pendingResult.success && pendingResult.data) {
          setPending(
            pendingResult.data.map((p) => ({
              ...p,
              workerPhoto: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.workerName}`,
            }))
          );
        }

        if (historyResult.success && historyResult.data) {
          setHistory(
            historyResult.data.map((e) => ({
              ...e,
              workerPhoto: `https://api.dicebear.com/7.x/avataaars/svg?seed=${e.workerName}`,
            }))
          );
        }

        if (statsResult.success && statsResult.data) {
          setStats(statsResult.data);
        }
      } catch (error) {
        toast.error("Erreur lors du chargement des données");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSubmitEvaluation = async () => {
    if (!selectedMission || rating === 0) {
      toast.error("Veuillez sélectionner une mission et donner une note");
      return;
    }

    const result = await createEvaluation({
      idTravailleur: selectedMission.idTravailleur,
      note: rating,
      commentaire: comment || null,
    });

    if (result.success) {
      toast.success("Évaluation soumise avec succès");
      setRating(0);
      setComment("");
      setSelectedMission(null);
      // Recharger les données
      const [pendingResult, historyResult] = await Promise.all([
        getPendingEvaluations(),
        getEvaluationsHistory(),
      ]);
      if (pendingResult.success && pendingResult.data) {
        setPending(
          pendingResult.data.map((p) => ({
            ...p,
            workerPhoto: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.workerName}`,
          }))
        );
      }
      if (historyResult.success && historyResult.data) {
        setHistory(
          historyResult.data.map((e) => ({
            ...e,
            workerPhoto: `https://api.dicebear.com/7.x/avataaars/svg?seed=${e.workerName}`,
          }))
        );
      }
    } else {
      toast.error(result.error || "Erreur lors de la soumission");
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-white">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h1 className="text-xl font-bold text-[#061E29]">
              Gestion des Évaluations
            </h1>
          </div>
        </header>

        <main className="p-6 max-w-7xl mx-auto w-full space-y-8">
          {/* --- Statistiques --- */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              label="Note Moyenne Donnée"
              value={stats.averageRating}
              icon={<Star className="text-yellow-500 fill-yellow-500" />}
              sub={`Sur ${stats.totalEvaluations} évaluations`}
            />
            <StatCard
              label="Missions à Évaluer"
              value={pending.length.toString()}
              icon={<ClipboardCheck className="text-[#5F9598]" />}
              sub="Action requise"
            />
            <StatCard
              label="Répartition"
              value={stats.positivePercentage}
              icon={<TrendingUp className="text-[#1D546D]" />}
              sub="Avis positifs (4-5 ★)"
            />
          </section>

          {/* --- Tabs --- */}
          <div className="flex gap-8 border-b">
            <button
              onClick={() => setActiveTab("pending")}
              className={`pb-4 text-sm font-bold transition-all ${
                activeTab === "pending"
                  ? "border-b-2 border-[#5F9598] text-[#5F9598]"
                  : "text-gray-400"
              }`}
            >
              À SOUMETTRE ({pending.length})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`pb-4 text-sm font-bold transition-all ${
                activeTab === "history"
                  ? "border-b-2 border-[#5F9598] text-[#5F9598]"
                  : "text-gray-400"
              }`}
            >
              HISTORIQUE
            </button>
          </div>

          {/* --- Content: À Soumettre --- */}
          {activeTab === "pending" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
              <div className="space-y-4">
                <h3 className="text-[#061E29] font-bold flex items-center gap-2">
                  <ClipboardCheck size={18} /> Missions terminées
                </h3>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[#1D546D]" />
                  </div>
                ) : pending.length > 0 ? (
                  pending.map((mission) => (
                    <div
                      key={mission.id}
                      className={`p-4 border rounded-xl bg-[#F3F4F4]/20 flex justify-between items-center hover:border-[#5F9598] transition-all cursor-pointer ${
                        selectedMission?.id === mission.id
                          ? "border-[#5F9598] bg-[#5F9598]/10"
                          : ""
                      }`}
                      onClick={() => setSelectedMission(mission)}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={mission.workerPhoto}
                          className="w-10 h-10 rounded-full bg-gray-200"
                          alt=""
                        />
                        <div>
                          <p className="font-bold text-[#061E29] text-sm">
                            {mission.workerName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {mission.missionTitle}
                          </p>
                        </div>
                      </div>
                      <button className="text-xs font-bold text-[#5F9598] hover:underline">
                        Sélectionner
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-[#5F9598] py-8">
                    Aucune mission à évaluer
                  </p>
                )}
              </div>

              {/* Formulaire d'évaluation */}
              <div className="bg-white border rounded-2xl p-6 shadow-sm">
                <h3 className="text-[#061E29] font-bold mb-6">
                  Évaluer le travailleur
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                      Note globale
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={32}
                          className={`cursor-pointer transition-colors ${
                            (hoverRating || rating) >= star
                              ? "fill-yellow-500 text-yellow-500"
                              : "text-gray-200"
                          }`}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                      Commentaire
                    </label>
                    <textarea
                      placeholder="Partagez votre expérience sur la qualité du travail, la ponctualité..."
                      className="w-full border rounded-xl p-4 text-sm focus:ring-2 focus:ring-[#5F9598] outline-none h-32 bg-[#F3F4F4]/10"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                  </div>

                  <button
                    onClick={handleSubmitEvaluation}
                    disabled={!selectedMission || rating === 0}
                    className="w-full bg-[#5F9598] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#1D546D] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={18} /> Soumettre l&apos;évaluation
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- Content: Historique --- */}
          {activeTab === "history" && (
            <div className="space-y-6 animate-in fade-in duration-500">
              {/* Filtres Historique */}
              <div className="flex gap-4 items-center bg-[#F3F4F4]/30 p-4 rounded-xl">
                <Filter size={18} className="text-gray-400" />
                <select className="bg-transparent text-sm font-medium outline-none">
                  <option>Toutes les notes</option>
                  <option>5 étoiles</option>
                  <option>Moins de 3 étoiles</option>
                </select>
                <input
                  type="date"
                  className="bg-transparent text-sm font-medium outline-none border-l pl-4 ml-2"
                />
              </div>

              {/* Liste des évaluations */}
              <div className="grid grid-cols-1 gap-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[#1D546D]" />
                  </div>
                ) : history.length > 0 ? (
                  history.map((evalItem) => (
                    <div
                      key={evalItem.id}
                      className="p-6 border rounded-2xl flex flex-col md:flex-row gap-6 hover:shadow-sm transition-all"
                    >
                      <div className="md:w-1/4 flex items-start gap-4">
                        <img
                          src={evalItem.workerPhoto}
                          className="w-12 h-12 rounded-xl"
                          alt=""
                        />
                        <div>
                          <p className="font-bold text-[#061E29]">
                            {evalItem.workerName}
                          </p>
                          <p className="text-[10px] text-[#5F9598] font-bold uppercase tracking-tighter">
                            {evalItem.missionTitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex-1 space-y-2 border-l border-r px-6">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={
                                i < evalItem.rating
                                  ? "fill-yellow-500 text-yellow-500"
                                  : "text-gray-200"
                              }
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 italic">
                          &quot;{evalItem.comment}&quot;
                        </p>
                      </div>

                      <div className="md:w-1/5 flex flex-col items-end justify-center">
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar size={12} /> {evalItem.date}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-[#5F9598] py-8">
                    Aucune évaluation dans l&apos;historique
                  </p>
                )}
              </div>
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

// --- Sous-composants ---
interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  sub: string;
}

const StatCard = ({ label, value, icon, sub }: StatCardProps) => (
  <div className="p-6 border rounded-2xl bg-white flex flex-col gap-2">
    <div className="flex justify-between items-start">
      <span className="text-xs font-bold text-gray-400 uppercase">{label}</span>
      <div className="p-2 bg-[#F3F4F4] rounded-lg">{icon}</div>
    </div>
    <div className="text-3xl font-black text-[#061E29]">{value}</div>
    <span className="text-[11px] text-[#5F9598] font-medium">{sub}</span>
  </div>
);

export default Evaluations;
