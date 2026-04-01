import React, { useState, useEffect } from 'react';
import { 
  Code, Check, Copy, Target, Send, 
  Loader2, Building2, Edit3, Save, FileDown 
} from 'lucide-react';
import { formatResult } from '../utils/formatters';

// Fonction utilitaire pour nettoyer le markdown avant la copie
const getCleanTextForClipboard = (text) => {
  if (!text) return '';
  return text
    .replace(/^#+\s+/gm, '') // Enlève les titres (## Titre -> Titre)
    .replace(/([*_]{1,2})(.*?)\1/g, '$2') // Enlève gras et italique (**Texte** -> Texte)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Garde le texte des liens
    .replace(/^- \s+/gm, '• ') // Transforme les listes en puces propres
    .trim();
};

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
  loading,
  currentArchiveId,
  handleUpdateArchive
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(result);

  useEffect(() => {
    setEditedContent(result);
  }, [result]);

  const handleSaveAndExit = async () => {
    setIsEditing(false);
    if (handleUpdateArchive && currentArchiveId && editedContent !== result) {
      await handleUpdateArchive(currentArchiveId, editedContent);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="animate-in fade-in pb-20">
      
      {/* SECTION BOUTONS D'ACTION - Masquée à l'impression (print:hidden) */}
      <section className="bg-[#091426] rounded-[2.5rem] p-10 mb-10 relative overflow-hidden print:hidden">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <span className="bg-blue-500/20 text-blue-200 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-white/5">
              {isEditing ? "Mode Édition" : "Résultat Généré"}
            </span>
            <div className="flex flex-wrap gap-3">
              
              {/* BOUTON ÉDITION */}
              <button 
                onClick={isEditing ? handleSaveAndExit : () => setIsEditing(true)} 
                className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all shadow-lg ${
                  isEditing ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {isEditing ? <Save size={18} /> : <Edit3 size={18} />}
                <span className="text-xs font-black uppercase">{isEditing ? 'Enregistrer' : 'Éditer'}</span>
              </button>
              
              {/* BOUTON PDF (Nouveau !) */}
              {!isEditing && (
                <button 
                  onClick={handlePrintPdf}
                  className="bg-blue-50 text-[#0058be] flex items-center gap-2 px-5 py-3 rounded-full hover:bg-blue-100 transition-all shadow-lg"
                  title="Exporter le document en PDF propre"
                >
                  <FileDown size={18} />
                  <span className="text-xs font-black uppercase">PDF</span>
                </button>
              )}

              {/* BOUTON COPIER NETTOYÉ */}
              <button 
                onClick={() => {
                  const cleanText = getCleanTextForClipboard(editedContent);
                  copyToClipboard(cleanText); // On utilise la fonction avec argument !
                }} 
                className="bg-white text-[#091426] flex items-center gap-2 px-6 py-3 rounded-full hover:bg-slate-100 transition-all shadow-xl"
              >
                {copySuccess ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                <span className="text-xs font-black uppercase">Copier</span>
              </button>
            </div>
          </div>
          <h1 className="text-3xl font-light text-white serif-text italic">
            {isEditing ? "Peaufinage du texte" : "Projet Finalisé"}
          </h1>
        </div>
      </section>
      
      {/* PAPIER DU DOCUMENT - Rendu propre à l'impression (print:shadow-none, print:p-0) */}
      <article className="bg-white rounded-[2.5rem] p-10 md:p-24 shadow-[0_40px_100px_rgba(9,20,38,0.08)] min-h-[800px] relative mb-12 overflow-hidden flex flex-col print:shadow-none print:m-0 print:p-0 print:border-none">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] print:hidden"></div>
        
        <div className="border-b-2 border-slate-50 pb-10 mb-12 flex justify-between items-end relative z-10 print:border-slate-300">
          <div className="sans-text">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-2 print:text-slate-500">Génération Argumentis</p>
            <p className="text-base font-black text-[#091426] uppercase leading-none mb-1">
              {profile?.city ? `Administration de ${profile.city}` : 'Espace Argumentis'}
            </p>
            <p className="text-sm font-bold text-slate-400 italic leading-none print:text-slate-600">{profile?.role || ''}</p>
          </div>
          <div className="text-right sans-text relative z-10">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest print:text-slate-500">
              {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="relative z-10 flex-grow print:text-black">
          {isEditing ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full h-full min-h-[600px] p-8 bg-slate-50/50 border-2 border-dashed border-blue-100 rounded-[2rem] serif-text text-xl text-slate-700 leading-relaxed focus:ring-0 focus:border-[#0058be] outline-none resize-none transition-all"
              placeholder="Modifiez votre texte ici..."
              autoFocus
            />
          ) : (
            <div className="animate-in fade-in duration-500">
              {showRaw ? (
                <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans p-8 bg-slate-50 rounded-2xl border border-slate-100">{editedContent}</pre>
              ) : (
                formatResult(editedContent)
              )}
            </div>
          )}
        </div>

        {/* SECTION CHATBOT - Masquée à l'impression */}
        {!isEditing && (
          <div className="mt-12 pt-8 border-t border-slate-100 relative z-10 print:hidden">
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
        )}

        <div className="mt-16 pt-12 border-t border-slate-50 flex flex-col items-end relative z-10 print:border-slate-200">
          <div className="text-right">
            <div className="w-40 h-20 mb-3 opacity-[0.05] flex items-center justify-end grayscale print:opacity-20"><Building2 size={80} /></div>
            <p className="serif-text font-bold text-2xl text-[#091426] italic leading-none mb-1">{profile?.role || ''}</p>
            <p className="sans-text text-[11px] text-slate-400 font-black uppercase tracking-widest print:text-slate-500">{profile?.city ? `Territoire de ${profile.city}` : ''}</p>
          </div>
        </div>
      </article>
    </div>
  );
};