import React from 'react';
import { BookOpen, Plus, Trash2 } from 'lucide-react';

export const KnowledgeBase = ({ docs, isAddingDoc, setIsAddingDoc, newDoc, setNewDoc, handleSaveDoc, handleDeleteDoc }) => {
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
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Titre du document..." 
              value={newDoc.title}
              onChange={e => setNewDoc({...newDoc, title: e.target.value})}
              className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-[#0058be]/20"
            />
            <select 
              value={newDoc.category}
              onChange={e => setNewDoc({...newDoc, category: e.target.value})}
              className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-[#0058be]/20"
            >
              <option value="Interne">Interne</option>
              <option value="Référence">Référence</option>
              <option value="Contexte">Contexte</option>
            </select>
            <textarea 
              placeholder="Collez ici le contenu de votre document..." 
              value={newDoc.content}
              onChange={e => setNewDoc({...newDoc, content: e.target.value})}
              className="w-full h-32 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-[#0058be]/20 resize-none"
            />
            <button 
              onClick={handleSaveDoc}
              disabled={!newDoc.title || !newDoc.content}
              className="w-full bg-[#0058be] text-white font-bold py-3 rounded-xl hover:bg-blue-800 disabled:opacity-50 transition-colors"
            >
              Sauvegarder dans ma base
            </button>
          </div>
        </div>
      )}

      {docs.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-3xl border border-dashed border-slate-200">
          <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-medium">Votre base de savoir est vide.</p>
          <p className="text-xs text-slate-400 mt-2">Ajoutez des documents pour donner du contexte à l'IA.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {docs.map(d => (
            <div key={d.id} className="bg-white rounded-3xl p-8 border border-slate-50 shadow-sm relative hover:border-blue-200 transition-colors group">
              <div className="flex justify-between items-start mb-5">
                <span className="px-3 py-1 text-[9px] font-black rounded-lg uppercase tracking-widest bg-slate-50 text-slate-400">{d.category}</span>
                <button onClick={() => handleDeleteDoc(d.id)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 size={16} />
                </button>
              </div>
              <h3 className="serif-text text-xl font-bold mb-3 text-[#091426]">{d.title}</h3>
              <p className="text-sm text-slate-400 line-clamp-3 italic leading-relaxed">"{d.content}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
