import React from 'react';
import { 
  BookOpen, Send, Target, Upload, Loader2, 
  Linkedin, Twitter, Facebook, Instagram, 
  ListOrdered, User, Paperclip, CheckCircle2, Circle
} from 'lucide-react';
import { modules } from './Dashboard';

export const GenerationForm = ({
  activeTab,
  docs,
  selectedDocIds, // Reçoit maintenant le tableau des IDs sélectionnés
  setSelectedDocIds, // Fonction pour ajouter/retirer un ID du tableau
  details,
  setDetails,
  input,
  setInput,
  showRef,
  setShowRef,
  isReadingPdf,
  handleRefFileUpload,
  referenceText,
  setReferenceText,
  handleGenerate,
  loading
}) => {
  return (
    <div className="animate-in fade-in slide-in-from-right-10 duration-500">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-[#0058be] mb-2">Rédaction Stratégique</p>
          <h2 className="serif-text text-4xl font-light text-[#091426] italic leading-tight">
            {modules.find(m => m.id === activeTab)?.label}
          </h2>
        </div>
      </header>

      {/* NOUVEAU : Sélecteur de documents de la Base de Savoir */}
      {docs.length > 0 && (
        <section className="mb-8 bg-white/50 p-6 rounded-[2rem] border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={16} className="text-[#0058be]" />
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Lier ponctuellement des documents de votre base
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {docs.map(doc => {
              const isSelected = selectedDocIds.includes(doc.id);
              return (
                <button
                  key={doc.id}
                  onClick={() => {
                    // Si déjà sélectionné, on l'enlève, sinon on l'ajoute
                    setSelectedDocIds(prev => 
                      isSelected 
                        ? prev.filter(id => id !== doc.id) 
                        : [...prev, doc.id]
                    );
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                    isSelected 
                      ? 'bg-[#0058be] text-white border-[#0058be] shadow-md' 
                      : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  {isSelected ? <CheckCircle2 size={14} /> : <Circle size={14} className="opacity-30" />}
                  {doc.title}
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="space-y-8">
        {/* Reste du formulaire (Champs spécifiques par module) */}
        <div className="bg-[#f0f4f8] rounded-[2.5rem] p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeTab === 'discours' && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase px-1">Durée cible</label>
                  <input className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm" value={details.duree} onChange={e => setDetails({...details, duree: e.target.value})} placeholder="Ex: 5 minutes" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase px-1">Auditoire</label>
                  <input className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm" value={details.cible} onChange={e => setDetails({...details, cible: e.target.value})} placeholder="Ex: Citoyens..." />
                </div>
              </>
            )}
            
            {/* ... gardez les autres conditions (social, mail, etc.) telles quelles ... */}
            
            {(activeTab === 'argumentaire' || activeTab === 'mail') && (
              <div className="md:col-span-1 space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase px-1">Interlocuteur</label>
                <input className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm" value={details.interlocuteur} onChange={e => setDetails({...details, interlocuteur: e.target.value})} />
              </div>
            )}
          </div>
        </div>

        {/* Zone de texte principale */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_60px_rgba(9,20,38,0.05)]">
          <textarea 
            className="w-full bg-transparent border-none p-0 focus:ring-0 text-xl serif-text italic resize-none min-h-[250px]" 
            placeholder="Notes en vrac ou message principal..." 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
          />
        </div>
        
        {/* Module de texte de référence (Upload PDF ponctuel hors base) */}
        <div className="space-y-4">
          <button onClick={() => setShowRef(!showRef)} className="flex items-center gap-2 text-sm font-bold text-[#0058be]">
            <Paperclip size={18} />
            {showRef ? 'Masquer la référence' : 'Joindre un fichier de référence supplémentaire'}
          </button>
          {showRef && (
            <div className="bg-[#f0f4f8] rounded-[2.5rem] p-8 border border-slate-100">
               <div className="flex justify-between mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Texte source externe</h3>
                  <label className="cursor-pointer text-[#0058be] text-xs font-bold">
                    {isReadingPdf ? <Loader2 className="animate-spin" /> : 'Importer PDF'}
                    <input type="file" className="hidden" onChange={handleRefFileUpload} />
                  </label>
               </div>
               <textarea 
                  className="w-full bg-transparent border-none p-0 text-slate-700 min-h-[120px]" 
                  value={referenceText}
                  onChange={(e) => setReferenceText(e.target.value)}
               />
            </div>
          )}
        </div>
      </section>

      <div className="mt-12 mb-20">
        <button onClick={handleGenerate} disabled={loading || !input} className="w-full bg-[#0058be] text-white rounded-full py-5 flex items-center justify-center gap-4 hover:scale-[1.02] disabled:opacity-30 shadow-xl">
          {loading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
          <span className="font-black tracking-widest uppercase text-sm">Lancer l'assistant IA</span>
        </button>
      </div>
    </div>
  );
};
