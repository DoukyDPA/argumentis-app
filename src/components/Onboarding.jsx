import React, { useState } from 'react';
import { ArrowRight, User, Building2, MapPin, Loader2, Flag } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db, APP_NAMESPACE } from '../config/firebase';

// On ajoute "initialData" aux props pour pré-remplir le formulaire en cas d'édition
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
      <div className="bg-white max-w-md w-full rounded-[2.5rem] p-10 shadow-xl border border-slate-50 text-center">
        <h2 className="text-2xl font-black text-[#091426] mb-2 serif-text">
          {initialData ? 'Modifier mon profil' : 'Bienvenue sur Argumentis'}
        </h2>
        <p className="text-slate-500 text-sm mb-8">
          Définissez votre contexte (mandat, association, délégation à l'emploi ou au développement économique...) pour que l'IA adapte ses réponses.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          {/* ... Gardez ici vos champs existants pour firstName, role, et city ... */}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase px-1">Sensibilité politique / Valeurs</label>
            <div className="relative">
              <input 
                type="text" 
                className="w-full bg-[#f0f4f8] border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-[#0058be]/20" 
                placeholder="Ex: Centre-droit, Gauche, Humaniste..." 
                value={formData.orientation || ''} 
                onChange={e => setFormData({...formData, orientation: e.target.value})} 
              />
              <Flag className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={!formData.firstName.trim() || loading}
            className="w-full mt-4 bg-[#0058be] text-white rounded-2xl py-4 px-6 flex items-center justify-between shadow-xl"
          >
            <span className="font-black uppercase text-sm">{initialData ? 'Mettre à jour' : 'Commencer'}</span>
            {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
};
