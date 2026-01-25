"use client";
import React, { useState } from "react";
import {
  UserPlus,
  Mail,
  Phone,
  User,
  Shield,
  Save,
  X,
  Loader2,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

const CreateAdmin = () => {
  const [formData, setFormData] = useState({
    email: "",
    prenom: "",
    nom: "",
    telephone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (
      !formData.email ||
      !formData.prenom ||
      !formData.nom ||
      !formData.password
    ) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/superadmin/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          prenom: formData.prenom,
          nom: formData.nom,
          telephone: formData.telephone,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Administrateur créé avec succès");
        setFormData({
          email: "",
          prenom: "",
          nom: "",
          telephone: "",
          password: "",
          confirmPassword: "",
        });
      } else {
        toast.error(data.error || "Erreur lors de la création");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      email: "",
      prenom: "",
      nom: "",
      telephone: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <UserPlus className="text-[#5F9598]" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#5F9598]">
                Créer un Administrateur
              </h1>
              <p className="text-slate-500 mt-1">
                Ajoutez un nouvel administrateur à la plateforme
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="space-y-6">
            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Mail size={16} className="text-[#5F9598]" />
                Adresse Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Prénom et Nom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <User size={16} className="text-[#5F9598]" />
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  placeholder="Jean"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <User size={16} className="text-[#5F9598]" />
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  placeholder="Dupont"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {/* Téléphone */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Phone size={16} className="text-[#5F9598]" />
                Téléphone (optionnel)
              </label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="+212 6 12 34 56 78"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Lock size={16} className="text-[#5F9598]" />
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 caractères"
                  className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirmer mot de passe */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Lock size={16} className="text-[#5F9598]" />
                Confirmer le mot de passe{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Retapez le mot de passe"
                  className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="cursor-pointer flex-1 bg-[#1D546D] hover:bg-[#052445] text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Créer l&apos;Administrateur
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                disabled={loading}
                className="px-6 py-3 border-2 border-slate-200 text-slate-600 font-semibold rounded-xl flex items-center gap-2 hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                <X size={20} />
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex gap-3">
            <Shield className="text-blue-600 shrink-0" size={24} />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                Informations importantes
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Le mot de passe doit contenir au moins 6 caractères</li>
                <li>
                  • L&apos;administrateur pourra modifier son mot de passe après
                  connexion
                </li>
                <li>• Les permissions peuvent être modifiées ultérieurement</li>
                <li>
                  • Seul un Super Admin peut créer ou supprimer des
                  administrateurs
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAdmin;
