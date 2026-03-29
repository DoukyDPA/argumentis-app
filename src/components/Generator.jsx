import React, { useState } from 'react';
import { Loader2, Send, BookOpen, Upload, Linkedin, Twitter, Facebook, Instagram, ListOrdered, User, Target, Code, Copy, Check, Building2, Paperclip } from 'lucide-react';
import { VITE_GEMINI_API_KEY } from '../config/firebase';
import { formatResult } from '../utils/formatters';
import { extractTextFromPdf } from '../utils/pdfHelper';
import { modulesConfig } from './Dashboard';

export const Generator = ({ activeTab, profile, docs }) => {
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [refineInput, setRefineInput] = useState('');
  const [showRaw, setShowRaw] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const [referenceText, setReferenceText] = useState('');
  const [showRef, setShowRef] = useState(false);
  const [isReadingPdf, setIsReadingPdf] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState('');

  const [details, setDetails] = useState({
    duree: '', cible: '', objectif: '', interlocuteur: '', plateforme: 'LinkedIn', methodeMemo: 'crochets',
  });

  const activeModule = modulesConfig.find(m => m.id === activeTab);

  const handleRefFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return alert("⚠️ Fichier trop volumineux (limite 5 Mo).");
    setIsReadingPdf(true);
    try {
      let extracted = file.type === 'application/pdf' ? await extractTextFromPdf(file) : await file.text();
      setReferenceText(prev => prev ? prev + "\n\n" + extracted : extracted);
    } catch { alert("Erreur de lecture."); }
    setIsReadingPdf(false);
    e.target.value = null;
  };

  const buildSystemPrompt = () => {
    const docContext = docs.find(d => d.id === selectedDocId);
    let prompt = `Tu es Argumentis, expert en rédaction pour ${profile?.firstName || "l'utilisateur"}. Il est ${profile?.role || 'professionnel'} ${profile?.city ? `à ${profile?.city}` : ''}. Sensibilité/Valeurs : ${profile?.orientation || 'non spécifié'}. 
DIRECTIVES STRICTES : Adapte impérativement le fond et la forme à son rôle et ses convictions. Ton institutionnel, orienté action, zéro jargon.`;
    if (docContext) prompt += `\nCONTEXTE PRIORITAIRE ("${docContext.title}") : "${docContext.content}"`;
    if (referenceText) prompt += `\nMATÉRIAU SOURCE : "${referenceText}"`;
    return prompt;
  };

  const callGemini = async (historyParams, systemInstruction) => {
    setLoading(true);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${VITE_GEMINI_API_KEY}`, {        
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: historyParams, systemInstruction: { parts: [{ text: systemInstruction }] } })
      });
      if (!response.ok) throw new Error(`Erreur API ${response.status}`);
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/^```[a-z]*\n/g, '').replace(/\n```$/g, '') || "Erreur...";
      setResult(text);
      setChatHistory([...historyParams, { role: "model", parts: [{ text }] }]);
    } catch (err) { setResult(`⚠️ Erreur : ${err.message}`); }
    setLoading(false);
  };

  const handleGenerate = () => {
    let q = "";
    switch(activeTab) {
      case 'discours': q = `DISCOURS. DURÉE: ${details.duree||'5 min'}. PUBLIC: ${details.cible}. BUT: ${details.objectif}. SUJET: ${input}`; break;
      case 'langage': q = `FICHE LANGAGE. CONSIGNE: ${details.objectif}. SUJET: ${input}`; break;
      case 'argumentaire': q = `NOTE SYNTHÈSE. POUR: ${details.interlocuteur}. FOND: ${input}`; break;
      case 'mail': q = `MAIL. POUR: ${details.interlocuteur}. BUT: ${details.objectif}. CONTEXTE: ${input}`; break;
      case 'social': q = `POST ${details.plateforme}. TON: ${details.objectif}. SUJET: ${input}`; break;
      case 'memoriser': q = `MÉMORISATION (${details.methodeMemo}). Tableau Markdown. TEXTE: ${input}`; break;
      default: q = input;
    }
    setChatHistory([{ role: "user", parts: [{ text: q }] }]);
    callGemini([{ role: "user", parts: [{ text: q }] }], buildSystemPrompt());
  };

  const handleRefine = () => {
    if (!refineInput.trim()) return;
    const newHist = [...chatHistory, { role: "user", parts: [{ text: `AFFINAGE: ${refineInput}. Version finale uniquement.` }] }];
    setRefineInput('');
    callGemini(newHist, buildSystemPrompt());
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (result) {
    return (
      <div className="animate-in fade-in pb-20">
        <section className="bg-[#091426] rounded-[2.5rem] p-10 mb-10 relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <span className="bg-blue-500/20 text-blue-200 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-white/5">Résultat Généré</span>
            <div className="flex gap-3">
              <button onClick={() => setShowRaw(!showRaw)} className="bg-white/10 text-white px-5 py-3 rounded-full"><Code size={18} /></button>
              <button onClick={copyToClipboard} className="bg-white text-[#091426] flex items-center gap-2 px-6 py-3 rounded-full">{copySuccess ? <Check size={18} /> : <Copy size={18} />}</button>
            </div>
          </div>
          <h1 className="text-3xl font-light text-white serif-text italic">Projet Finalisé</h1>
        </section>
        
        <article className="bg-white rounded-[2.5rem] p-10 md:p-24 shadow-xl mb-12 flex flex-col min-h-[600px]">
          <div className="border-b border-slate-100 pb-8 mb-8">
            <p className="text-[10px] font-black uppercase text-slate-300 mb-1">Argumentis</p>
            <p className="text-base font-black text-[#091426] uppercase">{profile?.city || 'Espace Privé'}</p>
          </div>
          <div className="flex-grow">
            {showRaw ? <pre className="whitespace-pre-wrap text-sm text-slate-700 bg-slate-50 p-6 rounded-2xl">{result}</pre> : formatResult(result)}
          </div>
          <div className="mt-12 pt-8 border-t border-slate-100">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-4 flex items-center gap-2"><Target size={14} /> Affiner ce résultat</p>
            <div className="flex gap-3">
              <input type="text" value={refineInput} onChange={e=>setRefineInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter') handleRefine()}} placeholder="Ex: Raccourcis le texte..." className="flex-1 bg-slate-50 border rounded-2xl px-5 py-4 text-sm focus:ring-2" disabled={loading} />
              <button onClick={handleRefine} disabled={loading||!refineInput.trim()} className="bg-[#0058be] text-white px-6 rounded-2xl disabled:opacity-50"><Send size={20} /></button>
            </div>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-right-10 duration-500">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-[#0058be] mb-2">Rédaction Stratégique</p>
          <h2 className="serif-text text-4xl font-light text-[#091426] italic leading-tight">{activeModule?.label}</h2>
        </div>
        {docs.length > 0 && (
          <select value={selectedDocId} onChange={e => setSelectedDocId(e.target.value)} className="bg-white border rounded-xl px-4 py-2 text-xs font-bold shadow-sm">
            <option value="">Aucun document lié</option>
            {docs.map(d => <option key={d.id} value={d.id}>📘 {d.title}</option>)}
          </select>
        )}
      </header>

      <section className="space-y-8">
        <div className="bg-[#f0f4f8] rounded-[2.5rem] p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeTab === 'discours' && (
              <>
                <div><label className="text-[10px] font-black text-slate-500 uppercase px-1">Durée cible</label><input className="w-full rounded-2xl px-5 py-4 text-sm font-bold shadow-sm border-none mt-1" value={details.duree} onChange={e=>setDetails({...details, duree: e.target.value})} placeholder="Ex: 5 minutes" /></div>
                <div><label className="text-[10px] font-black text-slate-500 uppercase px-1">Auditoire</label><input className="w-full rounded-2xl px-5 py-4 text-sm font-bold shadow-sm border-none mt-1" value={details.cible} onChange={e=>setDetails({...details, cible: e.target.value})} placeholder="Ex: Citoyens..." /></div>
              </>
            )}
            {activeTab === 'social' && (
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-slate-500 uppercase px-1 block mb-2 text-center">Plateforme</label>
                <div className="flex gap-2">
                  {['LinkedIn', 'X', 'Facebook', 'Instagram'].map(p => <button key={p} onClick={()=>setDetails({...details, plateforme: p})} className={`flex-1 p-4 rounded-2xl flex flex-col items-center border ${details.plateforme === p ? 'bg-[#091426] text-white' : 'bg-white text-slate-400'}`}>{p === 'LinkedIn' && <Linkedin size={20} />}{p === 'X' && <Twitter size={20} />}{p === 'Facebook' && <Facebook size={20} />}{p === 'Instagram' && <Instagram size={20} />}</button>)}
                </div>
              </div>
            )}
            {activeTab === 'memoriser' && (
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-slate-500 uppercase px-1 block mb-2 text-center">Technique</label>
                <div className="flex gap-2">
                  {[{id:'crochets', icon:<ListOrdered size={20}/>, l:'Crochets'},{id:'corps', icon:<User size={20}/>, l:'Loci Corporel'},{id:'balises', icon:<Target size={20}/>, l:'Balises'}].map(t => <button key={t.id} onClick={()=>setDetails({...details, methodeMemo: t.id})} className={`flex-1 p-4 rounded-2xl flex flex-col items-center ${details.methodeMemo === t.id ? 'bg-[#091426] text-white' : 'bg-white text-slate-400'}`}>{t.icon}<span className="text-[9px] uppercase font-black mt-2">{t.l}</span></button>)}
                </div>
              </div>
            )}
            {['argumentaire', 'mail'].includes(activeTab) && (
              <div><label className="text-[10px] font-black text-slate-500 uppercase px-1">Interlocuteur</label><input className="w-full rounded-2xl px-5 py-4 text-sm font-bold shadow-sm border-none mt-1" value={details.interlocuteur} onChange={e=>setDetails({...details, interlocuteur: e.target.value})} placeholder="Ex: Préfet..." /></div>
            )}
            {activeTab !== 'memoriser' && (
              <div className={activeTab === 'social' ? 'md:col-span-2' : ''}><label className="text-[10px] font-black text-slate-500 uppercase px-1">Objectif & Ton</label><input className="w-full rounded-2xl px-5 py-4 text-sm font-bold shadow-sm border-none mt-1" value={details.objectif} onChange={e=>setDetails({...details, objectif: e.target.value})} placeholder="Ex: Convaincre..." /></div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden">
          <textarea className="w-full bg-transparent border-none p-0 focus:ring-0 text-xl serif-text italic resize-none min-h-[250px]" placeholder="Texte source ou message principal..." value={input} onChange={e=>setInput(e.target.value)} />
        </div>

        <div>
          <button onClick={() => setShowRef(!showRef)} className="flex items-center gap-2 text-sm font-bold text-[#0058be] hover:underline">
            <Paperclip size={18} /> {showRef ? 'Masquer' : 'Joindre un texte de référence (Modèle...)'}
          </button>
          {showRef && (
            <div className="bg-[#f0f4f8] rounded-[2.5rem] p-8 mt-4">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-black uppercase text-[#091426]">Matériau Source</h3>
                  <label className="text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer bg-blue-50 text-[#0058be] flex items-center gap-2">
                    {isReadingPdf ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Importer
                    <input type="file" className="hidden" onChange={handleRefFileUpload} disabled={isReadingPdf} />
                  </label>
               </div>
               <textarea className="w-full bg-transparent border-none p-0 focus:ring-0 text-base resize-y min-h-[120px]" placeholder="Collez ici..." value={referenceText} onChange={e=>setReferenceText(e.target.value)} />
            </div>
          )}
        </div>
      </section>

      <button onClick={handleGenerate} disabled={loading || !input} className="w-full mt-12 mb-20 bg-[#0058be] text-white rounded-full py-5 px-8 flex justify-center items-center gap-4 hover:scale-[1.02] disabled:opacity-30">
        {loading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
        <span className="font-black tracking-widest uppercase text-sm">Générer</span>
      </button>
    </div>
  );
};
