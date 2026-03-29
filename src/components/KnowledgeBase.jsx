import React, { useState } from 'react';
import { BookOpen, Plus, Trash2, Upload, Loader2 } from 'lucide-react';
import { extractTextFromPdf } from '../utils/pdfHelper'; // On importe notre nouvel outil

export const KnowledgeBase = ({ docs, isAddingDoc, setIsAddingDoc, newDoc, setNewDoc, handleSaveDoc, handleDeleteDoc }) => {
  const [isReading, setIsReading] = useState(false); // État pour afficher un chargement pendant la lecture du PDF
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // On monte la limite à 5 Mo pour les PDF

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
      
      // Si c'est un PDF, on utilise notre outil
      if (file.type === 'application/pdf') {
        extractedText = await extractTextFromPdf(file);
      } 
      // Sinon, on lit le texte normalement
      else {
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
      e.target.value = null; // Réinitialise l'input
    }
  };

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
          
          <div className="mb-6 flex items-center gap-4">
            <label className={`flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition-colors text-sm font-bold border ${isReading ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-blue-50 text-[#0058be] hover:bg-blue-100 border-blue-100'}`}>
              {isReading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {isReading ? 'Lecture du document...' : 'Importer un fichier (PDF, TXT, MD)'}
              <input type="file" accept=".pdf,.txt,.md,.csv" className="hidden" onChange={handleFileUpload} disabled={isReading} />
            </label>
            <span className="text-xs text-slate-400 font-medium">Max 5 Mo</span>
          </div>

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
              placeholder="Ou collez ici le contenu de votre document..." 
              value={newDoc.content}
              onChange={e => setNewDoc({...newDoc, content: e.target.value})}
              className="w-full h-32 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-[#0058be]/20 resize-none"
            />
            <button 
              onClick={handleSaveDoc}
              disabled={!newDoc.title || !newDoc.content || isReading}
              className="w-full bg-[#0058be] text-white font-bold py-3 rounded-xl hover:bg-blue-800 disabled:opacity-50 transition-colors"
            >
              Sauvegarder dans ma base
            </button>
          </div>
        </div>
      )}

      {/* Reste du code d'affichage des documents inchangé... */}
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