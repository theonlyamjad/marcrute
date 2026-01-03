    "use client";

    import React, { useState, useEffect } from 'react';
    import { 
    Search, MapPin, Star, Award, Calendar, Filter, 
    ChevronRight, Briefcase, GraduationCap, CheckCircle2, X, Loader2
    } from 'lucide-react';

    import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
    import { AppSidebar } from '@/components/enterprise-dashboard/components/app-sidebar';
    import { searchWorkers, getWorkerProfile, getSpecialtyCategories, getRegionsWithCities } from '@/actions/enterprise/travailleurs';
    import { toast } from 'sonner';

    // --- Interfaces de Données ---
    export type WorkerAvailability = "Disponible" | "En mission" | "Bientôt libre";

    export interface Specialty {
    name: string;
    level: "Débutant" | "Intermédiaire" | "Avancé" | "Expert";
    }

    export interface Diploma {
    title: string;
    school: string;
    year: string;
    verified: boolean;
    }

    export interface Worker {
    id: number;
    name: string;
    photo: string;
    city: string;
    region: string;
    specialties: Specialty[];
    experience: number;
    rating: number;
    isLabelled: boolean;
    availability: WorkerAvailability;
    bio: string;
    diplomas: Diploma[];
    }

    const TravailleursPage = () => {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        idSpecialite: undefined as number | undefined,
        idVille: undefined as string | undefined,
        anneesExperienceMin: undefined as number | undefined,
        isLabelled: undefined as boolean | undefined,
        isAvailable: undefined as boolean | undefined,
    });
    const [specialties, setSpecialties] = useState<{ id: number; name: string }[]>([]);
    const [regions, setRegions] = useState<any[]>([]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [workersResult, specialtiesResult, regionsResult] = await Promise.all([
                    searchWorkers({ search: searchTerm || undefined, ...filters }),
                    getSpecialtyCategories(),
                    getRegionsWithCities(),
                ]);

                if (workersResult.success && workersResult.data) {
                    setWorkers(workersResult.data.map(w => ({
                        ...w,
                        id: parseInt(w.id) || 0,
                        photo: w.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${w.name}`,
                    })));
                }

                if (specialtiesResult.success && specialtiesResult.data) {
                    setSpecialties(specialtiesResult.data.map(s => ({ id: s.id, name: s.name })));
                }

                if (regionsResult.success && regionsResult.data) {
                    setRegions(regionsResult.data);
                }
            } catch (error) {
                toast.error("Erreur lors du chargement des travailleurs");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [searchTerm, filters]);

    const handleSelectWorker = async (worker: Worker) => {
        try {
            const result = await getWorkerProfile(worker.id.toString());
            if (result.success && result.data) {
                setSelectedWorker({
                    ...result.data,
                    id: parseInt(result.data.id) || 0,
                    photo: result.data.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.data.name}`,
                });
            }
        } catch (error) {
            toast.error("Erreur lors du chargement du profil");
            console.error(error);
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
                <h1 className="text-xl font-bold text-[#061E29]">Annuaire des Travailleurs</h1>
            </div>
            <div className="flex items-center gap-4">
                <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Rechercher un talent..." 
                    className="pl-10 pr-4 py-2 border rounded-full text-sm w-64 focus:ring-2 focus:ring-[#5F9598] outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                </div>
            </div>
            </header>

            <div className="flex h-[calc(100vh-64px)]">
            {/* --- Filtres Avancés --- */}
            <aside className="w-64 border-r p-6 space-y-6 overflow-y-auto hidden md:block bg-[#F3F4F4]/30">
                <div className="flex items-center gap-2 text-[#061E29] font-bold mb-2">
                <Filter size={18} /> <span>Filtres</span>
                </div>

                <FilterSection label="Spécialité">
                <select 
                    className="w-full p-2 border rounded-md text-sm text-[#061E29]"
                    value={filters.idSpecialite?.toString() || ""}
                    onChange={(e) => setFilters({ ...filters, idSpecialite: e.target.value ? parseInt(e.target.value) : undefined })}
                >
                    <option value="">Toutes</option>
                    {specialties.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
                </FilterSection>

                <FilterSection label="Expérience (ans)">
                <input 
                    type="range" 
                    className="w-full accent-[#5F9598]" 
                    min="0"
                    max="20"
                    value={filters.anneesExperienceMin || 0}
                    onChange={(e) => setFilters({ ...filters, anneesExperienceMin: parseInt(e.target.value) || undefined })}
                />
                <span className="text-xs text-[#5F9598]">{filters.anneesExperienceMin || 0} ans minimum</span>
                </FilterSection>

                <div className="pt-4 space-y-3">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="accent-[#5F9598]"
                        checked={filters.isLabelled === true}
                        onChange={(e) => setFilters({ ...filters, isLabelled: e.target.checked ? true : undefined })}
                    />
                    <span className="text-[#061E29]">Labellisés uniquement</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="accent-[#5F9598]"
                        checked={filters.isAvailable === true}
                        onChange={(e) => setFilters({ ...filters, isAvailable: e.target.checked ? true : undefined })}
                    />
                    <span className="text-[#061E29]">Disponible immédiatement</span>
                </label>
                </div>
                
                <button 
                    onClick={() => {
                        setFilters({
                            idSpecialite: undefined,
                            idVille: undefined,
                            anneesExperienceMin: undefined,
                            isLabelled: undefined,
                            isAvailable: undefined,
                        });
                        setSearchTerm("");
                    }}
                    className="w-full py-2 bg-[#5F9598] text-white rounded-lg text-sm font-bold hover:bg-[#1D546D] transition-colors"
                >
                    Réinitialiser les filtres
                </button>
            </aside>

            {/* --- Liste des Travailleurs --- */}
            <main className="flex-1 p-6 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-[#1D546D] mb-4" />
                        <p className="text-[#5F9598] text-lg ml-4">Chargement des travailleurs...</p>
                    </div>
                ) : workers.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {workers.map((worker) => (
                        <div 
                        key={worker.id}
                        onClick={() => handleSelectWorker(worker)}
                        className="group flex gap-4 p-4 border rounded-xl hover:border-[#5F9598] hover:shadow-md transition-all cursor-pointer bg-white"
                        >
                    <img src={worker.photo} className="w-20 h-20 rounded-lg bg-[#F3F4F4]" alt={worker.name} />
                    
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-[#061E29] text-lg">{worker.name}</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin size={14} /> {worker.city}, {worker.region}
                            </p>
                        </div>
                        {worker.isLabelled && (
                            <span className="bg-[#5F9598]/10 text-[#5F9598] p-1 rounded-full"><Award size={18} /></span>
                        )}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                        {worker.specialties.slice(0, 2).map(s => (
                            <span key={s.name} className="text-[10px] uppercase font-bold px-2 py-1 bg-[#F3F4F4] text-[#1D546D] rounded">
                            {s.name}
                            </span>
                        ))}
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t pt-3">
                        <div className="flex gap-4">
                            <div className="text-center">
                            <p className="text-[10px] text-gray-400 uppercase">Exp.</p>
                            <p className="text-xs font-bold text-[#061E29]">{worker.experience} ans</p>
                            </div>
                            <div className="text-center">
                            <p className="text-[10px] text-gray-400 uppercase">Note</p>
                            <p className="text-xs font-bold text-[#061E29] flex items-center gap-1">
                                <Star size={12} className="text-yellow-500 fill-yellow-500" /> {worker.rating}
                            </p>
                            </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${worker.availability === 'Disponible' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {worker.availability.toUpperCase()}
                        </span>
                        </div>
                    </div>
                    </div>
                    ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-[#5F9598] text-lg">Aucun travailleur trouvé</p>
                    </div>
                )}
            </main>

            {/* --- Vue Détaillée Typée --- */}
            {selectedWorker && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm">
                <div className="w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right">
                    <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
                    <span className="font-bold text-[#061E29]">Profil Détaillé</span>
                    <button onClick={() => setSelectedWorker(null)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
                    </div>

                    <div className="p-8">
                    <div className="flex flex-col items-center mb-8">
                        <img src={selectedWorker.photo} className="w-32 h-32 rounded-2xl border-4 border-[#F3F4F4] mb-4" alt={selectedWorker.name} />
                        <h2 className="text-2xl font-bold text-[#061E29]">{selectedWorker.name}</h2>
                        <p className="text-[#5F9598] font-medium">{selectedWorker.city}, Maroc</p>
                    </div>

                    <section className="mb-8">
                        <h4 className="text-sm font-bold text-[#1D546D] uppercase mb-2">Biographie</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{selectedWorker.bio}</p>
                    </section>

                    <section className="mb-8">
                        <h4 className="text-sm font-bold text-[#1D546D] uppercase mb-3">Compétences & Niveaux</h4>
                        <div className="space-y-2">
                        {selectedWorker.specialties.map((s: Specialty) => (
                            <div key={s.name} className="flex justify-between items-center p-3 bg-[#F3F4F4] rounded-lg">
                            <span className="text-sm font-semibold text-[#061E29]">{s.name}</span>
                            <span className="text-xs bg-[#5F9598] text-white px-2 py-1 rounded">{s.level}</span>
                            </div>
                        ))}
                        </div>
                    </section>

                    <section className="mb-8">
                        <h4 className="text-sm font-bold text-[#1D546D] uppercase mb-3">Diplômes</h4>
                        {selectedWorker.diplomas.map((d: Diploma) => (
                        <div key={d.title} className="flex gap-3 p-3 border rounded-lg items-start mb-2">
                            <GraduationCap className="text-[#5F9598]" />
                            <div>
                            <p className="text-sm font-bold text-[#061E29]">{d.title}</p>
                            <p className="text-xs text-gray-500">{d.school} • {d.year}</p>
                            {d.verified && <span className="text-[10px] text-green-600 flex items-center gap-1 font-bold mt-1"><CheckCircle2 size={12}/> VÉRIFIÉ</span>}
                            </div>
                        </div>
                        ))}
                    </section>

                    <div className="grid grid-cols-2 gap-4">
                        <button className="py-3 px-4 border-2 border-[#5F9598] text-[#5F9598] font-bold rounded-xl hover:bg-[#F3F4F4] transition-all">
                        Voir Calendrier
                        </button>
                        <button className="py-3 px-4 bg-[#5F9598] text-white font-bold rounded-xl hover:bg-[#1D546D] shadow-lg shadow-[#5F9598]/20 transition-all">
                        Recruter
                        </button>
                    </div>
                    </div>
                </div>
                </div>
            )}
            </div>
        </SidebarInset>
        </SidebarProvider>
    );
    };

    const FilterSection = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="space-y-2">
        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
        {children}
    </div>
    );

    export default TravailleursPage;