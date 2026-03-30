import React from 'react';
import { PenTool, ShieldCheck, MessageSquare, Share2, Brain, MailIcon } from 'lucide-react';

// On exporte les modules pour pouvoir les réutiliser dans App.jsx
export const modules = [
  { id: 'discours', label: 'Discours', sub: 'Allocutions officielles', icon: <PenTool size={24} /> },
  { id: 'langage', label: 'Fiches argumentaires', sub: 'Éléments de langage', icon: <ShieldCheck size={24} /> },
  { id: 'argumentaire', label: 'Note de synthèse', sub: 'Aide à la décision factuelle', icon: <MessageSquare size={24} /> },
  { id: 'mail', label: 'Courriel personnel', sub: 'Correspondance ciblée', icon: <MailIcon size={24} /> },
  { id: 'social', label: 'Réseaux sociaux', sub: 'Storytelling & engagement', icon: <Share2 size={24} /> },
  { id: 'memoriser', label: 'Mémoriser', sub: 'Astuces mnémotechniques', icon: <Brain size={24} /> },
];

export const Dashboard = ({ profile, setActiveTab, setChatHistory, setShowLegal }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="mt-6 mb-12">
        <p className="text-[10px] font-black text-[#0058be] uppercase tracking-[0.3em] mb-3">Tableau de bord</p>
        <h2 className="serif-text text-4xl font-light text-[#091426] leading-tight">
          Bonjour, <span className="font-semibold italic text-[#0058be]">{profile?.firstName || 'vous'}</span>
        </h2>
        <p className="text-slate-500 mt-2 font-medium text-lg">Assistant d'argumentation pour les décideurs</p>
      </section>
      
      <section className="grid grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map((m) => (
          <button 
            key={m.id} 
            onClick={() => { setActiveTab(m.id); setChatHistory([]); }} 
            className="flex flex-col items-start p-6 bg-white rounded-3xl transition-all active:scale-95 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-50 text-left hover:border-blue-100 hover:shadow-xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
              <span className="text-[#091426]">{m.icon}</span>
            </div>
            <span className="font-bold text-[#091426] text-sm tracking-tight leading-none">{m.label}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase mt-2 leading-tight">{m.sub}</span>
          </button>
        ))}
      </section>

      <div className="mt-16 text-center pb-8">
        <button 
          onClick={() => setShowLegal(true)} 
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors underline decoration-slate-200 underline-offset-4"
        >
          Mentions légales &amp; Politique de confidentialité
        </button>
      </div>
    </div>
  );
};
