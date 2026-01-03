"use client"
import React, { JSX, useState } from 'react';
import { AppSidebar } from '@/components/enterprise-dashboard/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, Edit, Trash2, Eye, Filter, Search, Calendar, Users } from 'lucide-react';

// Types TypeScript
interface SpecialiteRequise {
  specialiteRequise: string;
  anneesExperienceMin: number;
}

interface Mission {
  id: string;
  titre: string;
  description: string;
  typePublic: string;
  dateDebut: string;
  dateFin: string;
  urgence: 'Normale' | 'Haute' | 'Urgente';
  statut: 'Brouillon' | 'Active' | 'Terminée' | 'Annulée';
  specialitesRequises: SpecialiteRequise[];
  nombreCandidatures: number;
  dateCreation: string;
}

// Données mockées
const mockMissions: Mission[] = [
  {
    id: '1',
    titre: 'Psychologue pour centre d\'accueil',
    description: 'Nous recherchons un psychologue clinicien pour accompagner des enfants en difficulté dans notre centre d\'accueil. Missions incluant évaluations psychologiques et thérapies individuelles.',
    typePublic: 'Enfants',
    dateDebut: '2025-02-15',
    dateFin: '2025-08-15',
    urgence: 'Haute',
    statut: 'Active',
    specialitesRequises: [
      { specialiteRequise: 'Psychologie clinique', anneesExperienceMin: 3 },
      { specialiteRequise: 'Thérapie cognitive', anneesExperienceMin: 2 }
    ],
    nombreCandidatures: 8,
    dateCreation: '2025-01-10'
  },
  {
    id: '2',
    titre: 'Éducateur spécialisé - Urgence',
    description: 'Besoin urgent d\'un éducateur spécialisé pour accompagner des adolescents en situation de décrochage scolaire.',
    typePublic: 'Adolescents',
    dateDebut: '2025-01-20',
    dateFin: '2025-06-20',
    urgence: 'Urgente',
    statut: 'Active',
    specialitesRequises: [
      { specialiteRequise: 'Éducation spécialisée', anneesExperienceMin: 5 }
    ],
    nombreCandidatures: 12,
    dateCreation: '2025-01-05'
  },
  {
    id: '3',
    titre: 'Assistant social polyvalent',
    description: 'Mission d\'accompagnement social pour familles en difficulté, incluant orientation et suivi administratif.',
    typePublic: 'Familles',
    dateDebut: '2025-03-01',
    dateFin: '2025-09-01',
    urgence: 'Normale',
    statut: 'Active',
    specialitesRequises: [
      { specialiteRequise: 'Travail social', anneesExperienceMin: 2 }
    ],
    nombreCandidatures: 5,
    dateCreation: '2025-01-15'
  },
  {
    id: '4',
    titre: 'Orthophoniste pédiatrique',
    description: 'Recherche orthophoniste spécialisé en troubles du langage chez l\'enfant.',
    typePublic: 'Enfants',
    dateDebut: '2025-02-01',
    dateFin: '2025-07-01',
    urgence: 'Normale',
    statut: 'Brouillon',
    specialitesRequises: [
      { specialiteRequise: 'Orthophonie', anneesExperienceMin: 3 }
    ],
    nombreCandidatures: 0,
    dateCreation: '2025-01-20'
  },
  {
    id: '5',
    titre: 'Psychomotricien pour personnes âgées',
    description: 'Accompagnement psychomoteur de personnes âgées en établissement.',
    typePublic: 'Personnes âgées',
    dateDebut: '2024-10-01',
    dateFin: '2024-12-31',
    urgence: 'Normale',
    statut: 'Terminée',
    specialitesRequises: [
      { specialiteRequise: 'Psychomotricité', anneesExperienceMin: 4 }
    ],
    nombreCandidatures: 15,
    dateCreation: '2024-09-15'
  }
];

const getStatusBadge = (statut: Mission['statut']): JSX.Element => {
  const variants: Record<Mission['statut'], string> = {
    'Brouillon': 'bg-gray-100 text-gray-800 border-gray-300',
    'Active': 'bg-[#5F9598] bg-opacity-20 text-[#1D546D] border-[#5F9598]',
    'Terminée': 'bg-green-100 text-green-800 border-green-300',
    'Annulée': 'bg-red-100 text-red-800 border-red-300'
  };
  return <Badge className={`${variants[statut]} border font-medium`}>{statut}</Badge>;
};

const getUrgenceBadge = (urgence: Mission['urgence']): JSX.Element => {
  const variants: Record<Mission['urgence'], string> = {
    'Urgente': 'bg-red-100 text-red-800 border-red-300',
    'Haute': 'bg-orange-100 text-orange-800 border-orange-300',
    'Normale': 'bg-[#1D546D] bg-opacity-10 text-[#1D546D] border-[#1D546D]'
  };
  return <Badge className={`${variants[urgence]} border font-medium`}>{urgence}</Badge>;
};

const MissionCard: React.FC<{ mission: Mission; onEdit: () => void; onDelete: () => void; onViewCandidatures: () => void }> = ({
  mission,
  onEdit,
  onDelete,
  onViewCandidatures
}) => {
  return (
    <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <CardTitle className="text-xl text-[#061E29]">{mission.titre}</CardTitle>
              {getStatusBadge(mission.statut)}
              {getUrgenceBadge(mission.urgence)}
            </div>
            <CardDescription className="text-[#5F9598] line-clamp-2">
              {mission.description}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-[#1D546D]">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onViewCandidatures} className="cursor-pointer">
                <Eye className="h-4 w-4 mr-2" />
                Voir candidatures
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="cursor-pointer text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-[#5F9598]">
              <Calendar className="h-4 w-4" />
              <span>Du {new Date(mission.dateDebut).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex items-center gap-2 text-[#5F9598]">
              <Calendar className="h-4 w-4" />
              <span>Au {new Date(mission.dateFin).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#1D546D]" />
            <span className="text-sm text-[#1D546D] font-medium">
              Type de public: {mission.typePublic}
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#061E29]">Spécialités requises:</p>
            <div className="flex gap-2 flex-wrap">
              {mission.specialitesRequises.map((spec, idx) => (
                <Badge key={idx} variant="outline" className="text-xs bg-[#F3F4F4] text-[#1D546D] border-[#5F9598]">
                  {spec.specialiteRequise} ({spec.anneesExperienceMin} ans min)
                </Badge>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#5F9598] border-opacity-20">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#5F9598]">
                {mission.nombreCandidatures} candidature{mission.nombreCandidatures !== 1 ? 's' : ''}
              </span>
              <Button 
                onClick={onViewCandidatures}
                variant="outline" 
                size="sm"
                className="border-[#1D546D] text-[#1D546D] hover:bg-[#1D546D] hover:text-white"
              >
                Voir les candidatures
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MissionFormDialog: React.FC<{ mission?: Mission; onSave: (mission: Partial<Mission>) => void }> = ({ mission, onSave }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Mission>>(mission || {
    titre: '',
    description: '',
    typePublic: '',
    dateDebut: '',
    dateFin: '',
    urgence: 'Normale',
    statut: 'Brouillon',
    specialitesRequises: []
  });

  const handleSubmit = () => {
    onSave(formData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mission ? (
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button className="bg-[#061E29] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Créer nouvelle mission
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#061E29]">
            {mission ? 'Modifier la mission' : 'Créer une nouvelle mission'}
          </DialogTitle>
          <DialogDescription className="text-[#5F9598]">
            Remplissez les informations de la mission
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titre" className="text-[#061E29]">Titre *</Label>
            <Input
              id="titre"
              value={formData.titre}
              onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
              placeholder="Ex: Psychologue pour centre d'accueil"
              className="border-[#5F9598] focus:border-[#1D546D]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-[#061E29]">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez la mission en détail..."
              rows={4}
              className="border-[#5F9598] focus:border-[#1D546D]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="typePublic" className="text-[#061E29]">Type de public *</Label>
              <Select
                value={formData.typePublic}
                onValueChange={(value) => setFormData({ ...formData, typePublic: value })}
              >
                <SelectTrigger className="border-[#5F9598]">
                  <SelectValue placeholder="Sélectionnez" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Enfants">Enfants</SelectItem>
                  <SelectItem value="Adolescents">Adolescents</SelectItem>
                  <SelectItem value="Adultes">Adultes</SelectItem>
                  <SelectItem value="Personnes âgées">Personnes âgées</SelectItem>
                  <SelectItem value="Familles">Familles</SelectItem>
                  <SelectItem value="Mixte">Mixte</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgence" className="text-[#061E29]">Niveau d&apos;urgence *</Label>
              <Select
                value={formData.urgence}
                onValueChange={(value) => setFormData({ ...formData, urgence: value as Mission['urgence'] })}
              >
                <SelectTrigger className="border-[#5F9598]">
                  <SelectValue placeholder="Sélectionnez" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normale">Normale</SelectItem>
                  <SelectItem value="Haute">Haute</SelectItem>
                  <SelectItem value="Urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateDebut" className="text-[#061E29]">Date de début *</Label>
              <Input
                id="dateDebut"
                type="date"
                value={formData.dateDebut}
                onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                className="border-[#5F9598] focus:border-[#1D546D]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFin" className="text-[#061E29]">Date de fin *</Label>
              <Input
                id="dateFin"
                type="date"
                value={formData.dateFin}
                onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                className="border-[#5F9598] focus:border-[#1D546D]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="statut" className="text-[#061E29]">Statut *</Label>
            <Select
              value={formData.statut}
              onValueChange={(value) => setFormData({ ...formData, statut: value as Mission['statut'] })}
            >
              <SelectTrigger className="border-[#5F9598]">
                <SelectValue placeholder="Sélectionnez" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Brouillon">Brouillon</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Terminée">Terminée</SelectItem>
                <SelectItem value="Annulée">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} className="bg-[#1D546D] hover:bg-[#061E29] text-white">
            {mission ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Missions: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>(mockMissions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [filterUrgence, setFilterUrgence] = useState<string>('all');
  const [filterTypePublic, setFilterTypePublic] = useState<string>('all');

  const filteredMissions = missions.filter(mission => {
    const matchSearch = mission.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       mission.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatut = filterStatut === 'all' || mission.statut === filterStatut;
    const matchUrgence = filterUrgence === 'all' || mission.urgence === filterUrgence;
    const matchTypePublic = filterTypePublic === 'all' || mission.typePublic === filterTypePublic;
    
    return matchSearch && matchStatut && matchUrgence && matchTypePublic;
  });

  const handleSaveMission = (missionData: Partial<Mission>) => {
    console.log('Mission saved:', missionData);
  };

  const handleDeleteMission = (id: string) => {
    setMissions(missions.filter(m => m.id !== id));
  };

  const handleViewCandidatures = (missionId: string) => {
    console.log('View candidatures for mission:', missionId);
  };

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <div className="flex flex-1 flex-col p-6 md:p-8 space-y-6 bg-[#F3F4F4]">
          {/* En-tête */}
          <div className="flex items-center justify-between bg-[#1D546D] rounded-xl p-6 shadow-lg">
            <div>
              <h1 className="text-3xl font-bold text-white">Mes Missions</h1>
              <p className="text-[#F3F4F4] text-opacity-90 mt-1">
                Gérez vos missions et consultez les candidatures
              </p>
            </div>
            <MissionFormDialog onSave={handleSaveMission} />
          </div>

          {/* Barre de recherche et filtres */}
          <Card className="border-none shadow-lg bg-white">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#5F9598]" />
                  <Input
                    placeholder="Rechercher une mission..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-[#5F9598] focus:border-[#1D546D]"
                  />
                </div>

                <div className="flex gap-3 flex-wrap">
                  <Select value={filterStatut} onValueChange={setFilterStatut}>
                    <SelectTrigger className="w-45 border-[#5F9598]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="Brouillon">Brouillon</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Terminée">Terminée</SelectItem>
                      <SelectItem value="Annulée">Annulée</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterUrgence} onValueChange={setFilterUrgence}>
                    <SelectTrigger className="w-45 border-[#5F9598]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Urgence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes urgences</SelectItem>
                      <SelectItem value="Normale">Normale</SelectItem>
                      <SelectItem value="Haute">Haute</SelectItem>
                      <SelectItem value="Urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterTypePublic} onValueChange={setFilterTypePublic}>
                    <SelectTrigger className="w-45 border-[#5F9598]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Type de public" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les publics</SelectItem>
                      <SelectItem value="Enfants">Enfants</SelectItem>
                      <SelectItem value="Adolescents">Adolescents</SelectItem>
                      <SelectItem value="Adultes">Adultes</SelectItem>
                      <SelectItem value="Personnes âgées">Personnes âgées</SelectItem>
                      <SelectItem value="Familles">Familles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des missions */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
            {filteredMissions.length > 0 ? (
              filteredMissions.map((mission) => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  onEdit={() => handleSaveMission(mission)}
                  onDelete={() => handleDeleteMission(mission.id)}
                  onViewCandidatures={() => handleViewCandidatures(mission.id)}
                />
              ))
            ) : (
              <Card className="border-none shadow-lg bg-white">
                <CardContent className="py-12 text-center">
                  <p className="text-[#5F9598] text-lg">Aucune mission trouvée</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Missions;