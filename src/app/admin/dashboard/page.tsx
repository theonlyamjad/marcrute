"use client";

import React, { useState, useEffect } from 'react';
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Briefcase, FileCheck, Flag, Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import { 
  getAdminDashboardStats, 
  getUsersGrowthTrend, 
  getSignalementsStatus, 
  getRecentSignalements, 
  getRecentValidations 
} from '@/actions/admin/dashboard';
import { toast } from 'sonner';

// Types TypeScript
interface Stats {
  totalUsers: number;
  totalWorkers: number;
  totalInstitutions: number;
  totalMissions: number;
  totalCandidatures: number;
  monthlyUsers: number;
  pendingSignalements: number;
  pendingValidations: number;
  activeMissions: number;
}

interface UserTrend {
  mois: string;
  travailleurs: number;
  institutions: number;
}

interface SignalementStatus {
  name: string;
  value: number;
  color: string;
}

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ElementType;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon: Icon, bgColor }) => (
  <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden bg-white">
    <div className={`h-1.5 ${bgColor}`} />
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-semibold text-[#061E29]">{title}</CardTitle>
      <div className={`h-12 w-12 rounded-xl ${bgColor} bg-opacity-10 flex items-center justify-center`}>
        <Icon className={`h-6 w-6 ${bgColor.replace('bg-', 'text-')}`} />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-[#1D546D]">{value}</div>
      {subtitle && <p className="text-xs text-[#5F9598] mt-1 font-medium">{subtitle}</p>}
    </CardContent>
  </Card>
);

const getStatusBadge = (statut: string) => {
  const variants: Record<string, string> = {
    'En attente': 'bg-amber-100 text-amber-800 border-amber-200',
    'En cours': 'bg-blue-100 text-blue-800 border-blue-200',
    'Résolu': 'bg-[#5F9598] bg-opacity-20 text-[#1D546D] border-[#5F9598]',
    'Approuvée': 'bg-green-100 text-green-800 border-green-200',
    'Rejetée': 'bg-red-100 text-red-800 border-red-200',
  };
  return <Badge className={`${variants[statut] || 'bg-gray-100 text-gray-800'} border font-medium`}>{statut}</Badge>;
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [usersTrend, setUsersTrend] = useState<UserTrend[]>([]);
  const [signalementsStatus, setSignalementsStatus] = useState<SignalementStatus[]>([]);
  const [recentSignalements, setRecentSignalements] = useState<any[]>([]);
  const [recentValidations, setRecentValidations] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [
          statsResult,
          trendResult,
          statusResult,
          signalementsResult,
          validationsResult,
        ] = await Promise.all([
          getAdminDashboardStats(),
          getUsersGrowthTrend(),
          getSignalementsStatus(),
          getRecentSignalements(5),
          getRecentValidations(5),
        ]);

        if (statsResult.success && statsResult.data) {
          setStats(statsResult.data);
        }
        if (trendResult.success && trendResult.data) {
          setUsersTrend(trendResult.data);
        }
        if (statusResult.success && statusResult.data) {
          setSignalementsStatus(statusResult.data);
        }
        if (signalementsResult.success && signalementsResult.data) {
          setRecentSignalements(signalementsResult.data);
        }
        if (validationsResult.success && validationsResult.data) {
          setRecentValidations(validationsResult.data);
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
      <SidebarInset>
        <div className="flex flex-1 flex-col items-center justify-center p-6 md:p-8 bg-[#F3F4F4]">
          <Loader2 className="h-8 w-8 animate-spin text-[#1D546D] mb-4" />
          <p className="text-[#5F9598] text-lg">Chargement du tableau de bord...</p>
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset>
      <div className="flex flex-1 flex-col p-6 md:p-8 space-y-8 bg-[#F3F4F4]">
        
        {/* En-tête */}
        <div className="bg-[#1D546D] rounded-xl p-8 shadow-lg">
          <h1 className="text-4xl font-bold text-white mb-2">Tableau de bord Admin</h1>
          <p className="text-[#F3F4F4] text-opacity-90 text-lg">Vue d&apos;ensemble de la plateforme</p>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Utilisateurs totaux"
            value={stats.totalUsers}
            subtitle={`${stats.totalWorkers} travailleurs, ${stats.totalInstitutions} institutions`}
            icon={Users}
            bgColor="bg-[#1D546D] text-white"
          />
          <StatCard
            title="Missions actives"
            value={stats.activeMissions}
            subtitle={`${stats.totalMissions} au total`}
            icon={Briefcase}
            bgColor="bg-[#5F9598] text-white"
          />
          <StatCard
            title="Signalements en attente"
            value={stats.pendingSignalements}
            subtitle="Nécessitent une action"
            icon={Flag}
            bgColor="bg-orange-500 text-white"
          />
          <StatCard
            title="Validations en attente"
            value={stats.pendingValidations}
            subtitle="En attente de traitement"
            icon={FileCheck}
            bgColor="bg-[#1D546D] text-white"
          />
        </div>

        {/* Graphiques */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Croissance des utilisateurs */}
          <Card className="border-none shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="text-[#061E29] text-xl">Croissance des utilisateurs</CardTitle>
              <CardDescription className="text-[#5F9598]">Nouveaux utilisateurs (6 derniers mois)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={usersTrend}>
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
                  <Line type="monotone" dataKey="travailleurs" stroke="#1D546D" name="Travailleurs" strokeWidth={3} />
                  <Line type="monotone" dataKey="institutions" stroke="#5F9598" name="Institutions" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Répartition des signalements */}
          <Card className="border-none shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="text-[#061E29] text-xl">Répartition des signalements</CardTitle>
              <CardDescription className="text-[#5F9598]">Statut de tous les signalements</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={signalementsStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {signalementsStatus.map((entry, index) => (
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

        {/* Derniers signalements */}
        <Card className="border-none shadow-lg bg-white">
          <CardHeader className="border-b border-[#5F9598] border-opacity-20 pb-4">
            <CardTitle className="text-[#061E29] text-xl">Derniers signalements</CardTitle>
            <CardDescription className="text-[#5F9598]">Les 5 signalements les plus récents</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {recentSignalements.length > 0 ? (
                recentSignalements.map((signalement) => (
                  <div key={signalement.id} className="flex items-center justify-between p-5 border-2 border-[#5F9598] border-opacity-20 rounded-xl hover:bg-opacity-5 transition-all duration-300 hover:shadow-md">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-[#061E29] text-lg">{signalement.motif}</p>
                        {getStatusBadge(signalement.statut)}
                      </div>
                      <p className="text-sm text-[#1D546D] font-medium">
                        De: {signalement.emetteur} → Concerne: {signalement.concerne}
                      </p>
                    </div>
                    <div className="text-right text-sm text-[#5F9598] ml-4 font-medium">
                      {new Date(signalement.date).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-[#5F9598] py-8">Aucun signalement récent</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dernières validations */}
        <Card className="border-none shadow-lg bg-white">
          <CardHeader className="border-b border-[#5F9598] border-opacity-20 pb-4">
            <CardTitle className="text-[#061E29] text-xl">Dernières validations</CardTitle>
            <CardDescription className="text-[#5F9598]">Les 5 validations les plus récentes</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {recentValidations.length > 0 ? (
                recentValidations.map((validation) => (
                  <div key={validation.id} className="flex items-center justify-between p-5 border-2 border-[#1D546D] border-opacity-20 rounded-xl hover:shadow-md transition-all duration-300 bg-white">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-[#061E29] text-lg">{validation.type}</p>
                        {getStatusBadge(validation.statut)}
                      </div>
                      <p className="text-sm text-[#5F9598] font-medium">
                        Concerne: {validation.concerne} | Par: {validation.administrateur}
                      </p>
                    </div>
                    <div className="text-right text-sm text-[#1D546D] ml-4 font-medium">
                      {new Date(validation.date).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-[#5F9598] py-8">Aucune validation récente</p>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </SidebarInset>
  );
}

