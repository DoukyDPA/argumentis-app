import React from 'react';
import { 
  BookOpen, Send, Target, Upload, Loader2, 
  Linkedin, Twitter, Facebook, Instagram, 
  ListOrdered, User, Paperclip 
} from 'lucide-react';
import { modules } from './Dashboard';

export const GenerationForm = ({
  activeTab,
  docs,
  selectedDocId,
  setSelectedDocId,
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
        {docs.length > 0 && (
          <select 
            value={selectedDocId} 
            onChange={e => setSelectedDocId(e.target.value)} 
            className="hidden sm:block bg-white border border-slate-100 text-slate-600 text-xs font-bold rounded-xl px-4 py-2 shadow-sm"
          >
            <option value="">Aucun document lié</option>
            {docs.map(d => <option key={d.id} value={d.id}>📘 {d.title}</option>)}
          </select>
        )}
      </header>

      <section className="space-y-8">
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
                  <input className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm" value={details.cible} onChange={e => setDetails({...details, cible: e.target.value})} placeholder="Ex: Citoyens, Partenaires..." />
                </div>
              </>
            )}

            {activeTab === 'social' && (
              <div className="md:col-span-2 space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase px-1 text-center block">Plateforme</label>
                <div className="flex gap-2">
                  {['LinkedIn', 'X', 'Facebook', 'Instagram'].map(plat => (
                    <button key={plat} onClick={() => setDetails({...details, plateforme: plat})} className={`flex-1 p-4 rounded-2xl border flex flex-col items-center ${details.plateforme === plat ? 'bg-[#091426] text-white shadow-lg' : 'bg-white text-slate-400'}`}>
                      {plat === 'LinkedIn' && <Linkedin size={20} />} {plat === 'X' && <Twitter size={20} />} {plat === 'Facebook' && <Facebook size={20} />} {plat === 'Instagram' && <Instagram size={20} />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'memoriser' && (
              <div className="md:col-span-2 space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase px-1 text-center block">Technique d'ancrage</label>
                <div className="flex gap-2">
                  {[ { id: 'crochets', label: 'Crochets', icon: <ListOrdered size={20} /> }, { id: 'corps', label: 'Loci Corporel', icon: <User size={20} /> }, { id: 'balises', label: 'Balises', icon: <Target size={20} /> } ].map(tech => (
                    <button key={tech.id} onClick={() => setDetails({...details, methodeMemo: tech.id})} className={`flex-1 flex flex-col items-center p-4 rounded-2xl ${details.methodeMemo === tech.id ? 'bg-[#091426] text-white' : 'bg-white text-slate-400'}`}>
                      {tech.icon} <span className="text-[9px] font-black uppercase mt-2">{tech.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(activeTab === 'argumentaire' || activeTab === 'mail') && (
              <div className="md:col-span-1 space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase px-1">Interlocuteur</label>
                <input className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm" value={details.interlocuteur} onChange={e => setDetails({...details, interlocuteur: e.target.value})} placeholder="Ex: Préfet, Directeur..." />
              </div>
            )}

            {activeTab !== 'memoriser' && (
              <div className={`space-y-2 ${activeTab === 'social' ? 'md:col-span-2' : 'md:col-span-1'}`}>
                <label className="text-[10px] font-black text-slate-500 uppercase px-1">Objectif & Ton</label>
                <input className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm" value={details.objectif} onChange={e => setDetails({...details, objectif: e.target.value})} placeholder="Ex: Convaincre, Informer, Fédérer..." />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_60px_rgba(9,20,38,0.05)] relative overflow-hidden">
            <textarea className="w-full bg-transparent border-none p-0 focus:ring-0 text-xl serif-text italic resize-none min-h-[250px]" placeholder="Texte source, notes en vrac ou message principal..." value={input} onChange={(e) => setInput(e.target.value)} />
          </div>
        </div>
        
        <div className="space-y-4">
          <button 
            onClick={() => setShowRef(!showRef)}
            className="flex items-center gap-2 text-sm font-bold text-[#0058be] hover:text-blue-800 transition-colors"
          >
            <Paperclip size={18} />
            {showRef ? 'Masquer le texte de référence' : 'Joindre un texte de référence (Modèle, Contexte...)'}
          </button>

          {showRef && (
            <div className="bg-[#f0f4f8] rounded-[2.5rem] p-8 shadow-inner border border-slate-100 animate-in fade-in slide-in-from-top-2">
               <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <BookOpen size={18} className="text-[#0058be]" />
                    <h3 className="text-xs font-black text-[#091426] uppercase tracking-widest">Matériau Source</h3>
                  </div>
                  
                  <label className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors border ${isReadingPdf ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'text-[#0058be] bg-blue-50 hover:bg-blue-100 border-blue-100'}`}>
                    {isReadingPdf ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} 
                    {isReadingPdf ? 'Lecture...' : 'Importer (PDF, TXT)'}
                    <input type="file" accept=".pdf,.txt,.md,.csv" className="hidden" onChange={handleRefFileUpload} disabled={isReadingPdf} />
                  </label>
               </div>
               <textarea 
                  className="w-full bg-transparent border-none p-0 focus:ring-0 text-base sans-text font-medium leading-relaxed resize-y text-slate-700 min-h-[120px] placeholder:text-slate-400" 
                  placeholder="Collez ici un discours précédent pour en imiter le style, ou importez un fichier..."
                  value={referenceText}
                  onChange={(e) => setReferenceText(e.target.value)}
               />
            </div>
          )}
        </div>
      </section>

      <div className="mt-12 mb-20">
        <button onClick={handleGenerate} disabled={loading || !input} className="w-full bg-[#0058be] text-white rounded-full py-5 px-8 flex items-center justify-center gap-4 hover:scale-[1.02] disabled:opacity-30">
          {loading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
          <span className="font-black tracking-widest uppercase text-sm">Lancer l'assistant IA</span>
        </button>
      </div>
    </div>
  );
};