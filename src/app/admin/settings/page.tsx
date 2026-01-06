"use client";

import React, { useState, useEffect } from 'react';
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Shield, Bell, Lock, Database, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Table {
  value: string;
  label: string;
  model: string;
}

export default function AdminSettings() {
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv');
  const [loading, setLoading] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);

  useEffect(() => {
    if (exportDialogOpen) {
      loadTables();
    }
  }, [exportDialogOpen]);

  const loadTables = async () => {
    setLoadingTables(true);
    try {
      const response = await fetch('/api/admin/export');
      if (response.ok) {
        const data = await response.json();
        setTables(data.tables || []);
      } else {
        toast.error('Erreur lors du chargement des tables');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des tables');
    } finally {
      setLoadingTables(false);
    }
  };

  const handleExport = async () => {
    if (!selectedTable) {
      toast.error('Veuillez sélectionner une table');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table: selectedTable,
          format: exportFormat,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de l\'export');
      }

      // Télécharger le fichier
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const tableLabel = tables.find(t => t.value === selectedTable)?.label || selectedTable;
      const extension = exportFormat === 'csv' ? 'csv' : 'xlsx';
      const filename = `${tableLabel}_${new Date().toISOString().split('T')[0]}.${extension}`;
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Export réussi: ${filename}`);
      setExportDialogOpen(false);
      setSelectedTable('');
    } catch (error: any) {
      console.error('Erreur lors de l\'export:', error);
      toast.error(error.message || 'Erreur lors de l\'export');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarInset>
      <div className="flex flex-1 flex-col p-6 md:p-8 space-y-6 bg-[#F3F4F4]">
        <div className="bg-[#1D546D] rounded-xl p-6 shadow-lg">
          <h1 className="text-3xl font-bold text-white mb-2">Paramètres</h1>
          <p className="text-[#F3F4F4] text-opacity-90">Gérer les paramètres de l&apos;administration</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-none shadow-lg bg-white">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-orange-500 bg-opacity-10 flex items-center justify-center">
                  <Database className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle>Base de données</CardTitle>
                  <CardDescription>Gérer la base de données</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" className="w-full">
                  Sauvegarder la base de données
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setExportDialogOpen(true)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exporter les données
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-white">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-purple-500 bg-opacity-10 flex items-center justify-center">
                  <Lock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Permissions</CardTitle>
                  <CardDescription>Gérer les permissions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = '/admin/roles'}
                >
                  Gérer les rôles
                </Button>
                <Button variant="outline" className="w-full">
                  Historique des actions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogue d'export */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Exporter la base de données</DialogTitle>
            <DialogDescription>
              Sélectionnez une table et un format pour exporter les données
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="table-select">Table</Label>
              <Select
                value={selectedTable}
                onValueChange={setSelectedTable}
                disabled={loadingTables}
              >
                <SelectTrigger id="table-select" className="w-full">
                  <SelectValue placeholder={loadingTables ? "Chargement..." : "Sélectionnez une table"} />
                </SelectTrigger>
                <SelectContent>
                  {tables.map((table) => (
                    <SelectItem key={table.value} value={table.value}>
                      {table.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="format-select">Format d&apos;export</Label>
              <Select
                value={exportFormat}
                onValueChange={(value: 'csv' | 'excel') => setExportFormat(value)}
              >
                <SelectTrigger id="format-select" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel (XLSX)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setExportDialogOpen(false);
                setSelectedTable('');
              }}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleExport}
              disabled={!selectedTable || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Export en cours...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarInset>
  );
}

