import React, { useState } from 'react';
import { BookOpen, Plus, Trash2, Upload, Loader2, Edit2, Check, ShieldCheck } from 'lucide-react';
import { extractTextFromPdf } from '../utils/pdfHelper';

export const KnowledgeBase = ({ docs, globalDocs = [], isAdmin = false, isAddingDoc, setIsAddingDoc, newDoc, setNewDoc, handleSaveDoc, handleDeleteDoc, handleUpdateDoc }) => {
  const [isReading, setIsReading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [tempTitle, setTempTitle] = useState("");
  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  const startEditing = (doc) => {
    setEditingId(doc.id);
    setTempTitle(doc.title);
  };

  const saveTitle = (id, isGlobal) => {
    if (tempTitle.trim()) {
      handleUpdateDoc(id, { title: tempTitle }, isGlobal);
    }
    setEditingId(null);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      alert("⚠️ Le fichier est trop volumineux (limite : 5 Mo).");
      return;
    }
    setIsReading(true);
    try {
      let extractedText = '';
      if (file.type === 'application/pdf') {
        extractedText = await extractTextFromPdf(file);
      } else {
        extractedText = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target.result);
          reader.onerror = (error) => reject(error);
          reader.readAsText(file);
        });
      }
      setNewDoc({
        ...newDoc,
        content: extractedText,
        title: newDoc.title || file.name.split('.')[0]
      });
    } catch (error) {
      alert("Erreur lors de la lecture du fichier.");
    } finally {
      setIsReading(false);
      e.target.value = null;
    }
  };

  const renderCard = (d, isGlobal) => {
    const canManage = !isGlobal || isAdmin;
    return (
      <div key={d.id} className={`rounded-2xl p-4 border shadow-sm relative transition-colors group ${isGlobal ? 'bg-blue-50/40 border-blue-100 hover:border-blue-300' : 'bg-white border-slate-100 hover:border-blue-200'}`}>
        <div className="flex justify-between items-start mb-2 gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {isGlobal && (
              <span className="px-2 py-0.5 text-[8px] font-black rounded-md uppercase tracking-wider bg-[#0058be] text-white flex items-center gap-1">
                <ShieldCheck size={9} /> Officiel
              </span>
            )}
            <span className="px-2 py-0.5 text-[8px] font-black rounded-md uppercase tracking-wider bg-slate-50 text-slate-400">{d.category}</span>
          </div>
          {canManage && (
            <button onClick={() => handleDeleteDoc(d.id, isGlobal)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0">
              <Trash2 size={14} />
            </button>
          )}
        </div>

        {editingId === d.id && canManage ? (
          <div className="flex items-center gap-2 mb-1">
            <input
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              className="flex-1 bg-slate-50 border-b-2 border-[#0058be] rounded px-2 py-1 text-sm font-bold outline-none"
              onKeyDown={(e) => e.key === 'Enter' && saveTitle(d.id, isGlobal)}
              autoFocus
            />
            <button onClick={() => saveTitle(d.id, isGlobal)} className="p-1.5 bg-[#0058be] text-white rounded-lg"><Check size={14} /></button>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-2 group/title">
            <h3 className="serif-text text-base font-bold mb-1 text-[#091426] leading-tight line-clamp-2">{d.title}</h3>
            {canManage && (
              <button onClick={() => startEditing(d)} className="text-slate-300 hover:text-[#0058be] opacity-0 group-hover/title:opacity-100 transition-all p-1 shrink-0">
                <Edit2 size={13} />
              </button>
            )}
          </div>
        )}

        <p className="text-xs text-slate-400 line-clamp-2 italic leading-relaxed">"{d.content}"</p>
      </div>
    );
  };

  const isEmpty = docs.length === 0 && globalDocs.length === 0;

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between mb-10 px-2">
        <h1 className="serif-text text-4xl font-light text-[#091426]">Base de Savoir</h1>
        <button
          onClick={() => setIsAddingDoc(!isAddingDoc)}
          className={`w-14 h-14 flex items-center justify-center rounded-full shadow-2xl transition-all active:scale-90 ${isAddingDoc ? 'bg-red-500 text-white' : 'bg-slate-900 text-white'}`}
        >
          {isAddingDoc ? <Trash2 size={24} /> : <Plus size={28} />}
        </button>
      </div>

      {isAddingDoc && (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl mb-8 animate-in slide-in-from-top-4">
          <h3 className="text-lg font-bold mb-4 text-[#091426] serif-text">Ajouter un document de référence</h3>

          {isAdmin && (
            <div className="mb-6">
              <label className="text-[10px] font-black text-slate-500 uppercase px-1 mb-2 block">Portée du document</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setNewDoc({ ...newDoc, scope: 'perso' })}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold border transition-colors ${newDoc.scope !== 'global' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-500 border-slate-100'}`}
                >
                  Ma base perso
                </button>
                <button
                  onClick={() => setNewDoc({ ...newDoc, scope: 'global' })}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold border transition-colors flex items-center justify-center gap-2 ${newDoc.scope === 'global' ? 'bg-[#0058be] text-white border-[#0058be]' : 'bg-blue-50 text-[#0058be] border-blue-100'}`}
                >
                  <ShieldCheck size={14} /> Référence officielle (tous)
                </button>
              </div>
              {newDoc.scope === 'global' && (
                <p className="text-xs text-slate-400 mt-2 px-1">Ce document sera disponible pour tous les utilisateurs, sans qu'ils puissent le modifier.</p>
              )}
            </div>
          )}

          <div className="mb-6 flex items-center gap-4">
            <label className={`flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition-colors text-sm font-bold border ${isReading ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-blue-50 text-[#0058be] hover:bg-blue-100 border-blue-100'}`}>
              {isReading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {isReading ? 'Lecture du document...' : 'Importer un fichier (PDF, TXT, MD)'}
              <input type="file" accept=".pdf,.txt,.md,.csv" className="hidden" onChange={handleFileUpload} disabled={isReading} />
            </label>
            <span className="text-xs text-slate-400 font-medium">Max 5 Mo</span>
          </div>
          <div className="space-y-4">
            <input type="text" placeholder="Titre du document..." value={newDoc.title} onChange={e => setNewDoc({...newDoc, title: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-[#0058be]/20" />
            <select value={newDoc.category} onChange={e => setNewDoc({...newDoc, category: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-[#0058be]/20">
              <option value="Interne">Interne</option>
              <option value="Référence">Référence</option>
              <option value="Contexte">Contexte</option>
            </select>
            <textarea placeholder="Ou collez ici le contenu de votre document..." value={newDoc.content} onChange={e => setNewDoc({...newDoc, content: e.target.value})} className="w-full h-32 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-[#0058be]/20 resize-none" />
            <button onClick={handleSaveDoc} disabled={!newDoc.title || !newDoc.content || isReading} className="w-full bg-[#0058be] text-white font-bold py-3 rounded-xl hover:bg-blue-800 disabled:opacity-50 transition-colors">
              {isAdmin && newDoc.scope === 'global' ? 'Publier pour tous les utilisateurs' : 'Sauvegarder dans ma base'}
            </button>
          </div>
        </div>
      )}

      {isEmpty ? (
        <div className="text-center p-12 bg-white rounded-3xl border border-dashed border-slate-200">
          <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-medium">Votre base de savoir est vide.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {globalDocs.length > 0 && (
            <div>
              <p className="text-[10px] font-black text-[#0058be] uppercase tracking-[0.25em] mb-3 px-1 flex items-center gap-2">
                <ShieldCheck size={13} /> Références officielles
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {globalDocs.map(d => renderCard(d, true))}
              </div>
            </div>
          )}

          {docs.length > 0 && (
            <div>
              {globalDocs.length > 0 && (
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3 px-1">Ma base personnelle</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {docs.map(d => renderCard(d, false))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
