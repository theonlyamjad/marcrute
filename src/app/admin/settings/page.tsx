"use client";

import React, { useState, useEffect } from 'react';
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Users, Building2, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface City {
  idVille: string;
  nomVille: string;
  idRegion: string;
}

interface Region {
  idRegion: string;
  nomRegion: string;
}

interface Specialty {
  id: number;
  name: string;
}

interface ExportFilters {
  cityId?: string;
  regionId?: string;
  specialtyId?: number;
  dateFrom?: string;
  yearsExperienceRange?: string;
}

export default function AdminDatabase() {
  const [cities, setCities] = useState<City[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Worker filters
  const [workerFilters, setWorkerFilters] = useState<ExportFilters>({});
  const [workerExportFormat, setWorkerExportFormat] = useState<'csv' | 'excel'>('csv');
  const [workerLoading, setWorkerLoading] = useState(false);

  // Enterprise filters
  const [enterpriseFilters, setEnterpriseFilters] = useState<ExportFilters>({});
  const [enterpriseExportFormat, setEnterpriseExportFormat] = useState<'csv' | 'excel'>('csv');
  const [enterpriseLoading, setEnterpriseLoading] = useState(false);

  useEffect(() => {
    loadFilterData();
  }, []);

  const loadFilterData = async () => {
    setLoadingData(true);
    try {
      const [citiesRes, regionsRes, specialtiesRes] = await Promise.all([
        fetch('/api/cities'),
        fetch('/api/regions'),
        fetch('/api/specialties'),
      ]);

      if (citiesRes.ok) {
        const citiesData = await citiesRes.json();
        setCities(citiesData);
      }

      if (regionsRes.ok) {
        const regionsData = await regionsRes.json();
        setRegions(regionsData);
      }

      if (specialtiesRes.ok) {
        const specialtiesData = await specialtiesRes.json();
        setSpecialties(specialtiesData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des filtres');
    } finally {
      setLoadingData(false);
    }
  };

  const handleExport = async (userType: 'worker' | 'enterprise') => {
    const isWorker = userType === 'worker';
    const filters = isWorker ? workerFilters : enterpriseFilters;
    const format = isWorker ? workerExportFormat : enterpriseExportFormat;
    const setLoading = isWorker ? setWorkerLoading : setEnterpriseLoading;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/export-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: {
            userType,
            ...filters,
          },
          format,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de l'export");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const userTypeLabel = isWorker ? 'Travailleurs' : 'Institutions';
      const extension = format === 'csv' ? 'csv' : 'xlsx';
      const filename = `${userTypeLabel}_${new Date().toISOString().split('T')[0]}.${extension}`;
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Export réussi: ${filename}`);
    } catch (error: unknown) {
      console.error("Erreur lors de l'export:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de l'export";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = (userType: 'worker' | 'enterprise') => {
    if (userType === 'worker') {
      setWorkerFilters({});
    } else {
      setEnterpriseFilters({});
    }
  };

  return (
    <SidebarInset>
      <div className="flex flex-1 flex-col p-6 md:p-8 space-y-6 bg-[#F3F4F4]">
        {/* Header */}
        <div className="bg-[#1D546D] rounded-xl p-6 shadow-lg">
          <h1 className="text-3xl font-bold text-white mb-2">Base de données</h1>
          <p className="text-[#F3F4F4] text-opacity-90">Exporter les données des utilisateurs</p>
        </div>

        {/* Two cards side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* WORKERS CARD */}
          <Card className="border-none shadow-lg bg-white">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-blue-500 bg-opacity-10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Travailleurs</CardTitle>
                  <CardDescription>Exporter les données des travailleurs</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="space-y-3">
                {/* Region & City inline */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Région</Label>
                    <Select
                      value={workerFilters.regionId || 'all'}
                      onValueChange={(value) => {
                        setWorkerFilters({ 
                          ...workerFilters, 
                          regionId: value === 'all' ? undefined : value,
                          cityId: undefined
                        });
                      }}
                      disabled={loadingData}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes</SelectItem>
                        {regions.map((region) => (
                          <SelectItem key={region.idRegion} value={region.idRegion}>
                            {region.nomRegion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Ville</Label>
                    <Select
                      value={workerFilters.cityId || 'all'}
                      onValueChange={(value) => setWorkerFilters({ ...workerFilters, cityId: value === 'all' ? undefined : value })}
                      disabled={loadingData}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes</SelectItem>
                        {cities
                          .filter(city => !workerFilters.regionId || city.idRegion === workerFilters.regionId)
                          .map((city) => (
                            <SelectItem key={city.idVille} value={city.idVille}>
                              {city.nomVille}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Specialty & Date inline - wider gap */}
                <div className="grid grid-cols-[1.2fr,0.8fr] gap-4">
                  <div className="space-y-2">
                    <Label>Spécialité</Label>
                    <Select
                      value={workerFilters.specialtyId?.toString() || 'all'}
                      onValueChange={(value) => setWorkerFilters({ ...workerFilters, specialtyId: value === 'all' ? undefined : parseInt(value) })}
                      disabled={loadingData}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes</SelectItem>
                        {specialties.map((specialty) => (
                          <SelectItem key={specialty.id} value={specialty.id.toString()}>
                            {specialty.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date début</Label>
                    <Input
                      type="date"
                      value={workerFilters.dateFrom || ''}
                      onChange={(e) => setWorkerFilters({ ...workerFilters, dateFrom: e.target.value || undefined })}
                    />
                  </div>
                </div>

                {/* Years of Experience & Export Format inline */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Années d&apos;exp</Label>
                    <Select
                      value={workerFilters.yearsExperienceRange || 'all'}
                      onValueChange={(value) => setWorkerFilters({ ...workerFilters, yearsExperienceRange: value === 'all' ? undefined : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes</SelectItem>
                        <SelectItem value="0-1">0-1 ans</SelectItem>
                        <SelectItem value="1-5">1-5 ans</SelectItem>
                        <SelectItem value="5-10">5-10 ans</SelectItem>
                        <SelectItem value="10+">10+ ans</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Format d&apos;export</Label>
                    <Select
                      value={workerExportFormat}
                      onValueChange={(value: 'csv' | 'excel') => setWorkerExportFormat(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="excel">Excel (XLSX)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => resetFilters('worker')}
                  className="flex-1 cursor-pointer" 
                >
                  Réinitialiser
                </Button>
                <Button
                  onClick={() => handleExport('worker')}
                  disabled={workerLoading}
                  className="flex-1 bg-[#1D546D] hover:bg-[#1D546D]/90 cursor-pointer"
                >
                  {workerLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Export...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Exporter
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ENTERPRISES CARD */}
          <Card className="border-none shadow-lg bg-white">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-orange-500 bg-opacity-10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle>Institutions</CardTitle>
                  <CardDescription>Exporter les données des institutions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="space-y-3">
                {/* Region & City inline */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Région</Label>
                    <Select
                      value={enterpriseFilters.regionId || 'all'}
                      onValueChange={(value) => {
                        setEnterpriseFilters({ 
                          ...enterpriseFilters, 
                          regionId: value === 'all' ? undefined : value,
                          cityId: undefined
                        });
                      }}
                      disabled={loadingData}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes</SelectItem>
                        {regions.map((region) => (
                          <SelectItem key={region.idRegion} value={region.idRegion}>
                            {region.nomRegion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Ville</Label>
                    <Select
                      value={enterpriseFilters.cityId || 'all'}
                      onValueChange={(value) => setEnterpriseFilters({ ...enterpriseFilters, cityId: value === 'all' ? undefined : value })}
                      disabled={loadingData}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes</SelectItem>
                        {cities
                          .filter(city => !enterpriseFilters.regionId || city.idRegion === enterpriseFilters.regionId)
                          .map((city) => (
                            <SelectItem key={city.idVille} value={city.idVille}>
                              {city.nomVille}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Specialty & Date inline - wider gap */}
                <div className="grid grid-cols-[1.2fr,0.8fr] gap-4">
                  <div className="space-y-2">
                    <Label>Spécialité</Label>
                    <Select
                      value={enterpriseFilters.specialtyId?.toString() || 'all'}
                      onValueChange={(value) => setEnterpriseFilters({ ...enterpriseFilters, specialtyId: value === 'all' ? undefined : parseInt(value) })}
                      disabled={loadingData}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes</SelectItem>
                        {specialties.map((specialty) => (
                          <SelectItem key={specialty.id} value={specialty.id.toString()}>
                            {specialty.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date début</Label>
                    <Input
                      type="date"
                      value={enterpriseFilters.dateFrom || ''}
                      onChange={(e) => setEnterpriseFilters({ ...enterpriseFilters, dateFrom: e.target.value || undefined })}
                    />
                  </div>
                </div>

                {/* Export Format (no years of experience for enterprises) */}
                <div className="space-y-2">
                  <Label>Format d&apos;export</Label>
                  <Select
                    value={enterpriseExportFormat}
                    onValueChange={(value: 'csv' | 'excel') => setEnterpriseExportFormat(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="excel">Excel (XLSX)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => resetFilters('enterprise')}
                  className="flex-1 cursor-pointer"
                >
                  Réinitialiser
                </Button>
                <Button
                  onClick={() => handleExport('enterprise')}
                  disabled={enterpriseLoading}
                  className="flex-1 bg-[#1D546D] hover:bg-[#1D546D]/90 cursor-pointer"
                >
                  {enterpriseLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Export...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Exporter
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </SidebarInset>
  );
}