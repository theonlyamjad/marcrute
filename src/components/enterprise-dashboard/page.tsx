"use client";

import React, { JSX, useState, useEffect } from 'react';
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Briefcase, Clock, Star, TrendingUp, AlertCircle, Calendar, Loader2 } from 'lucide-react';
import { 
  getDashboardStats, 
  getMissionsTrend, 
  getCandidaturesStatus, 
  getRecentCandidatures, 
  getActiveMissions, 
  getRecentSignalements 
} from '@/actions/enterprise/dashboard';
import { toast } from 'sonner';

// Types TypeScript
interface Stats {
  totalMissions: number;
  activeMissions: number;
  pendingMissions: number;
  completedMissions: number;
  pendingCandidatures: number;
  averageRating: number;
  monthlyMissions: number;
}

interface MissionTrend {
  mois: string;
  missions: number;
  acceptees: number;
}

interface CandidatureStatus {
  name: string;
  value: number;
  color: string;
}

interface Candidature {
  id: string;
  travailleur: string;
  mission: string;
  date: string;
  statut: string;
  specialites: string[];
}

interface Mission {
  id: string;
  titre: string;
  dateDebut: string;
  dateFin: string;
  candidatures: number;
  urgence: string;
  progression: number;
}

interface Signalement {
  id: string;
  motif: string;
  concerne: string;
  date: string;
  statut: string;
}


interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: string;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon: Icon, trend, bgColor }) => (
  <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden bg-white">
    <div className={`h-1.5 ${bgColor}`} />
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-semibold text-[#061E29]">{title}</CardTitle>
      <div className={`h-12 w-12 rounded-xl ${bgColor} bg-opacity-10 flex items-center justify-center`}>
        <Icon  className={`h-6 w-6 text-white ${bgColor.replace('bg-', 'text-')}`}  />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-[#1D546D]">{value}</div>
      {subtitle && <p className="text-xs text-[#5F9598] mt-1 font-medium">{subtitle}</p>}
      {trend && (
        <div className="flex items-center text-xs text-[#5F9598] font-medium mt-2">
          <TrendingUp color='#fff' className="h-3 w-3 mr-1" />
          {trend}
        </div>
      )}
    </CardContent>
  </Card>
);

const getStatusBadge = (statut: string): JSX.Element => {
  const variants: Record<string, string> = {
    'En attente': 'bg-amber-100 text-amber-800 border-amber-200',
    'Acceptée': 'bg-[#5F9598] bg-opacity-20 text-[#1D546D] border-[#5F9598]',
    'Refusée': 'bg-red-100 text-red-800 border-red-200',
    'En cours': 'bg-blue-100 text-blue-800 border-blue-200',
    'Résolu': 'bg-[#5F9598] bg-opacity-20 text-[#1D546D] border-[#5F9598]'
  };
  return <Badge className={`${variants[statut] || 'bg-gray-100 text-gray-800'} border font-medium`}>{statut}</Badge>;
};

const getUrgenceBadge = (urgence: string): JSX.Element => {
  const variants: Record<string, string> = {
    'Urgente': 'bg-red-100 text-red-800 border-red-200',
    'Haute': 'bg-orange-100 text-orange-800 border-orange-200',
    'Normale': 'bg-[#1D546D] bg-opacity-10 text-[#1D546D] border-[#1D546D]'
  };
  return <Badge className={`${variants[urgence] || 'bg-gray-100 text-gray-800'} border font-medium`}>{urgence}</Badge>;
};

export default function InstitutionDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [missionsTrend, setMissionsTrend] = useState<MissionTrend[]>([]);
  const [candidaturesStatus, setCandidaturesStatus] = useState<CandidatureStatus[]>([]);
  const [recentCandidatures, setRecentCandidatures] = useState<Candidature[]>([]);
  const [activeMissions, setActiveMissions] = useState<Mission[]>([]);
  const [signalements, setSignalements] = useState<Signalement[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [
          statsResult,
          trendResult,
          statusResult,
          candidaturesResult,
          missionsResult,
          signalementsResult,
        ] = await Promise.all([
          getDashboardStats(),
          getMissionsTrend(),
          getCandidaturesStatus(),
          getRecentCandidatures(5),
          getActiveMissions(5),
          getRecentSignalements(5),
        ]);

        if (statsResult.success && statsResult.data) {
          setStats(statsResult.data);
        }
        if (trendResult.success && trendResult.data) {
          setMissionsTrend(trendResult.data);
        }
        if (statusResult.success && statusResult.data) {
          setCandidaturesStatus(statusResult.data);
        }
        if (candidaturesResult.success && candidaturesResult.data) {
          setRecentCandidatures(candidaturesResult.data);
        }
        if (missionsResult.success && missionsResult.data) {
          setActiveMissions(missionsResult.data);
        }
        if (signalementsResult.success && signalementsResult.data) {
          setSignalements(signalementsResult.data);
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

  if (loading || !stats) {
    return (
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties}>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <div className="flex flex-1 flex-col items-center justify-center p-6 md:p-8 bg-[#F3F4F4]">
            <Loader2 className="h-8 w-8 animate-spin text-[#1D546D] mb-4" />
            <p className="text-[#5F9598] text-lg">Chargement du tableau de bord...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <div className="flex flex-1 flex-col p-6 md:p-8 space-y-8 bg-[#F3F4F4]">
          
          {/* En-tête */}
          <div className="bg-[#1D546D] rounded-xl p-8 shadow-lg">
            <h1 className="text-4xl font-bold text-white mb-2">Tableau de bord</h1>
            <p className="text-[#F3F4F4] text-opacity-90 text-lg">Vue d&apos;ensemble de vos missions et candidatures</p>
          </div>

          {/* Cartes de statistiques */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Missions actives"
              value={stats.activeMissions}
              subtitle={`${stats.totalMissions} au total`}
              icon={Briefcase}
              bgColor="bg-[#1D546D]"
            />
            <StatCard
              title="Candidatures en attente"
              value={stats.pendingCandidatures}
              subtitle="Nécessitent une réponse"
              icon={Clock}
              bgColor="bg-[#5F9598]"
            />
            <StatCard
              title="Missions ce mois"
              value={stats.monthlyMissions}
              subtitle={`${stats.completedMissions} terminées`}
              icon={Calendar}
              bgColor="bg-[#1D546D]"
            />
            <StatCard
              title="Note moyenne"
              value={stats.averageRating.toFixed(1)}
              subtitle="Sur 5 étoiles"
              icon={Star}
              bgColor="bg-[#5F9598]"
            />
          </div>

          {/* Graphiques */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Tendances des missions */}
            <Card className="border-none shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-[#061E29] text-xl">Tendances des missions</CardTitle>
                <CardDescription className="text-[#5F9598]">Missions créées vs acceptées (6 derniers mois)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={missionsTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="mois" stroke="#5F9598" />
                    <YAxis stroke="#5F9598" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#FFFFFF', 
                        border: '1px solid #5F9598',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="missions" stroke="#1D546D" name="Créées" strokeWidth={3} />
                    <Line type="monotone" dataKey="acceptees" stroke="#5F9598" name="Acceptées" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Répartition des candidatures */}
            <Card className="border-none shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-[#061E29] text-xl">Répartition des candidatures</CardTitle>
                <CardDescription className="text-[#5F9598]">Statut de toutes les candidatures reçues</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={candidaturesStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {candidaturesStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#FFFFFF', 
                        border: '1px solid #5F9598',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Dernières candidatures */}
          <Card className="border-none shadow-lg bg-white">
            <CardHeader className="border-b border-[#5F9598] border-opacity-20 pb-4">
              <CardTitle className="text-[#061E29] text-xl">Dernières candidatures</CardTitle>
              <CardDescription className="text-[#5F9598]">Les 5 candidatures les plus récentes</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {recentCandidatures.length > 0 ? (
                  recentCandidatures.map((candidature) => (
                  <div key={candidature.id} className="flex items-center justify-between p-5 border-2 border-[#5F9598] border-opacity-20 rounded-xl  hover:bg-opacity-5 transition-all duration-300 hover:shadow-md">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-[#061E29] text-lg">{candidature.travailleur}</p>
                        {getStatusBadge(candidature.statut)}
                      </div>
                      <p className="text-sm text-[#1D546D] font-medium">{candidature.mission}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {candidature.specialites.map((spec, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs bg-[#F3F4F4] text-[#1D546D] border-[#5F9598]">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right text-sm text-[#5F9598] ml-4 font-medium">
                      {new Date(candidature.date).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  ))
                ) : (
                  <p className="text-center text-[#5F9598] py-8">Aucune candidature récente</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Missions actives */}
          <Card className="border-none shadow-lg bg-white">
            <CardHeader className="border-b border-[#5F9598] border-opacity-20 pb-4">
              <CardTitle className="text-[#061E29] text-xl">Missions actives</CardTitle>
              <CardDescription className="text-[#5F9598]">Missions en cours avec leur progression</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {activeMissions.length > 0 ? (
                  activeMissions.map((mission) => (
                  <div key={mission.id} className="p-5 border-2 border-[#1D546D] border-opacity-20 rounded-xl space-y-4 hover:shadow-md transition-all duration-300 bg-white">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-semibold text-[#061E29] text-lg">{mission.titre}</h3>
                          {getUrgenceBadge(mission.urgence)}
                        </div>
                        <p className="text-sm text-[#5F9598] font-medium">
                          Du {new Date(mission.dateDebut).toLocaleDateString('fr-FR')} au {new Date(mission.dateFin).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-[#1D546D] text-white border-[#1D546D]">
                        {mission.candidatures} candidatures
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#5F9598] font-medium">Progression</span>
                        <span className="font-bold text-[#1D546D]">{mission.progression}%</span>
                      </div>
                      <div className="w-full bg-[#E5E7EB] rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-[#5F9598] h-3 rounded-full transition-all duration-500"
                          style={{ width: `${mission.progression}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  ))
                ) : (
                  <p className="text-center text-[#5F9598] py-8">Aucune mission active</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Signalements */}
          <Card className="border-none shadow-lg border-l-4 border-l-orange-500 bg-white">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-[#061E29] text-xl">Signalements</CardTitle>
                  <CardDescription className="text-[#5F9598]">Alertes et signalements en cours</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {signalements.length > 0 ? (
                  signalements.map((signalement) => (
                  <div key={signalement.id} className="flex items-center justify-between p-4 border-2 border-orange-200 rounded-xl bg-orange-50 bg-opacity-30 hover:shadow-md transition-all duration-300">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-[#061E29]">{signalement.motif}</p>
                        {getStatusBadge(signalement.statut)}
                      </div>
                      <p className="text-sm text-[#5F9598]">Concerne : <span className="font-medium">{signalement.concerne}</span></p>
                    </div>
                    <div className="text-sm text-[#1D546D] font-medium">
                      {new Date(signalement.date).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  ))
                ) : (
                  <p className="text-center text-[#5F9598] py-8">Aucun signalement</p>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}