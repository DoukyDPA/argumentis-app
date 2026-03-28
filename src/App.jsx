import React, { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { 
  PenTool, MessageSquare, Share2, ShieldCheck, Copy, Loader2, Building2, 
  BookOpen, Send, FileText, Target, Sparkles, Info, Clock, Users, UserCircle, 
  Home, Folder, ArrowLeft, Check, Linkedin, Twitter, Facebook, Instagram, Type, Mail, Code, Brain, ListOrdered, User
} from 'lucide-react';

// Imports des fichiers refactorisés
import { auth, db, APP_NAMESPACE, GEMINI_API_KEY } from './config/firebase';
import { formatResult } from './utils/formatters';
import { KnowledgeBase } from './components/KnowledgeBase';

const App = () => {
  const [activeTab, setActiveTab] = useState('home'); 
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  
  const [input, setInput] = useState('');
  const [referenceText, setReferenceText] = useState('');
  const [showRef, setShowRef] = useState(false);
  const [result, setResult] = useState('');

  const [context, setContext] = useState({
    city: "L'Haÿ-les-Roses",
    role: 'Maire Adjoint (Dév. Éco & Commerces)',
  });

  const [details, setDetails] = useState({
    duree: '', cible: '', objectif: '', interlocuteur: '', plateforme: 'LinkedIn', methodeMemo: 'crochets',
  });

  const [user, setUser] = useState(null);
  const [docs, setDocs] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', category: 'Référence', content: '' });

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Erreur d'authentification Firebase:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    try {
      const docsRef = collection(db, 'artifacts', APP_NAMESPACE, 'users', user.uid, 'documents');
      const unsubscribe = onSnapshot(docsRef, (snapshot) => {
        const fetchedDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        fetchedDocs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setDocs(fetchedDocs);
        setSelectedDocId(prev => (fetchedDocs.length > 0 && !prev) ? fetchedDocs[0].id : prev);
      });
      return () => unsubscribe();
    } catch (err) {
      console.error("Erreur Firestore:", err);
    }
  }, [user]);

  const modules = [
    { id: 'discours', label: 'Discours', sub: 'Élocutions officielles', icon: <PenTool size={24} /> },
    { id: 'langage', label: 'Fiche Langage', sub: 'Persuasion incarnée', icon: <ShieldCheck size={24} /> },
    { id: 'argumentaire', label: 'Note de Synthèse', sub: 'Aide à la décision factuelle', icon: <MessageSquare size={24} /> },
    { id: 'mail', label: 'Courriel Personnel', sub: 'Correspondance ciblée', icon: <Mail size={24} /> },
    { id: 'social', label: 'Réseaux Sociaux', sub: 'Storytelling & Engagement', icon: <Share2 size={24} /> },
    { id: 'memoriser', label: 'Mémoriser', sub: 'Ancrage & Répétition', icon: <Brain size={24} /> },
  ];

  const handleSaveDoc = async () => {
    if (!user || !newDoc.title || !newDoc.content) return;
    await addDoc(collection(db, 'artifacts', APP_NAMESPACE, 'users', user.uid, 'documents'), {
      ...newDoc, createdAt: Date.now()
    });
    setIsAddingDoc(false);
    setNewDoc({ title: '', category: 'Référence', content: '' });
  };

  const handleDeleteDoc = async (docId) => {
    if (!user) return;
    await deleteDoc(doc(db, 'artifacts', APP_NAMESPACE, 'users', user.uid, 'documents', docId));
    setSelectedDocId(prev => prev === docId ? '' : prev);
  };

  const callGemini = async (userQuery, systemInstruction) => {
    setLoading(true);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userQuery }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] }
        })
      });
      if (!response.ok) throw new Error(`Erreur serveur (${response.status})`);
      const data = await response.json();
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Erreur...";
      setResult(text.replace(/^```[a-z]*\n/g, '').replace(/\n```$/g, ''));
    } catch (error) {
      setResult(`⚠️ Erreur : ${error.message}\nVérifiez vos variables Vercel.`);
    }
    setShowResult(true);
    setLoading(false);
  };

  const handleGenerate = () => {
    const activeDoc = docs.find(d => d.id === selectedDocId);
    let systemPrompt = `Tu es Argumentis, l'intelligence de rédaction pour un responsable public (${context.role} à ${context.city}). DIRECTIVES : Ton élégant, évite le jargon.`;
    let userQuery = "";

    switch(activeTab) {
      case 'discours': userQuery = `RÉDIGE UN DISCOURS PUBLIC. DURÉE : ${details.duree || '5 min'}. PUBLIC : ${details.cible}. OBJECTIF : ${details.objectif}. SUJET : ${input}.`; break;
      case 'langage': userQuery = `RÉDIGE UNE FICHE DE LANGAGE. Inclus : Miroir, Mots Totémiques. CONSIGNE : ${details.objectif}. SUJET : ${input}.`; break;
      case 'argumentaire': userQuery = `RÉDIGE UNE NOTE DE SYNTHÈSE FACTUELLE. INTERLOCUTEUR : ${details.interlocuteur}. FOND : ${input}.`; break;
      case 'mail': userQuery = `RÉDIGE UN COURRIEL PERSONNALISÉ. INTERLOCUTEUR : ${details.interlocuteur}. OBJECTIF : ${details.objectif}. CONTEXTE : ${input}.`; break;
      case 'social': userQuery = `RÉDIGE UNE PUBLICATION POUR ${details.plateforme}. TON : ${details.objectif}. SUJET : ${input}.`; break;
      case 'memoriser':
        if (details.methodeMemo === 'corps') userQuery = `Expert en mémorisation (méthode loci corporelle). Crée un tableau Markdown : | Partie du corps | Mot-clé | Élément clé | Image mentale |. TEXTE : ${input}`;
        else if (details.methodeMemo === 'crochets') userQuery = `Expert en mémorisation (crochets d'Hérigone 1=Pinceau...). Tableau Markdown : | N° & Crochet | Mot-clé | Élément clé | Image mentale |. TEXTE : ${input}`;
        else userQuery = `Expert en mémorisation. Crée un système de balises émotionnelles. Tableau Markdown : | Point Clé | Émotion | Ancrage émotionnel |. TEXTE : ${input}`;
        break;
      default: userQuery = input;
    }

    if (activeDoc) systemPrompt += `\nCONTEXTE PRIORITAIRE ("${activeDoc.title}") : "${activeDoc.content}"`;
    if (referenceText) systemPrompt += `\n\nMATÉRIAU SOURCE :\n"""\n${referenceText}\n"""\nINSTRUCTION : Prends impérativement en compte ce texte.`;
    callGemini(userQuery, systemPrompt);
  };

  const copyToClipboard = () => {
    const textArea = document.createElement("textarea");
    textArea.value = result;
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f6fafe] font-sans text-[#171c1f] flex flex-col antialiased">
      <style>{`
        @import url('[https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&display=swap](https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&display=swap)');
        .serif-text { font-family: 'Newsreader', serif; }
        .sans-text { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full z-[100] flex justify-between items-center px-6 h-16 bg-white/80 backdrop-blur-lg border-b border-slate-100">
        <div className="flex items-center gap-3">
          {(showResult || (activeTab !== 'home' && activeTab !== 'docs')) ? (
            <button onClick={() => { setShowResult(false); if(activeTab !== 'docs' && activeTab !== 'home') setActiveTab('home'); }} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-all">
              <ArrowLeft size={20} className="text-slate-900" />
            </button>
          ) : (
            <div className="bg-[#091426] p-1.5 rounded-lg shadow-inner"><Sparkles size={18} className="text-white" /></div>
          )}
          <h1 className="text-xl font-black tracking-tighter text-slate-900 uppercase sans-text">Argumentis</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex flex-col items-end border-r border-slate-100 pr-4 text-right">
             <input className="bg-transparent text-[10px] font-black text-[#0058be] uppercase border-none p-0 focus:ring-0 w-32 text-right" value={context.city} onChange={e => setContext({...context, city: e.target.value})} />
             <input className="bg-transparent text-[11px] font-bold text-slate-700 border-none p-0 focus:ring-0 w-48 text-right truncate" value={context.role} onChange={e => setContext({...context, role: e.target.value})} />
          </div>
          <UserCircle size={28} className="text-slate-300" />
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className={`pt-20 px-6 mx-auto w-full transition-all duration-500 pb-40 ${showResult ? 'max-w-5xl' : 'max-w-xl md:max-w-3xl'}`}>
        
        {/* DASHBOARD */}
        {!showResult && activeTab === 'home' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="mt-6 mb-12">
              <p className="text-[10px] font-black text-[#0058be] uppercase tracking-[0.3em] mb-3">Tableau de bord</p>
              <h2 className="serif-text text-4xl font-light text-[#091426] leading-tight">Bonjour,<br/><span className="font-semibold italic text-[#0058be] leading-relaxed">{context.city}</span></h2>
            </section>
            <section className="grid grid-cols-2 lg:grid-cols-3 gap-5">
              {modules.map((m) => (
                <button key={m.id} onClick={() => setActiveTab(m.id)} className="flex flex-col items-start p-6 bg-white rounded-3xl transition-all active:scale-95 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-50 text-left hover:border-blue-100 hover:shadow-xl">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4"><span className="text-[#091426]">{m.icon}</span></div>
                  <span className="font-bold text-[#091426] text-sm tracking-tight leading-none">{m.label}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase mt-2 leading-tight">{m.sub}</span>
                </button>
              ))}
            </section>
          </div>
        )}

        {/* FORMS */}
        {!showResult && activeTab !== 'home' && activeTab !== 'docs' && (
          <div className="animate-in fade-in slide-in-from-right-10 duration-500">
            <header className="mb-10 flex justify-between items-end">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] font-black text-[#0058be] mb-2">Rédaction Stratégique</p>
                <h2 className="serif-text text-4xl font-light text-[#091426] italic leading-tight">{modules.find(m => m.id === activeTab)?.label}</h2>
              </div>
              {activeTab !== 'memoriser' && docs.length > 0 && (
                <select value={selectedDocId} onChange={e => setSelectedDocId(e.target.value)} className="hidden sm:block bg-white border border-slate-100 text-slate-600 text-xs font-bold rounded-xl px-4 py-2 shadow-sm">
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
                      <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase px-1">Durée cible</label><input className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm" value={details.duree} onChange={e => setDetails({...details, duree: e.target.value})} /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase px-1">Auditoire</label><input className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm" value={details.cible} onChange={e => setDetails({...details, cible: e.target.value})} /></div>
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
                    <div className="md:col-span-1 space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase px-1">Interlocuteur</label><input className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm" value={details.interlocuteur} onChange={e => setDetails({...details, interlocuteur: e.target.value})} /></div>
                  )}
                  {(activeTab !== 'social' && activeTab !== 'memoriser') && (
                    <div className="md:col-span-1 space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase px-1">Objectif & Ton</label><input className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm" value={details.objectif} onChange={e => setDetails({...details, objectif: e.target.value})} /></div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_60px_rgba(9,20,38,0.05)] relative overflow-hidden">
                  <textarea className="w-full bg-transparent border-none p-0 focus:ring-0 text-xl serif-text italic resize-none min-h-[250px]" placeholder="Texte source ou message principal..." value={input} onChange={(e) => setInput(e.target.value)} />
                </div>
              </div>
            </section>

            <div className="mt-12 mb-20">
              <button onClick={handleGenerate} disabled={loading || !input} className="w-full bg-[#0058be] text-white rounded-full py-5 px-8 flex items-center justify-center gap-4 hover:scale-[1.02] disabled:opacity-30">
                {loading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                <span className="font-black tracking-widest uppercase text-sm">Lancer l'assistant IA</span>
              </button>
            </div>
          </div>
        )}

        {/* RESULTS */}
        {showResult && (
          <div className="animate-in fade-in pb-20">
            <section className="bg-[#091426] rounded-[2.5rem] p-10 mb-10 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                  <span className="bg-blue-500/20 text-blue-200 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-white/5">Résultat Généré</span>
                  <div className="flex gap-3">
                    <button onClick={() => setShowRaw(!showRaw)} className="bg-white/10 text-white px-5 py-3 rounded-full"><Code size={18} /></button>
                    <button onClick={copyToClipboard} className="bg-white text-[#091426] flex items-center gap-2 px-6 py-3 rounded-full">{copySuccess ? <Check size={18} /> : <Copy size={18} />}</button>
                  </div>
                </div>
                <h1 className="text-3xl font-light text-white serif-text italic">Projet Finalisé</h1>
              </div>
            </section>
            
            <article className="bg-white rounded-[2.5rem] p-10 md:p-24 shadow-[0_40px_100px_rgba(9,20,38,0.08)] min-h-[800px] relative mb-12 overflow-hidden">
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('[https://www.transparenttextures.com/patterns/natural-paper.png](https://www.transparenttextures.com/patterns/natural-paper.png)')]"></div>
              
              <div className="border-b-2 border-slate-50 pb-10 mb-12 flex justify-between items-end relative z-10">
                <div className="sans-text">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-2">Génération Argumentis</p>
                  <p className="text-base font-black text-[#091426] uppercase leading-none mb-1">Administration de {context.city}</p>
                  <p className="text-sm font-bold text-slate-400 italic leading-none">{context.role}</p>
                </div>
                <div className="text-right sans-text relative z-10"><p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
              </div>

              <div className="relative z-10">
                {showRaw ? (
                  <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans p-8 bg-slate-50 rounded-2xl border border-slate-100">{result}</pre>
                ) : (
                  formatResult(result)
                )}
              </div>

              <div className="mt-24 pt-12 border-t border-slate-50 flex flex-col items-end relative z-10">
                <div className="text-right">
                  <div className="w-40 h-20 mb-3 opacity-[0.05] flex items-center justify-end grayscale"><Building2 size={80} /></div>
                  <p className="serif-text font-bold text-2xl text-[#091426] italic leading-none mb-1">{context.role}</p>
                  <p className="sans-text text-[11px] text-slate-400 font-black uppercase tracking-widest">Territoire de {context.city}</p>
                </div>
              </div>
            </article>
          </div>
        )}

        {/* KNOWLEDGE BASE MODULE */}
        {!showResult && activeTab === 'docs' && (
          <KnowledgeBase docs={docs} isAddingDoc={isAddingDoc} setIsAddingDoc={setIsAddingDoc} newDoc={newDoc} setNewDoc={setNewDoc} handleSaveDoc={handleSaveDoc} handleDeleteDoc={handleDeleteDoc} />
        )}
      </main>

      {/* BOTTOM NAV */}
      {!showResult && (
        <nav className="fixed bottom-0 left-0 w-full flex justify-around p-4 bg-white/90 backdrop-blur-xl rounded-t-[3rem] shadow-lg border-t border-slate-50 z-[100]">
          <button onClick={() => { setActiveTab('home'); setInput(''); }} className={`p-4 rounded-2xl flex flex-col items-center ${activeTab === 'home' ? 'bg-[#091426] text-white' : 'text-slate-400'}`}><Home size={22} /></button>
          <button onClick={() => setActiveTab('discours')} className={`p-4 rounded-2xl flex flex-col items-center ${activeTab !== 'home' && activeTab !== 'docs' ? 'bg-[#091426] text-white' : 'text-slate-400'}`}><PenTool size={22} /></button>
          <button onClick={() => setActiveTab('docs')} className={`p-4 rounded-2xl flex flex-col items-center ${activeTab === 'docs' ? 'bg-[#091426] text-white' : 'text-slate-400'}`}><Folder size={22} /></button>
        </nav>
      )}
    </div>
  );
};

export default App;
