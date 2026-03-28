import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { 
  PenTool, MessageSquare, Share2, ShieldCheck, Copy, Loader2, Building2, 
  BookOpen, Plus, Trash2, Send, FileText, Target, Sparkles, Info, 
  Clock, Users, UserCircle, Home, Folder, ArrowLeft, ExternalLink, 
  Check, Linkedin, Twitter, Facebook, Instagram, Type, Mail, Code, Brain, ListOrdered, User
} from 'lucide-react';

// Extraction sécurisée des variables d'environnement pour Vite (Vercel)
const getEnv = (key) => {
  try {
    return import.meta.env[key];
  } catch (e) {
    return "";
  }
};

// Configuration Firebase & Gemini (Prête pour Vercel via les variables d'environnement)
const isCanvas = typeof __firebase_config !== 'undefined';
const firebaseConfig = isCanvas ? JSON.parse(__firebase_config) : {
  apiKey: getEnv('VITE_FIREBASE_API_KEY') || "VOTRE_API_KEY_FIREBASE",
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN') || "VOTRE_AUTH_DOMAIN",
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID') || "VOTRE_PROJECT_ID",
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET') || "VOTRE_STORAGE_BUCKET",
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') || "VOTRE_MESSAGING_SENDER_ID",
  appId: getEnv('VITE_FIREBASE_APP_ID') || "VOTRE_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// SÉCURITÉ : On remplace les "/" éventuels par des "_" pour ne pas casser le chemin des collections Firebase
const appId = typeof __app_id !== 'undefined' ? String(__app_id).replace(/\//g, '_') : 'argumentis-prod-v1';
const apiKey = isCanvas ? "" : (getEnv('VITE_GEMINI_API_KEY') || "VOTRE_CLE_API_GEMINI");

const App = () => {
  // Navigation & UI State
  const [activeTab, setActiveTab] = useState('home'); 
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  
  // Data State
  const [input, setInput] = useState('');
  const [referenceText, setReferenceText] = useState('');
  const [showRef, setShowRef] = useState(false);
  const [result, setResult] = useState('');

  // Profil & Context (Pré-rempli pour vous)
  const [context, setContext] = useState({
    city: "L'Haÿ-les-Roses",
    role: 'Maire Adjoint (Dév. Éco & Commerces)',
  });

  const [details, setDetails] = useState({
    duree: '', cible: '', objectif: '', interlocuteur: '', plateforme: 'LinkedIn', methodeMemo: 'crochets',
  });

  // Firebase State
  const [user, setUser] = useState(null);
  const [docs, setDocs] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', category: 'Référence', content: '' });

  // 1. Initialisation de l'Authentification
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          const { signInWithCustomToken } = await import('firebase/auth');
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Erreur d'authentification Firebase:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 2. Synchronisation de la Base de Connaissances (Firestore)
  useEffect(() => {
    if (!user) return;
    
    try {
      const docsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'documents');
      
      const unsubscribe = onSnapshot(docsRef, (snapshot) => {
        const fetchedDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        fetchedDocs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setDocs(fetchedDocs);
        
        setSelectedDocId(prev => (fetchedDocs.length > 0 && !prev) ? fetchedDocs[0].id : prev);
      }, (error) => {
        console.error("Erreur de synchronisation des documents:", error);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Erreur lors de l'accès à Firestore:", err);
    }
  }, [user]);

  // Modules de rédaction
  const modules = [
    { id: 'discours', label: 'Discours', sub: 'Élocutions officielles', icon: <PenTool size={24} /> },
    { id: 'langage', label: 'Fiche Langage', sub: 'Persuasion incarnée', icon: <ShieldCheck size={24} /> },
    { id: 'argumentaire', label: 'Note de Synthèse', sub: 'Aide à la décision factuelle', icon: <MessageSquare size={24} /> },
    { id: 'mail', label: 'Courriel Personnel', sub: 'Correspondance ciblée', icon: <Mail size={24} /> },
    { id: 'social', label: 'Réseaux Sociaux', sub: 'Storytelling & Engagement', icon: <Share2 size={24} /> },
    { id: 'memoriser', label: 'Mémoriser', sub: 'Ancrage & Répétition', icon: <Brain size={24} /> },
  ];

  // Actions Firebase (Ajouter / Supprimer un document)
  const handleSaveDoc = async () => {
    if (!user || !newDoc.title || !newDoc.content) return;
    try {
      const docsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'documents');
      await addDoc(docsRef, {
        title: newDoc.title,
        category: newDoc.category,
        content: newDoc.content,
        createdAt: Date.now()
      });
      setIsAddingDoc(false);
      setNewDoc({ title: '', category: 'Référence', content: '' });
    } catch (error) {
      console.error("Erreur lors de l'ajout du document:", error);
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'documents', docId));
      setSelectedDocId(prev => prev === docId ? '' : prev);
    } catch (error) {
      console.error("Erreur lors de la suppression du document:", error);
    }
  };

  // Appel à l'IA (Gemini)
  const callGemini = async (userQuery, systemInstruction) => {
    setLoading(true);
    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] }
    };

    const maxRetries = 5;
    const baseDelay = 1000;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`Erreur serveur (${response.status})`);

        const data = await response.json();
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Erreur : L'IA n'a retourné aucun texte.";
        text = text.replace(/^```[a-z]*\n/g, '').replace(/\n```$/g, '');
        
        setResult(text);
        setShowResult(true);
        setLoading(false);
        return; 
      } catch (error) {
        if (attempt === maxRetries) {
          setResult(`⚠️ Erreur de communication avec l'IA : ${error.message}\nVérifiez vos variables d'environnement sur Vercel ou réessayez.`);
          setShowResult(true);
          setLoading(false);
          return;
        }
        await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, attempt)));
      }
    }
  };

  const handleGenerate = () => {
    const activeDoc = docs.find(d => d.id === selectedDocId);
    let systemPrompt = `Tu es Argumentis, l'intelligence de rédaction pour un responsable public (${context.role} à ${context.city}).
    DIRECTIVES :
    - Ton élégant, institutionnel mais accessible.
    - Évite le jargon de consultant.`;

    let userQuery = "";

    switch(activeTab) {
      case 'discours':
        userQuery = `RÉDIGE UN DISCOURS PUBLIC. DURÉE : ${details.duree || '5 min'}. PUBLIC : ${details.cible}. OBJECTIF : ${details.objectif}. SUJET : ${input}.`;
        break;
      case 'langage':
        userQuery = `RÉDIGE UNE FICHE DE LANGAGE PERSONNELLE. Inclus : Miroir, Mots Totémiques, Règle de 3, Le Pivot. CONSIGNE : ${details.objectif}. SUJET : ${input}.`;
        break;
      case 'argumentaire':
        userQuery = `RÉDIGE UNE NOTE DE SYNTHÈSE FACTUELLE. Structure : OBJET, ÉTAT DES LIEUX (Données), RISQUES, PRÉCONISATIONS. INTERLOCUTEUR : ${details.interlocuteur}. FOND : ${input}.`;
        break;
      case 'mail':
        userQuery = `RÉDIGE UN COURRIEL PERSONNALISÉ. INTERLOCUTEUR : ${details.interlocuteur}. OBJECTIF : ${details.objectif}. CONTEXTE : ${input}.`;
        break;
      case 'social':
        userQuery = `RÉDIGE UNE PUBLICATION POUR ${details.plateforme}. Utilise le Storytelling, une accroche forte et adapte au réseau social. TON : ${details.objectif}. SUJET : ${input}.`;
        break;
      case 'memoriser':
        if (details.methodeMemo === 'corps') {
          userQuery = `Tu es un expert en techniques de mémorisation. Mon objectif est d'utiliser mon corps comme support pour mémoriser selon la méthode des loci (méthode de localisation corporelle).
          1. Analyse le texte suivant et identifie les éléments clés à retenir.
          2. Établis un parcours logique descendant sur le corps (ex: front, yeux, nez, bouche, épaules, cœur, mains, genoux, etc.) correspondant au nombre d'éléments.
          3. Associe chaque idée à un repère corporel avec un mot clé et une image mentale frappante, amusante ou absurde qui interagit avec cette partie du corps.
          Présente sous forme de tableau Markdown : | Partie du corps | Mot-clé | Élément clé | Image mentale |. 
          TEXTE À MÉMORISER : ${input}`;
        } else if (details.methodeMemo === 'crochets') {
          userQuery = `Tu es un expert en techniques de mémorisation visuelle. Mon objectif est de mémoriser le texte suivant en utilisant la méthode des crochets mnémoniques (inspirée de la table d'Hérigone).
          1. Décompose le texte en éléments clés (jusqu'à 10 maximum).
          2. Associe chaque élément au crochet correspondant : 1=Pinceau (ou Bougie), 2=Cygne, 3=Bébé, 4=Voilier, 5=Hameçon, 6=Yoyo, 7=Boomerang, 8=Sablier, 9=Œuf, 10=Batte.
          3. Crée une image mentale dynamique et surprenante pour chaque association (visuelle, concrète, avec du mouvement).
          4. Relie le tout dans une petite histoire fluide à la fin.
          Présente le résultat sous forme de tableau Markdown : | N° & Crochet | Mot-clé | Élément clé | Image mentale |
          TEXTE À MÉMORISER : ${input}`;
        } else {
          userQuery = `Tu es un expert en mémorisation. Crée un système de marqueurs émotionnels pour retenir le texte suivant. Identifie les points de bascule du texte et crée pour chacun un ancrage émotionnel fort (fierté, surprise, urgence, espoir...). 
          Présente sous forme de tableau Markdown : | Point Clé | Émotion | Ancrage émotionnel |.
          TEXTE À MÉMORISER : ${input}`;
        }
        break;
      default:
        userQuery = input;
    }

    // Intégration de la base de connaissance sélectionnée
    if (activeDoc) {
      systemPrompt += `\nCONTEXTE PRIORITAIRE DE LA BASE DE CONNAISSANCES ("${activeDoc.title}") : "${activeDoc.content}"`;
    }
    
    if (referenceText.trim()) {
      systemPrompt += `\n\nMATÉRIAU SOURCE / TEXTE DE RÉFÉRENCE FOURNI :\n"""\n${referenceText}\n"""\nINSTRUCTION : Prends impérativement en compte ce texte.`;
    }
    
    callGemini(userQuery, systemPrompt);
  };

  // Moteur de rendu intelligent (Tableaux + Typographie)
  const formatResult = (text) => {
    if (!text) return <p className="italic text-slate-500">Aucun contenu généré.</p>;
    
    try {
      let cleanText = text.replace(/```[a-zA-Z]*\n/g, '').replace(/```/g, '');
      const lines = cleanText.split('\n');
      
      const processInline = (str) => {
        if (!str) return '';
        let cleanStr = str.replace(/\*\*\*/g, '').replace(/__/g, '').replace(/`/g, '');
        const parts = cleanStr.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
          }
          return part;
        });
      };

      const renderTable = (rows, keyIndex) => {
        if (!rows || rows.length < 1) return null;
        const headers = rows[0];
        const bodyRows = rows.slice(1);

        return (
          <div key={`table-${keyIndex}`} className="my-8 overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
            <table className="w-full text-left border-collapse sans-text text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {headers.map((h, idx) => (
                    <th key={idx} className="p-4 font-black uppercase text-[10px] tracking-widest text-slate-400 border-b border-slate-200">{processInline(h)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bodyRows.length > 0 ? bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-blue-50/30 transition-colors">
                    {headers.map((_, cIdx) => {
                      const cell = row[cIdx] || '';
                      const urlMatch = typeof cell === 'string' ? cell.match(/https?:\/\/[^\s)]+/) : null;

                      return (
                        <td key={cIdx} className="p-4 text-slate-600 font-medium align-top leading-relaxed break-words min-w-[150px]">
                          {urlMatch ? (
                            <div className="flex flex-col gap-2 items-start">
                              <span>{processInline(cell.replace(/\[.*?\]\(.*?\)/, '').replace(urlMatch[0], ''))}</span>
                              <a href={urlMatch[0]} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#0058be] font-bold hover:underline bg-blue-50 px-3 py-1.5 rounded-lg text-xs">
                                Lien source <ExternalLink size={12} />
                              </a>
                            </div>
                          ) : processInline(cell)}
                        </td>
                      );
                    })}
                  </tr>
                )) : (
                   <tr><td colSpan={headers.length} className="p-4 text-center text-slate-400 italic">Aucune donnée</td></tr>
                )}
              </tbody>
            </table>
          </div>
        );
      };

      let inTable = false;
      let tableRows = [];
      const elements = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.includes('|')) {
          const isSeparator = line.replace(/[\s|:-]/g, '') === '';
          if (isSeparator) continue; 
          
          inTable = true;
          const parts = line.split('|');
          if (parts.length > 0 && parts[0].trim() === '') parts.shift();
          if (parts.length > 0 && parts[parts.length - 1].trim() === '') parts.pop();
          const cells = parts.map(c => c.trim());
          if (cells.length > 0) tableRows.push(cells);
        } else {
          if (inTable) {
            if (tableRows.length > 0) elements.push(renderTable(tableRows, i));
            tableRows = [];
            inTable = false;
          }

          if (line === '') {
            elements.push(<div key={i} className="h-4" />);
          } else if (line.startsWith('# ')) {
            elements.push(<h1 key={i} className="text-3xl font-medium text-slate-900 mb-6 mt-8 leading-tight italic serif-text border-b border-slate-100 pb-4">{processInline(line.replace('# ', ''))}</h1>);
          } else if (line.startsWith('## ')) {
            elements.push(<h2 key={i} className="text-xl font-bold text-[#0058be] mb-4 mt-8 border-l-2 border-[#0058be] pl-4 serif-text">{processInline(line.replace('## ', ''))}</h2>);
          } else if (line.startsWith('### ')) {
            elements.push(<h3 key={i} className="text-lg font-bold text-slate-800 mb-3 mt-6 serif-text">{processInline(line.replace('### ', ''))}</h3>);
          } else if (line.startsWith('- ') || line.startsWith('* ')) {
            elements.push(
              <div key={i} className="flex gap-4 mb-3 ml-2 serif-text">
                <span className="text-[#0058be] text-xl leading-none">•</span>
                <p className="text-slate-700 leading-relaxed text-lg">{processInline(line.replace(/^- |^\* /, ''))}</p>
              </div>
            );
          } else {
            elements.push(<p key={i} className="mb-4 text-slate-700 leading-relaxed text-lg serif-text">{processInline(line)}</p>);
          }
        }
      }
      
      if (inTable && tableRows.length > 0) {
        elements.push(renderTable(tableRows, 'end'));
      }
      
      if (elements.length === 0) {
         return <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans p-6 bg-slate-50 rounded-xl">{cleanText}</pre>;
      }
      
      return elements;
    } catch (err) {
      console.error("Erreur de parsing:", err);
      return (
        <div className="space-y-4">
           <p className="text-red-500 font-bold">Le rendu visuel a rencontré une erreur. Voici le texte brut :</p>
           <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans p-6 bg-slate-50 rounded-xl">{text}</pre>
        </div>
      );
    }
  };

  const copyToClipboard = () => {
    const textArea = document.createElement("textarea");
    textArea.value = result;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie dans le presse-papiers', err);
    }
    document.body.removeChild(textArea);
  };

  return (
    <div className="min-h-screen bg-[#f6fafe] font-sans text-[#171c1f] flex flex-col antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&display=swap');
        .serif-text { font-family: 'Newsreader', serif; }
        .sans-text { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Barre Supérieure */}
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

      {/* Content */}
      <main className={`pt-20 px-6 mx-auto w-full transition-all duration-500 pb-40 ${showResult ? 'max-w-5xl' : 'max-w-xl md:max-w-3xl'}`}>
        
        {/* --- DASHBOARD --- */}
        {!showResult && activeTab === 'home' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="mt-6 mb-12">
              <p className="text-[10px] font-black text-[#0058be] uppercase tracking-[0.3em] mb-3">Tableau de bord</p>
              <h2 className="serif-text text-4xl font-light text-[#091426] leading-tight">Bonjour,<br/><span className="font-semibold italic text-[#0058be] leading-relaxed">{context.city}</span></h2>
              <p className="text-slate-500 text-sm mt-4 italic font-medium">Choisissez votre angle de rédaction :</p>
            </section>

            <section className="grid grid-cols-2 lg:grid-cols-3 gap-5">
              {modules.map((m) => (
                <button 
                  key={m.id} 
                  onClick={() => setActiveTab(m.id)} 
                  className="flex flex-col items-start p-6 bg-white rounded-3xl transition-all active:scale-95 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-50 text-left group hover:border-blue-100 hover:shadow-xl aspect-square md:aspect-auto"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-blue-50 transition-colors">
                    <span className="text-[#091426] group-hover:text-[#0058be]">{m.icon}</span>
                  </div>
                  <span className="font-bold text-[#091426] text-sm tracking-tight leading-none">{m.label}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase mt-2 leading-tight">{m.sub}</span>
                </button>
              ))}
            </section>
          </div>
        )}

        {/* --- FORMULAIRE --- */}
        {!showResult && activeTab !== 'home' && activeTab !== 'docs' && (
          <div className="animate-in fade-in slide-in-from-right-10 duration-500">
            <header className="mb-10 flex justify-between items-end">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] font-black text-[#0058be] mb-2">Rédaction Stratégique</p>
                <h2 className="serif-text text-4xl font-light text-[#091426] italic leading-tight">
                  {modules.find(m => m.id === activeTab)?.label || 'Module'}
                </h2>
              </div>
              
              {/* Sélecteur de contexte (Base de connaissances) */}
              {activeTab !== 'memoriser' && docs.length > 0 && (
                <div className="hidden sm:block">
                  <select 
                    value={selectedDocId || ''} 
                    onChange={e => setSelectedDocId(e.target.value)}
                    className="bg-white border border-slate-100 text-slate-600 text-xs font-bold rounded-xl px-4 py-2 shadow-sm focus:ring-[#0058be] focus:border-[#0058be]"
                  >
                    <option value="">Aucun document lié</option>
                    {docs.map(d => (
                      <option key={d.id} value={d.id}>📘 {d.title}</option>
                    ))}
                  </select>
                </div>
              )}
            </header>

            <section className="space-y-8">
              <div className="bg-[#f0f4f8] rounded-[2.5rem] p-8 space-y-6 animate-in fade-in slide-in-from-top-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeTab === 'discours' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase px-1">Durée cible</label>
                        <div className="relative">
                          <input className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm" placeholder="e.g., 5 min" value={details.duree} onChange={e => setDetails({...details, duree: e.target.value})} />
                          <Clock className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-200" size={16} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase px-1">Auditoire</label>
                        <div className="relative">
                          <input className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm" placeholder="e.g., Commerçants" value={details.cible} onChange={e => setDetails({...details, cible: e.target.value})} />
                          <Users className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-200" size={16} />
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === 'social' && (
                    <div className="md:col-span-2 space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase px-1 text-center block">Plateforme</label>
                      <div className="flex gap-2">
                        {['LinkedIn', 'X', 'Facebook', 'Instagram'].map(plat => (
                          <button key={plat} onClick={() => setDetails({...details, plateforme: plat})} className={`flex-1 flex flex-col items-center p-4 rounded-2xl border transition-all ${details.plateforme === plat ? 'bg-[#091426] text-white shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'}`}>
                            {plat === 'LinkedIn' && <Linkedin size={20} />}
                            {plat === 'X' && <Twitter size={20} />}
                            {plat === 'Facebook' && <Facebook size={20} />}
                            {plat === 'Instagram' && <Instagram size={20} />}
                            <span className="text-[9px] font-black uppercase mt-2">{plat}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'memoriser' && (
                    <div className="md:col-span-2 space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase px-1 text-center block">Technique d'ancrage (Inspirée de votre livre)</label>
                      <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                        {[
                          { id: 'crochets', label: 'Crochets visuels', icon: <ListOrdered size={20} /> },
                          { id: 'corps', label: 'Loci Corporel', icon: <User size={20} /> },
                          { id: 'balises', label: 'Balises Émotionnelles', icon: <Target size={20} /> }
                        ].map(tech => (
                          <button key={tech.id} onClick={() => setDetails({...details, methodeMemo: tech.id})} className={`flex-1 flex flex-col items-center p-4 rounded-2xl border transition-all ${details.methodeMemo === tech.id ? 'bg-[#091426] text-white shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'}`}>
                            {tech.icon}
                            <span className="text-[9px] font-black uppercase mt-2 text-center">{tech.label}</span>
                          </button>
                        ))}
                      </div>
                      
                      {/* Textes Pédagogiques pour guider l'utilisateur */}
                      <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 mt-2">
                        <div className="flex gap-3 items-start">
                          <Info size={16} className="text-[#0058be] mt-0.5 shrink-0" />
                          <p className="text-sm text-slate-600 font-medium leading-relaxed">
                            {details.methodeMemo === 'crochets' && "Associez chaque idée à une image numérotée (1 = Pinceau, 2 = Cygne...). Idéal pour mémoriser la trame d'une argumentation ou d'un discours dans un ordre précis."}
                            {details.methodeMemo === 'corps' && "Utilisez votre corps comme « palais de la mémoire ». Accrochez chaque idée forte sur une partie de votre anatomie (tête, épaules...) pour la retrouver instinctivement à la tribune."}
                            {details.methodeMemo === 'balises' && "Notre cerveau retient mieux ce qui le touche. Cette méthode repère les moments clés de votre discours et crée un ancrage émotionnel fort pour chacun d'eux."}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {(activeTab === 'argumentaire' || activeTab === 'mail') && (
                    <div className="md:col-span-1 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase px-1">Interlocuteur</label>
                      <input className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-[#0058be]/20" placeholder="Nom ou Qualité" value={details.interlocuteur} onChange={e => setDetails({...details, interlocuteur: e.target.value})} />
                    </div>
                  )}

                  {(activeTab !== 'social' && activeTab !== 'memoriser') && (
                    <div className="md:col-span-1 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase px-1">Objectif & Ton</label>
                      <input className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-[#0058be]/20 placeholder:text-slate-300" placeholder="e.g., Convaincre, Mobiliser..." value={details.objectif} onChange={e => setDetails({...details, objectif: e.target.value})} />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {activeTab === 'memoriser' ? <Brain size={18} className="text-[#0058be]" /> : <FileText size={18} className="text-[#0058be]" />}
                  <h3 className="text-xs font-black text-[#091426] uppercase tracking-widest">{activeTab === 'memoriser' ? 'Texte ou Discours à retenir' : 'Contenu de fond'}</h3>
                </div>
                <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_60px_rgba(9,20,38,0.05)] border border-slate-50 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-2 h-full bg-blue-50 group-focus-within:bg-[#0058be] transition-colors"></div>
                  <textarea 
                    className="w-full bg-transparent border-none p-0 focus:ring-0 text-xl serif-text italic font-medium leading-relaxed resize-none text-[#091426] min-h-[350px]" 
                    placeholder={activeTab === 'memoriser' ? "Collez ici le texte intégral du discours ou de l'argumentaire que vous souhaitez mémoriser..." : "Quels sont les faits ou le message principal ?"}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                  <div className="pt-8 border-t border-slate-50 flex justify-between items-center opacity-40">
                    <div className="flex gap-4"><Type size={16}/><BookOpen size={16}/><TableIcon size={16}/></div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">Argumentis Engine v2.8</span>
                  </div>
                </div>
              </div>

              {/* Texte de référence optionnel */}
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
                     <div className="flex items-center gap-3 mb-4">
                        <BookOpen size={18} className="text-[#0058be]" />
                        <h3 className="text-xs font-black text-[#091426] uppercase tracking-widest">Matériau Source</h3>
                     </div>
                     <textarea 
                        className="w-full bg-transparent border-none p-0 focus:ring-0 text-base sans-text font-medium leading-relaxed resize-y text-slate-700 min-h-[120px] placeholder:text-slate-400" 
                        placeholder="Collez ici un discours précédent pour en imiter le style, des notes de cadrage, ou un document brut pour donner du contexte précis à l'IA..."
                        value={referenceText}
                        onChange={(e) => setReferenceText(e.target.value)}
                     />
                  </div>
                )}
              </div>
            </section>

            <div className="mt-12 mb-20">
              <button 
                onClick={handleGenerate}
                disabled={loading || !input}
                className="w-full bg-gradient-to-r from-[#0058be] to-[#2170e4] text-white rounded-full py-5 px-8 flex items-center justify-center gap-4 shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                <span className="font-black tracking-widest uppercase text-sm">Lancer l'assistant IA</span>
              </button>
            </div>
          </div>
        )}

        {/* --- RÉSULTAT (RENDU PAPIER / TABLEAU) --- */}
        {showResult && (
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-700 pb-20">
            <section className="bg-[#091426] rounded-[2.5rem] p-10 mb-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#0058be] opacity-10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                  <span className="bg-blue-500/20 text-blue-200 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase sans-text border border-white/5">
                    {activeTab === 'presse' ? 'Radar Stratégique' : activeTab === 'argumentaire' ? 'Aide à la Décision' : 'Projet Validé'}
                  </span>
                  <div className="flex gap-3">
                    <button onClick={() => setShowRaw(!showRaw)} className="flex items-center gap-2 px-5 py-3 rounded-full transition-all duration-300 active:scale-95 bg-white/10 text-white hover:bg-white/20 border border-white/5 shadow-lg">
                      <Code size={18} />
                      <span className="text-[11px] font-black uppercase tracking-wider hidden sm:inline">{showRaw ? 'Vue Design' : 'Vue Brut'}</span>
                    </button>
                    <button onClick={copyToClipboard} className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-300 active:scale-95 ${copySuccess ? 'bg-green-500 text-white shadow-lg' : 'bg-white text-[#091426] hover:bg-slate-100 shadow-xl'}`}>
                      {copySuccess ? <Check size={18} /> : <Copy size={18} />}
                      <span className="text-[11px] font-black uppercase tracking-wider">{copySuccess ? 'Copié' : 'Copier'}</span>
                    </button>
                  </div>
                </div>
                <h1 className="text-3xl font-light text-white serif-text italic leading-tight max-w-2xl">
                  {activeTab === 'discours' && 'Projet d\'Allocution'}
                  {activeTab === 'argumentaire' && 'Note de Présentation Factuelle'}
                  {activeTab === 'langage' && 'Fiche d\'Éléments de Langage'}
                  {activeTab === 'mail' && 'Projet de Correspondance'}
                  {activeTab === 'social' && `Publication ${details.plateforme}`}
                  {activeTab === 'memoriser' && `Outil d'Ancrage & Mémorisation`}
                </h1>
              </div>
            </section>

            <article className="bg-white rounded-[2.5rem] p-10 md:p-24 shadow-[0_40px_100px_rgba(9,20,38,0.08)] min-h-[800px] relative mb-12 overflow-hidden">
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>
              
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

        {/* --- DOCS (BASE DE SAVOIR FIREBASE) --- */}
        {!showResult && activeTab === 'docs' && (
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
        )}
      </main>

      {/* Nav Basse */}
      {!showResult && (
        <nav className="fixed bottom-0 left-0 w-full z-[100] flex justify-around items-center px-4 pb-8 pt-4 bg-white/90 backdrop-blur-xl rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border-t border-slate-50">
          <button onClick={() => { setActiveTab('home'); setInput(''); setReferenceText(''); setShowRef(false); }} className={`flex flex-col items-center p-4 rounded-2xl transition-all ${activeTab === 'home' ? 'bg-[#091426] text-white shadow-xl shadow-black/20' : 'text-slate-300 hover:text-slate-900'}`}>
            <Home size={22} />
            <span className="text-[9px] uppercase tracking-widest mt-2 font-black">Accueil</span>
          </button>
          
          <button 
            onClick={() => { if(activeTab === 'home' || activeTab === 'docs') setActiveTab('discours'); }} 
            className={`flex flex-col items-center p-4 rounded-2xl transition-all ${activeTab !== 'home' && activeTab !== 'docs' ? 'bg-[#091426] text-white shadow-xl shadow-black/20' : 'text-slate-300 hover:text-slate-900'}`}
          >
            <PenTool size={22} />
            <span className="text-[9px] uppercase tracking-widest mt-2 font-black">Écrire</span>
          </button>

          <button onClick={() => setActiveTab('docs')} className={`flex flex-col items-center p-4 rounded-2xl transition-all ${activeTab === 'docs' ? 'bg-[#091426] text-white shadow-xl shadow-black/20' : 'text-slate-300 hover:text-slate-900'}`}>
            <Folder size={22} />
            <span className="text-[9px] uppercase tracking-widest mt-2 font-black">Savoir</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default App;
