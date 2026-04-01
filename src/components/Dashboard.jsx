import React from 'react';
import { PenTool, ShieldCheck, MessageSquare, Share2, Brain, MailIcon, Clock, FileText, ChevronRight, Sparkles, Trash2 } from 'lucide-react';

export const modules = [
  { id: 'discours', label: 'Discours', sub: 'Allocutions officielles', icon: <PenTool size={24} /> },
  { id: 'langage', label: 'Fiches argumentaires', sub: 'Éléments de langage', icon: <ShieldCheck size={24} /> },
  { id: 'argumentaire', label: 'Note de synthèse', sub: 'Aide à la décision factuelle', icon: <MessageSquare size={24} /> },
  { id: 'mail', label: 'Courriel personnel', sub: 'Correspondance ciblée', icon: <MailIcon size={24} /> },
  { id: 'social', label: 'Réseaux sociaux', sub: 'Storytelling & engagement', icon: <Share2 size={24} /> },
  { id: 'memoriser', label: 'Mémoriser', sub: 'Astuces mnémotechniques', icon: <Brain size={24} /> },
];

export const Dashboard = ({ 
  profile, 
  setActiveTab, 
  setChatHistory, 
  setShowLegal, 
  archives = [], 
  setResult, 
  setShowResult,
  handleDeleteArchive
}) => {
  
  const handleOpenArchive = (item) => {
  setResult(item.content);
  setShowResult(true);
  setActiveTab(item.type);
  setCurrentArchiveId(item.id); // Assurez-vous d'avoir passé setCurrentArchiveId en prop
};

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

      {/* SECTION ARCHIVES */}
      <section className="mt-16 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Clock size={18} className="text-[#0058be]" />
          <h3 className="text-[11px] font-black text-[#091426] uppercase tracking-widest">
            Vos 10 dernières productions
          </h3>
        </div>

        {archives.length === 0 ? (
          <div className="p-8 bg-white/50 rounded-3xl border border-dashed border-slate-200 text-center text-slate-400 text-sm">
            <Sparkles className="mx-auto mb-3 text-slate-300" size={24} />
            Aucun texte encore archivé.
          </div>
        ) : (
          <div className="space-y-3">
            {archives.map((item) => {
              const moduleInfo = modules.find(m => m.id === item.type);
              return (
                <div key={item.id} className="w-full flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-50 hover:border-blue-100 hover:shadow-md transition-all group">
                  
                  {/* Zone cliquable pour ouvrir l'archive */}
                  <button
                    onClick={() => handleOpenArchive(item)}
                    className="flex-1 flex items-center gap-4 overflow-hidden text-left"
                  >
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center text-[#0058be]">
                      {moduleInfo?.icon || <FileText size={18} />}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-[#091426] text-sm truncate pr-4">
                        {item.content.substring(0, 60)}...
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[9px] font-black uppercase text-[#0058be]">
                          {moduleInfo?.label || 'Document'}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Actions à droite (Poubelle + Chevron) */}
                  <div className="flex items-center gap-1 shrink-0 pl-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Empêche d'ouvrir le document quand on clique sur la poubelle
                        if(window.confirm("Voulez-vous vraiment supprimer cet élément ?")) {
                          handleDeleteArchive(item.id);
                        }
                      }}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                    <ChevronRight size={18} className="text-slate-300 pointer-events-none" />
                  </div>
                  
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="mt-8 text-center pb-8">
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
