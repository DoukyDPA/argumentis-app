import React from 'react';
import { 
  Mic2, MessageSquare, FileText, Mail, Share2, BrainCircuit, 
  Clock, ChevronRight, Sparkles
} from 'lucide-react';

// Exportation des modules pour qu'ils soient réutilisables dans App.jsx
export const modules = [
  { id: 'discours', label: 'Discours', icon: <Mic2 size={24} />, desc: 'Interventions publiques et prises de parole.' },
  { id: 'langage', label: 'Éléments de langage', icon: <MessageSquare size={24} />, desc: 'Arguments clés et punchlines thématiques.' },
  { id: 'argumentaire', label: 'Note d\'argumentaire', icon: <FileText size={24} />, desc: 'Fiches de synthèse et mémos stratégiques.' },
  { id: 'mail', label: 'Courriel stratégique', icon: <Mail size={24} />, desc: 'Rédaction de mails à fort enjeu.' },
  { id: 'social', label: 'Réseaux Sociaux', icon: <Share2 size={24} />, desc: 'Posts LinkedIn, X ou Facebook optimisés.' },
  { id: 'memoriser', label: 'Mémoriser', icon: <BrainCircuit size={24} />, desc: 'Transformer un texte en fiches de mémorisation.' },
];

export const Dashboard = ({ 
  profile, 
  setActiveTab, 
  setChatHistory, 
  setShowLegal, 
  archives = [], 
  setResult, 
  setShowResult 
}) => {
  
  // Fonction pour réouvrir un ancien texte
  const handleOpenArchive = (item) => {
    setResult(item.content);
    setShowResult(true);
    // Optionnel : On peut aussi restaurer le mode (discours, mail...) si besoin
    setActiveTab(item.type);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* SECTION BIENVENUE */}
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-8 bg-[#0058be]"></div>
          <span className="text-[10px] font-black text-[#0058be] uppercase tracking-[0.3em]">Tableau de bord</span>
        </div>
        <h2 className="serif-text text-5xl font-light text-[#091426] leading-tight">
          Bonjour, <span className="italic">{profile?.firstName || 'Cher élu'}</span>.
          <br />Quelle plume souhaitez-vous utiliser ?
        </h2>
      </header>

      {/* GRILLE DES 6 MODULES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module) => (
          <button
            key={module.id}
            onClick={() => {
              setChatHistory([]); // Reset de la mémoire pour une nouvelle tâche
              setActiveTab(module.id);
            }}
            className="group relative p-8 bg-white rounded-[2.5rem] border border-slate-100 hover:border-blue-200 hover:shadow-[0_20px_50px_rgba(0,88,190,0.08)] transition-all duration-300 text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity text-[#0058be]">
              {module.icon}
            </div>
            
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#091426] group-hover:bg-[#0058be] group-hover:text-white transition-colors mb-6">
              {module.icon}
            </div>
            
            <h3 className="text-lg font-bold text-[#091426] mb-2">{module.label}</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              {module.desc}
            </p>
          </button>
        ))}
      </div>

      {/* NOUVELLE SECTION : ARCHIVES (10 derniers textes) */}
      <section className="mt-20 mb-16">
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#0058be]">
              <Clock size={16} />
            </div>
            <h3 className="text-[11px] font-black text-[#091426] uppercase tracking-widest">
              Productions récentes
            </h3>
          </div>
          <div className="h-px flex-grow mx-6 bg-slate-100 hidden md:block"></div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">10 derniers textes</span>
        </div>

        {archives.length === 0 ? (
          <div className="p-12 bg-white/40 rounded-[2.5rem] border border-dashed border-slate-200 text-center">
            <Sparkles className="mx-auto mb-4 text-slate-300" size={32} />
            <p className="text-sm text-slate-400 font-medium italic">
              Vos futurs écrits apparaîtront ici pour un accès rapide.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {archives.map((item) => {
              const moduleInfo = modules.find(m => m.id === item.type);
              return (
                <button
                  key={item.id}
                  onClick={() => handleOpenArchive(item)}
                  className="w-full flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-50 hover:border-blue-100 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-[#0058be] transition-colors">
                      {moduleInfo?.icon || <FileText size={18} />}
                    </div>
                    <div className="text-left overflow-hidden">
                      <p className="font-bold text-[#091426] text-sm truncate pr-4">
                        {item.content.substring(0, 80)}...
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-slate-100 text-slate-500 rounded group-hover:bg-blue-100 group-hover:text-[#0058be] transition-colors">
                          {moduleInfo?.label || 'Document'}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-[#0058be] transition-colors shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* FOOTER DASHBOARD */}
      <footer className="flex flex-col items-center gap-6 pb-12">
        <button 
          onClick={() => setShowLegal(true)}
          className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#0058be] transition-colors"
        >
          Mentions légales & Confidentialité
        </button>
      </footer>
    </div>
  );
};
