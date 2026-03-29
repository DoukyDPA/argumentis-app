import React from 'react';
import { Code, Check, Copy, Target, Send, Loader2, Building2 } from 'lucide-react';
import { formatResult } from '../utils/formatters';

export const ResultView = ({
  showRaw,
  setShowRaw,
  copyToClipboard,
  copySuccess,
  result,
  profile,
  refineInput,
  setRefineInput,
  handleRefine,
  loading
}) => {
  return (
    <div className="animate-in fade-in pb-20">
      <section className="bg-[#091426] rounded-[2.5rem] p-10 mb-10 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-8">
            <span className="bg-blue-500/20 text-blue-200 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-white/5">
              Résultat Généré
            </span>
            <div className="flex gap-3">
              <button onClick={() => setShowRaw(!showRaw)} className="bg-white/10 text-white px-5 py-3 rounded-full hover:bg-white/20 transition-colors">
                <Code size={18} />
              </button>
              <button onClick={copyToClipboard} className="bg-white text-[#091426] flex items-center gap-2 px-6 py-3 rounded-full hover:bg-slate-100 transition-colors">
                {copySuccess ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>
          <h1 className="text-3xl font-light text-white serif-text italic">Projet Finalisé</h1>
        </div>
      </section>
      
      <article className="bg-white rounded-[2.5rem] p-10 md:p-24 shadow-[0_40px_100px_rgba(9,20,38,0.08)] min-h-[800px] relative mb-12 overflow-hidden flex flex-col">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>
        
        <div className="border-b-2 border-slate-50 pb-10 mb-12 flex justify-between items-end relative z-10">
          <div className="sans-text">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-2">Génération Argumentis</p>
            <p className="text-base font-black text-[#091426] uppercase leading-none mb-1">
              {profile?.city ? `Administration de ${profile.city}` : 'Espace Argumentis'}
            </p>
            <p className="text-sm font-bold text-slate-400 italic leading-none">{profile?.role || ''}</p>
          </div>
          <div className="text-right sans-text relative z-10">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="relative z-10 flex-grow">
          {showRaw ? (
            <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans p-8 bg-slate-50 rounded-2xl border border-slate-100">{result}</pre>
          ) : (
            formatResult(result)
          )}
        </div>

        {/* MODULE D'AFFINAGE CONVERSATIONNEL */}
        <div className="mt-12 pt-8 border-t border-slate-100 relative z-10">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
             <Target size={14} /> Affiner ce résultat (L'IA mémorise vos échanges)
          </p>
          <div className="flex gap-3">
            <input 
              type="text" 
              value={refineInput} 
              onChange={e => setRefineInput(e.target.value)} 
              placeholder="Ex: Raccourcis le texte, adopte un ton plus formel..." 
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-[#0058be]/20 shadow-inner"
              onKeyDown={e => { if(e.key === 'Enter') handleRefine() }}
              disabled={loading}
            />
            <button 
              onClick={handleRefine} 
              disabled={loading || !refineInput.trim()} 
              className="bg-[#0058be] text-white px-6 rounded-2xl flex items-center justify-center hover:bg-blue-800 transition-colors shadow-lg disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </div>
        </div>

        <div className="mt-16 pt-12 border-t border-slate-50 flex flex-col items-end relative z-10">
          <div className="text-right">
            <div className="w-40 h-20 mb-3 opacity-[0.05] flex items-center justify-end grayscale"><Building2 size={80} /></div>
            <p className="serif-text font-bold text-2xl text-[#091426] italic leading-none mb-1">{profile?.role || ''}</p>
            <p className="sans-text text-[11px] text-slate-400 font-black uppercase tracking-widest">{profile?.city ? `Territoire de ${profile.city}` : ''}</p>
          </div>
        </div>
      </article>
    </div>
  );
};