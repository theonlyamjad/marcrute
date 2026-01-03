"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  Sun,
  Sunset,
  Moon,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  addWorkerAvailability,
  updateWorkerAvailability,
  deleteWorkerAvailability,
} from "@/actions/worker/disponibilites";

interface DisponibilitesPageClientProps {
  initialAvailabilities: any[];
}

const CRENEAUX = [
  { id: "Matin", label: "Matin", time: "8h-12h", icon: Sun },
  { id: "Après-midi", label: "Après-midi", time: "14h-18h", icon: Sunset },
  { id: "Soir", label: "Soir", time: "18h-22h", icon: Moon },
];

export function DisponibilitesPageClient({
  initialAvailabilities,
}: DisponibilitesPageClientProps) {
  const [availabilities, setAvailabilities] = useState(initialAvailabilities);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [showWeeks, setShowWeeks] = useState(2);

  // Generate next 30 days
  const generateNext30Days = () => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }

    return days;
  };

  const next30Days = generateNext30Days();

  const formatDate = (date: Date, format: "full" | "short" | "key") => {
    if (format === "key") {
      return date.toISOString().split("T")[0];
    }
    if (format === "short") {
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      });
    }
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const findAvailability = (date: Date, creneau: string) => {
    const dateKey = formatDate(date, "key");
    return availabilities.find(
      (a) =>
        formatDate(new Date(a.dateDisponible), "key") === dateKey &&
        a.creneau === creneau
    );
  };

  const isDisponible = (date: Date, creneau: string) => {
    const availability = findAvailability(date, creneau);
    return availability ? availability.estDisponible : false;
  };

  const handleToggle = async (date: Date, creneau: string) => {
    const existing = findAvailability(date, creneau);
    const newValue = !isDisponible(date, creneau);

    setIsSaving(true);

    if (existing) {
      // Update existing
      if (newValue === false) {
        // Delete if setting to false
        const result = await deleteWorkerAvailability({
          idDisponibilite: existing.idDisponibilite,
        });

        if (result.success) {
          setAvailabilities(
            availabilities.filter(
              (a) => a.idDisponibilite !== existing.idDisponibilite
            )
          );
          toast.success("Disponibilité supprimée");
        } else {
          toast.error(result.error || "Erreur lors de la suppression");
        }
      } else {
        // Update to true
        const result = await updateWorkerAvailability({
          idDisponibilite: existing.idDisponibilite,
          estDisponible: true,
        });

        if (result.success) {
          setAvailabilities(
            availabilities.map((a) =>
              a.idDisponibilite === existing.idDisponibilite
                ? { ...a, estDisponible: true }
                : a
            )
          );
          toast.success("Disponibilité mise à jour");
        } else {
          toast.error(result.error || "Erreur lors de la mise à jour");
        }
      }
    } else if (newValue) {
      // Create new
      const result = await addWorkerAvailability({
        dateDisponible: date,
        creneau: creneau as
          | "Matin"
          | "Après-midi"
          | "Soir"
          | "Journée complète",
        estDisponible: true,
      });

      if (result.success) {
        setAvailabilities([...availabilities, result.data]);
        toast.success("Disponibilité ajoutée");
      } else {
        toast.error(result.error || "Erreur lors de l'ajout");
      }
    }

    setIsSaving(false);
    setLastSaved(
      formatDate(date, "short") +
        " - " +
        CRENEAUX.find((c) => c.id === creneau)?.label
    );
    setTimeout(() => setLastSaved(null), 2000);
  };

  const handleSetAllDay = async (date: Date, value: boolean) => {
    setIsSaving(true);

    for (const creneau of CRENEAUX) {
      const existing = findAvailability(date, creneau.id);

      if (value && !existing) {
        // Add if doesn't exist
        await addWorkerAvailability({
          dateDisponible: date,
          creneau: creneau.id as
            | "Matin"
            | "Après-midi"
            | "Soir"
            | "Journée complète",
          estDisponible: true,
        });
      } else if (!value && existing) {
        // Delete if exists
        await deleteWorkerAvailability({
          idDisponibilite: existing.idDisponibilite,
        });
      }
    }

    // Refresh data
    const result = await import("@/actions/worker/disponibilites").then((m) =>
      m.getUpcomingAvailabilities()
    );
    if (result.success && result.data) {
      setAvailabilities(result.data);
    }

    setIsSaving(false);
    toast.success(
      value ? "Toute la journée disponible" : "Toute la journée indisponible"
    );
    setLastSaved(
      formatDate(date, "short") +
        " - " +
        (value ? "Disponible" : "Indisponible")
    );
    setTimeout(() => setLastSaved(null), 2000);
  };

  // Calculate stats
  const totalSlots = availabilities.length;
  const activeSlots = availabilities.filter((a) => a.estDisponible).length;
  const inactiveSlots = availabilities.filter((a) => !a.estDisponible).length;

  const daysToShow = next30Days.slice(0, showWeeks * 7);

  return (
    <div className="min-h-screen bg-[#F3F4F4]">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#061E29] mb-2">
            Mes Disponibilités
          </h1>
          <p className="text-gray-600">
            Activez ou désactivez vos disponibilités en un clic
          </p>
        </div>

        {/* Save Indicator */}
        {lastSaved && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800">
              Sauvegardé: {lastSaved}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="flex flex-row flex-nowrap gap-4 justify-between items-stretch mb-6 w-full">
          {/* Total */}
          <Card className="flex-1 border-[#1D546D]/20 bg-[#1D546D]/10 min-w-37.5">
            <CardContent className="pt-6 px-2">
              <div className="text-center">
                <Calendar className="h-8 w-8 mx-auto text-[#1D546D] mb-2" />
                <p className="text-2xl font-bold text-[#061E29]">
                  {totalSlots}
                </p>
                <p className="text-xs sm:text-sm text-[#1D546D] font-medium">
                  Total
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Active */}
          <Card className="flex-1 border-green-200 bg-green-50 min-w-37.5">
            <CardContent className="pt-6 px-2">
              <div className="text-center">
                <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <p className="text-2xl font-bold text-green-800">
                  {activeSlots}
                </p>
                <p className="text-xs sm:text-sm text-green-700 font-medium">
                  Disponibles
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Inactive */}
          <Card className="flex-1 border-red-200 bg-red-50 min-w-37.5">
            <CardContent className="pt-6 px-2">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 mx-auto text-red-600 mb-2" />
                <p className="text-2xl font-bold text-red-800">
                  {inactiveSlots}
                </p>
                <p className="text-xs sm:text-sm text-red-700 font-medium">
                  Indisponibles
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Legend */}
        <Card className="mb-6 border-[#5F9598]/30 bg-[#5F9598]/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-yellow-500" />
                <span className="text-sm text-gray-700">Matin (8h-12h)</span>
              </div>
              <div className="flex items-center gap-2">
                <Sunset className="h-5 w-5 text-orange-500" />
                <span className="text-sm text-gray-700">
                  Après-midi (14h-18h)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Moon className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-gray-700">Soir (18h-22h)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disponibilités Grid */}
        <Card className="border-[#1D546D]/20">
          <CardHeader>
            <CardTitle className="text-2xl text-[#061E29]">
              Prochains Jours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {daysToShow.map((date) => {
              const dateStr = formatDate(date, "key");
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isToday = dateStr === formatDate(today, "key");

              return (
                <div
                  key={dateStr}
                  className={`border rounded-lg p-4 transition-all ${
                    isToday
                      ? "border-[#5F9598] bg-[#5F9598]/10"
                      : "border-[#1D546D]/20 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Calendar
                        className={`h-5 w-5 ${
                          isToday ? "text-[#5F9598]" : "text-[#1D546D]"
                        }`}
                      />
                      <div>
                        <p
                          className={`font-semibold ${
                            isToday ? "text-[#5F9598]" : "text-[#061E29]"
                          }`}
                        >
                          {formatDate(date, "full")}
                        </p>
                        {isToday && (
                          <Badge className="mt-1 bg-[#5F9598] text-white">
                            Aujourd'hui
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetAllDay(date, true)}
                        disabled={isSaving}
                        className="border-green-300 text-green-700 hover:bg-green-50 cursor-pointer text-xs"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Tout disponible
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetAllDay(date, false)}
                        disabled={isSaving}
                        className="border-red-300 text-red-700 hover:bg-red-50 cursor-pointer text-xs"
                      >
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Tout indisponible
                      </Button>
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {CRENEAUX.map((creneau) => {
                      const Icon = creneau.icon;
                      const isDispo = isDisponible(date, creneau.id);

                      return (
                        <div
                          key={creneau.id}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                            isDispo
                              ? "border-green-200 bg-green-50"
                              : "border-gray-200 bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon
                              className={`h-5 w-5 ${
                                isDispo ? "text-green-600" : "text-gray-400"
                              }`}
                            />
                            <div>
                              <p
                                className={`text-sm font-medium ${
                                  isDispo
                                    ? "text-green-900"
                                    : "text-gray-600"
                                }`}
                              >
                                {creneau.label}
                              </p>
                              <p className="text-xs text-gray-500">
                                {creneau.time}
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={isDispo}
                            onCheckedChange={() =>
                              handleToggle(date, creneau.id)
                            }
                            disabled={isSaving}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Load More Button */}
            {showWeeks * 7 < 30 && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowWeeks(showWeeks + 2)}
                  className="border-[#1D546D] text-[#1D546D] hover:bg-[#1D546D] hover:text-white"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Voir 2 semaines de plus
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}