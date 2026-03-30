import React from 'react';
import { BookOpen, Send, Target, Upload, Loader2, Linkedin, Twitter, Facebook, Instagram, ListOrdered, User, Paperclip, CheckCircle2 } from 'lucide-react';
import { modules } from './Dashboard';

export const GenerationForm = ({ activeTab, docs, selectedDocIds = [], setSelectedDocIds, details, setDetails, input, setInput, showRef, setShowRef, isReadingPdf, handleRefFileUpload, referenceText, setReferenceText, handleGenerate, loading }) => {
  return (
    <div className="animate-in fade-in slide-in-from-right-10 duration-500">
      <header className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.3em] font-black text-[#0058be] mb-2">Rédaction Stratégique</p>
        <h2 className="serif-text text-4xl font-light text-[#091426] italic leading-tight">
          {modules.find(m => m.id === activeTab)?.label}
        </h2>
      </header>

      {/* SÉLECTION DE LA BASE DE SAVOIR */}
      {docs.length > 0 && (
        <section className="mb-8 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={16} className="text-[#0058be]" />
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ma Base de Savoir (Cliquer pour lier au discours)</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {docs.map(doc => {
              const isSelected = selectedDocIds.includes(doc.id);
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocIds(prev => isSelected ? prev.filter(id => id !== doc.id) : [...prev, doc.id])}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${isSelected ? 'bg-[#0058be] text-white border-[#0058be]' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-blue-200'}`}
                >
                  {isSelected && <CheckCircle2 size={14} />}
                  {doc.title}
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="space-y-6">
        {/* Champs de détails (durée, cible, etc.) */}
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
            {/* ... autres modules ... */}
            {activeTab !== 'memoriser' && (
              <div className="md:col-span-1 space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase px-1">Objectif & Ton</label>
                <input className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm" value={details.objectif} onChange={e => setDetails({...details, objectif: e.target.value})} placeholder="Ex: Fédérer..." />
              </div>
            )}
          </div>
        </div>

        {/* Zone de saisie principale */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_60px_rgba(9,20,38,0.05)]">
          <textarea className="w-full bg-transparent border-none p-0 focus:ring-0 text-xl serif-text italic resize-none min-h-[250px]" placeholder="Sujet du discours ou notes en vrac..." value={input} onChange={(e) => setInput(e.target.value)} />
        </div>
        
        {/* Document ponctuel externe */}
        <div className="space-y-4">
          <button onClick={() => setShowRef(!showRef)} className="flex items-center gap-2 text-sm font-bold text-[#0058be] hover:opacity-80">
            <Paperclip size={18} />
            {showRef ? 'Masquer la référence externe' : 'Joindre un nouveau document (hors base)'}
          </button>
          {showRef && (
            <div className="bg-[#f0f4f8] rounded-[2.5rem] p-8 border border-slate-100 animate-in fade-in slide-in-from-top-2">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-black text-[#091426] uppercase tracking-widest">Référence externe</h3>
                  <label className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer border bg-blue-50 text-[#0058be] border-blue-100`}>
                    {isReadingPdf ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} 
                    Importer
                    <input type="file" className="hidden" onChange={handleRefFileUpload} />
                  </label>
               </div>
               <textarea className="w-full bg-transparent border-none p-0 text-slate-700 min-h-[100px]" value={referenceText} onChange={(e) => setReferenceText(e.target.value)} placeholder="Contenu du document externe..." />
            </div>
          )}
        </div>
      </section>

      <div className="mt-12 mb-20">
        <button onClick={handleGenerate} disabled={loading || !input} className="w-full bg-[#0058be] text-white rounded-full py-5 px-8 flex items-center justify-center gap-4 hover:scale-[1.02] disabled:opacity-30 shadow-xl transition-transform">
          {loading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
          <span className="font-black tracking-widest uppercase text-sm">Lancer la génération</span>
        </button>
      </div>
    </div>
  );
};
