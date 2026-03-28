import React, { useState } from 'react';
import { ArrowRight, User, Building2, MapPin, Loader2 } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db, APP_NAMESPACE } from '../config/firebase';

export const Onboarding = ({ user, onComplete }) => {
  const [formData, setFormData] = useState({ firstName: '', role: '', city: '' });
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
      <div className="bg-white max-w-md w-full rounded-[2.5rem] p-10 shadow-[0_20px_60px_rgba(9,20,38,0.05)] border border-slate-50 animate-in fade-in slide-in-from-bottom-8 text-center">
        
        {/* Intégration du logo complet Argumentis */}
        <img 
          src="https://i.postimg.cc/vHdj0MkZ/Argumentis.png" 
          alt="Argumentis Logo" 
          className="w-auto h-16 mx-auto mb-8 object-contain" 
        />
        
        <p className="text-slate-500 text-sm font-medium mb-8">Personnalisons votre espace pour que l'IA s'adapte à votre contexte et vos objectifs.</p>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase px-1">Prénom (Requis)</label>
            <div className="relative">
              <input 
                type="text" 
                required 
                className="w-full bg-[#f0f4f8] border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-[#0058be]/20" 
                placeholder="Ex: Daniel" 
                value={formData.firstName} 
                onChange={e => setFormData({...formData, firstName: e.target.value})} 
              />
              <User className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase px-1">Rôle / Fonction (Optionnel)</label>
            <div className="relative">
              <input 
                type="text" 
                className="w-full bg-[#f0f4f8] border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-[#0058be]/20" 
                placeholder="Ex: Maire Adjoint, Directeur..." 
                value={formData.role} 
                onChange={e => setFormData({...formData, role: e.target.value})} 
              />
              <Building2 className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase px-1">Ville / Organisation (Optionnel)</label>
            <div className="relative">
              <input 
                type="text" 
                className="w-full bg-[#f0f4f8] border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-[#0058be]/20" 
                placeholder="Ex: L'Haÿ-les-Roses, Mon Association..." 
                value={formData.city} 
                onChange={e => setFormData({...formData, city: e.target.value})} 
              />
              <MapPin className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={!formData.firstName.trim() || loading}
            className="w-full mt-4 bg-gradient-to-r from-[#0058be] to-[#2170e4] text-white rounded-2xl py-4 px-6 flex items-center justify-between shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            <span className="font-black tracking-widest uppercase text-sm">Commencer</span>
            {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
};
