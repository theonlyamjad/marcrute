"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Star,
  Building2,
  Award,
  MessageSquare,
  ThumbsUp,
  Zap,
  Trophy,
  Target,
  Calendar,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EvaluationsPageClientProps {
  initialEvaluations: any[];
  initialStats: any;
}

export function EvaluationsPageClient({
  initialEvaluations,
  initialStats,
}: EvaluationsPageClientProps) {
  const [evaluations] = useState(initialEvaluations);
  const [filter, setFilter] = useState<number | "all">("all");

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Stats from backend
  const total = initialStats?.total || 0;
  const average = initialStats?.averageRating || 0;
  const counts = initialStats?.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const recommendRate = total > 0 ? Math.round(((counts[5] + counts[4]) / total) * 100) : 0;

  const filtered =
    filter === "all" ? evaluations : evaluations.filter((e) => e.note === filter);

  const renderStars = (note: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i <= note
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
    );
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2);

  return (
    <div className="min-h-screen bg-[#F3F4F4]">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#061E29] mb-2">
            Mes Évaluations
          </h1>
          <p className="text-gray-600">
            Consultez les avis des institutions sur vos prestations
          </p>
        </div>

        {/* No Evaluations Alert */}
        {total === 0 && (
          <Alert className="mb-6 bg-blue-50 border-2 border-blue-200">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-blue-800 font-semibold">
              Vous n'avez pas encore d'évaluations. Complétez des missions pour
              recevoir des avis.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="flex flex-row flex-nowrap gap-4 justify-between items-stretch mb-6 w-full">
          {/* Average Rating */}
          <Card className="flex-1 border-0 shadow-xl bg-linear-to-br from-[#1D546D] via-[#5F9598] to-[#1D546D] text-white min-w-37.5">
            <CardContent className="pt-6 px-2">
              <div className="text-center">
                <div className="inline-block mb-2">
                  <p className="text-5xl font-black">{average.toFixed(1)}</p>
                  <div className="flex justify-center mt-1">
                    {renderStars(Math.round(average))}
                  </div>
                </div>
                <p className="text-xs sm:text-sm font-medium opacity-90">
                  Note Moyenne
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Total */}
          <Card className="flex-1 border-[#1D546D]/20 bg-[#1D546D]/10 min-w-37.5">
            <CardContent className="pt-6 px-2">
              <div className="text-center">
                <Star className="h-8 w-8 mx-auto text-[#1D546D] mb-2" />
                <p className="text-2xl font-bold text-[#061E29]">{total}</p>
                <p className="text-xs sm:text-sm text-[#1D546D] font-medium">
                  Évaluations
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 5 Stars */}
          <Card className="flex-1 border-yellow-200 bg-yellow-50 min-w-37.5">
            <CardContent className="pt-6 px-2">
              <div className="text-center">
                <Trophy className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
                <p className="text-2xl font-bold text-yellow-800">{counts[5]}</p>
                <p className="text-xs sm:text-sm text-yellow-700 font-medium">
                  5 Étoiles
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recommendation */}
          <Card className="flex-1 border-green-200 bg-green-50 min-w-37.5">
            <CardContent className="pt-6 px-2">
              <div className="text-center">
                <ThumbsUp className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <p className="text-2xl font-bold text-green-800">
                  {recommendRate}%
                </p>
                <p className="text-xs sm:text-sm text-green-700 font-medium">
                  Recommandent
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Distribution & Badges Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Distribution */}
          <Card className="border-[#1D546D]/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-[#061E29] flex items-center gap-2">
                <Star className="h-5 w-5 text-[#5F9598]" />
                Répartition des Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = counts[rating as keyof typeof counts] || 0;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  const isActive = filter === rating;

                  return (
                    <button
                      key={rating}
                      onClick={() => setFilter(isActive ? "all" : rating)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all ${
                        isActive
                          ? "bg-[#5F9598]/10 ring-2 ring-[#5F9598]"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 w-20">
                        <span className="font-bold text-[#061E29]">{rating}</span>
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </div>
                      <div className="flex-1 relative h-7 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-linear-to-r from-yellow-400 via-orange-400 to-orange-500 transition-all duration-500 flex items-center justify-end pr-2"
                          style={{ width: `${pct}%` }}
                        >
                          {pct > 10 && (
                            <span className="text-xs font-bold text-white">
                              {pct}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-12 text-right">
                        <span className="text-base font-bold text-[#061E29]">
                          {count}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card className="border-[#1D546D]/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-[#061E29] flex items-center gap-2">
                <Award className="h-5 w-5 text-[#5F9598]" />
                Badges de Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {average >= 4.5 && (
                <div className="flex items-center gap-3 p-3 bg-linear-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg">
                  <Award className="h-8 w-8 text-yellow-600 shrink-0" />
                  <div>
                    <h3 className="font-bold text-yellow-800 text-sm">
                      Excellence
                    </h3>
                    <p className="text-xs text-gray-600">
                      Performance exceptionnelle
                    </p>
                  </div>
                </div>
              )}
              {counts[5] >= 3 && (
                <div className="flex items-center gap-3 p-3 bg-linear-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                  <Zap className="h-8 w-8 text-purple-600 shrink-0" />
                  <div>
                    <h3 className="font-bold text-purple-800 text-sm">
                      Expert Certifié
                    </h3>
                    <p className="text-xs text-gray-600">
                      {counts[5]} évaluations parfaites
                    </p>
                  </div>
                </div>
              )}
              {recommendRate >= 80 && (
                <div className="flex items-center gap-3 p-3 bg-linear-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                  <Target className="h-8 w-8 text-green-600 shrink-0" />
                  <div>
                    <h3 className="font-bold text-green-800 text-sm">
                      Recommandé
                    </h3>
                    <p className="text-xs text-gray-600">
                      {recommendRate}% recommandent
                    </p>
                  </div>
                </div>
              )}
              {total === 0 && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <AlertCircle className="h-8 w-8 text-gray-400 shrink-0" />
                  <div>
                    <h3 className="font-bold text-gray-600 text-sm">
                      Aucun badge
                    </h3>
                    <p className="text-xs text-gray-500">
                      Complétez des missions pour débloquer
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filter Indicator */}
        {filter !== "all" && (
          <div className="mb-6">
            <Card className="border-[#1D546D]/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-[#061E29]">
                      Affichage : {filter} étoiles ({filtered.length})
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilter("all")}
                    className="border-[#5F9598] text-[#5F9598] hover:bg-[#5F9598] hover:text-white"
                  >
                    Tout afficher
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Evaluations List */}
        <div className="space-y-4">
          {filtered.length === 0 && total > 0 ? (
            <Card className="border-[#1D546D]/20">
              <CardContent className="py-12 text-center">
                <Star className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">
                  Aucune évaluation avec {filter} étoiles
                </p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((evaluation) => (
              <Card
                key={evaluation.idEvaluation}
                className="border-[#1D546D]/20 hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className="absolute -inset-1 bg-linear-to-r from-[#5F9598] to-[#1D546D] rounded-full blur opacity-50"></div>
                        <Avatar className="relative h-12 w-12 border-2 border-white">
                          <AvatarFallback className="bg-linear-to-br from-[#5F9598] to-[#1D546D] text-white font-bold text-sm">
                            {getInitials(
                              evaluation.institution.nomInstitution
                            )}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="flex-1">
                        <CardTitle className="text-xl text-[#061E29] mb-1">
                          {evaluation.institution.nomInstitution}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {evaluation.institution.ville.nomVille}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(evaluation.dateCreation)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="text-right shrink-0">
                      {renderStars(evaluation.note)}
                      <div className="mt-1 inline-flex items-center gap-1 bg-linear-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {evaluation.note}.0
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {evaluation.commentaire && (
                  <CardContent>
                    {/* Comment */}
                    <div className="p-4 bg-[#F3F4F4] rounded-lg">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        "{evaluation.commentaire}"
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}