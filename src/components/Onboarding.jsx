import React, { useState } from 'react';
import { ArrowRight, User, Building2, MapPin, Loader2, Flag } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db, APP_NAMESPACE } from '../config/firebase';

export const Onboarding = ({ user, initialData, onComplete }) => {
  const [formData, setFormData] = useState(initialData || { firstName: '', role: '', city: '', orientation: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !user) return;
    
    setLoading(true);
    try {
      const userRef = doc(db, 'artifacts', APP_NAMESPACE, 'users', user.uid);
      await setDoc(userRef, { profile: formData }, { merge: true });
      onComplete(formData);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde du profil:", err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#e6eef6] flex items-center justify-center p-6">
      <div className="bg-white max-w-lg w-full rounded-[2.5rem] p-10 shadow-xl border border-slate-50 text-center animate-in fade-in zoom-in-95">
        <h2 className="text-2xl font-black text-[#091426] mb-2 serif-text">
          {initialData ? 'Modifier votre profil' : 'Bienvenue sur Argumentis'}
        </h2>
        <p className="text-slate-500 text-sm mb-8">
          Définissez votre contexte actuel. Vous pouvez modifier votre profil à tout moment pour changer de rôle ou de mandat.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8 text-left">
          
          {/* SECTION 1 : RÔLE ACTUEL */}
          <div className="space-y-4 bg-[#f0f4f8] p-6 rounded-3xl shadow-inner border border-slate-100">
            <h3 className="text-xs font-black text-[#0058be] uppercase tracking-widest flex items-center gap-2 mb-2">
              <Building2 size={16} /> 1. Votre fonction du moment
            </h3>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase px-1">Prénom / Nom</label>
              <div className="relative">
                <input type="text" required className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-[#0058be]/20" placeholder="Votre prénom" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                <User className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase px-1">Poste ou Mandat</label>
              <div className="relative">
                <input type="text" className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-[#0058be]/20" placeholder="Ex: Maire adjoint, Directeur d'association, Auteur..." value={formData.role || ''} onChange={e => setFormData({...formData, role: e.target.value})} />
                <Building2 className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase px-1">Territoire ou Organisation</label>
              <div className="relative">
                <input type="text" className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-[#0058be]/20" placeholder="Ex: L'Haÿ-les-Roses, Val-de-Marne..." value={formData.city || ''} onChange={e => setFormData({...formData, city: e.target.value})} />
                <MapPin className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              </div>
            </div>
          </div>

          {/* SECTION 2 : VALEURS */}
          <div className="space-y-4 bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
            <h3 className="text-xs font-black text-[#0058be] uppercase tracking-widest flex items-center gap-2 mb-2">
              <Flag size={16} /> 2. Valeurs & Engagement
            </h3>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase px-1">Sensibilité (Politique, Sociétale...)</label>
              <div className="relative">
                <textarea 
                  className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-medium shadow-sm focus:ring-2 focus:ring-[#0058be]/20 resize-none h-24" 
                  placeholder="Ex: Priorité au développement économique local, accompagnement vers l'emploi..." 
                  value={formData.orientation || ''} 
                  onChange={e => setFormData({...formData, orientation: e.target.value})} 
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={!formData.firstName.trim() || loading} className="w-full bg-[#0058be] text-white rounded-2xl py-4 px-6 flex items-center justify-center gap-3 shadow-xl hover:bg-blue-800 transition-colors disabled:opacity-50">
            <span className="font-black uppercase tracking-widest text-sm">{initialData ? 'Mettre à jour le profil' : 'Commencer'}</span>
            {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
};
