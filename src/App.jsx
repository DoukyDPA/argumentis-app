import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth'; 
import { collection, onSnapshot, addDoc, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { PenTool, Loader2, UserCircle, LogOut, Home, Folder, ArrowLeft } from 'lucide-react';
import { auth, db, APP_NAMESPACE } from './config/firebase';
import { KnowledgeBase } from './components/KnowledgeBase';
import { Onboarding } from './components/Onboarding';
import { Auth } from './components/Auth'; 
import { Dashboard, modules } from './components/Dashboard';
import { ResultView } from './components/ResultView';
import { GenerationForm } from './components/GenerationForm';
import { extractTextFromPdf } from './utils/pdfHelper'; 

const App = () => {
  const [activeTab, setActiveTab] = useState('home'); 
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  const [input, setInput] = useState('');
  const [referenceText, setReferenceText] = useState('');
  const [showRef, setShowRef] = useState(false);
  const [isReadingPdf, setIsReadingPdf] = useState(false); 
  const [result, setResult] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [refineInput, setRefineInput] = useState('');
  const [details, setDetails] = useState({ duree: '', cible: '', objectif: '', interlocuteur: '', plateforme: 'LinkedIn', methodeMemo: 'crochets' });
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false); 
  const [docs, setDocs] = useState([]);
  const [selectedDocIds, setSelectedDocIds] = useState([]); // Multiple sélection
  const [archives, setArchives] = useState([]); // Les 10 archives
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', category: 'Référence', content: '' });

  // 1. BLOC AUTHENTIFICATION ET PROFIL
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        try {
          const docRef = doc(db, 'artifacts', APP_NAMESPACE, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().profile) {
            setProfile(docSnap.data().profile);
          } else {
            setProfile(null); 
          }
        } catch (err) {
          console.error("Erreur profil:", err);
        }
        
        try {
          const historyRef = doc(db, 'artifacts', APP_NAMESPACE, 'users', currentUser.uid, 'context', 'history');
          const historySnap = await getDoc(historyRef);
          if (historySnap.exists()) {
            setChatHistory(historySnap.data().messages || []);
          } else {
            setChatHistory([]);
          }
        } catch (err) {
          console.error("Erreur historique:", err);
        }

      } else {
        // 1. Déconnexion complète : on nettoie TOUTE l'interface
        setUser(null);
        setProfile(null);
        setChatHistory([]);
        setDocs([]);
        setArchives([]);
        setSelectedDocIds([]);
        setResult('');
        setActiveTab('home');
        
        // --- Vider les champs de saisie pour le prochain utilisateur ---
        setInput('');
        setReferenceText('');
        setRefineInput('');
        setShowRef(false);
        setShowResult(false);
        setDetails({ 
          duree: '', 
          cible: '', 
          objectif: '', 
          interlocuteur: '', 
          plateforme: 'LinkedIn', 
          methodeMemo: 'crochets' 
        });
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. BLOC D'AFFICHAGE DES DOCUMENTS ET ARCHIVES (Celui qui manquait)
  useEffect(() => {
    // Si personne n'est connecté, on vide l'affichage
    if (!user) {
      setDocs([]);
      setArchives([]);
      return;
    }

    // On écoute la base de savoir
    const docsRef = collection(db, 'artifacts', APP_NAMESPACE, 'users', user.uid, 'documents');
    const unsubDocs = onSnapshot(docsRef, (snap) => {
      setDocs(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.createdAt - a.createdAt));
    });

    // On écoute les 10 dernières archives
    const archRef = collection(db, 'artifacts', APP_NAMESPACE, 'users', user.uid, 'archives');
    const unsubArch = onSnapshot(archRef, (snap) => {
      setArchives(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.createdAt - a.createdAt).slice(0, 10));
    });

    return () => { 
      unsubDocs(); 
      unsubArch(); 
    };
  }, [user]);

  const buildSystemPrompt = () => {
    const activeDocs = docs.filter(d => selectedDocIds.includes(d.id));
    let prompt = `Tu es Argumentis, la plume de ${profile?.firstName || 'votre utilisateur'}. Il est ${profile?.role || 'élu'} à ${profile?.city || 'sa ville'}. Sa ligne : ${profile?.orientation || 'non définie'}.`;
    if (activeDocs.length > 0) {
      prompt += `\n\nCONTEXTE BASE DE SAVOIR :`;
      activeDocs.forEach(d => prompt += `\n- ${d.title} : ${d.content}`);
    }
    if (referenceText) prompt += `\n\nMATÉRIAU SOURCE EXTERNE :\n${referenceText}`;
    return prompt + `\n\nIncarne parfaitement son rôle avec un ton institutionnel et élégant.`;
  };

  const callGemini = async (historyParams, systemInstruction) => {
    setLoading(true);
    try {
      const response = await fetch('/api/gemini', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ historyParams, systemInstruction }) 
      });
      
      const data = await response.json();

      // Si le backend nous a renvoyé une erreur (400, 500...)
      if (!response.ok) {
        throw new Error(data.error || "Erreur de génération");
      }

      let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Erreur...";
      const cleanText = text.replace(/^```[a-z]*\n/g, '').replace(/\n```$/g, '');
      setResult(cleanText);
      
      const newHistory = [...historyParams, { role: "model", parts: [{ text: cleanText }] }];
      setChatHistory(newHistory.slice(-10));
      await setDoc(doc(db, 'artifacts', APP_NAMESPACE, 'users', user.uid, 'context', 'history'), { messages: newHistory.slice(-10) }, { merge: true });

      await addDoc(collection(db, 'artifacts', APP_NAMESPACE, 'users', user.uid, 'archives'), { content: cleanText, type: activeTab, createdAt: Date.now() });
    } catch (e) { 
      console.error(e);
      // L'erreur exacte s'affichera à l'écran
      setResult(`⚠️ Erreur : ${e.message}`); 
    }
    setShowResult(true); setLoading(false);
  };

  const handleDeleteArchive = async (archiveId) => {
    try {
      await deleteDoc(doc(db, 'artifacts', APP_NAMESPACE, 'users', user.uid, 'archives', archiveId));
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  // Fonction pour modifier le titre d'un document
  const handleUpdateDoc = async (id, updatedData) => {
    try {
      const docRef = doc(db, 'artifacts', APP_NAMESPACE, 'users', user.uid, 'documents', id);
      await setDoc(docRef, updatedData, { merge: true });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du document :", error);
      alert("Impossible de modifier le titre.");
    }
  };
  
  // Fonction pour sauvegarder un nouveau document
  const handleSaveDoc = async () => {
    try {
      await addDoc(collection(db, 'artifacts', APP_NAMESPACE, 'users', user.uid, 'documents'), { 
        ...newDoc, 
        createdAt: Date.now() 
      });
      setIsAddingDoc(false);
      setNewDoc({ title: '', category: 'Référence', content: '' });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error);
      alert("Erreur de sauvegarde : " + error.message);
    }
  };

  // Fonction pour supprimer un document de la base de savoir
  const handleDeleteDoc = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce document de votre base de savoir ?")) {
      try {
        await deleteDoc(doc(db, 'artifacts', APP_NAMESPACE, 'users', user.uid, 'documents', id));
      } catch (error) {
        console.error("Erreur lors de la suppression du document :", error);
        alert("Impossible de supprimer le document.");
      }
    }
  };
  
  const handleGenerate = () => {
    const systemPrompt = buildSystemPrompt();
    let userQuery = "";
    
    switch(activeTab) {
      case 'discours': 
        userQuery = `RÉDIGE UN DISCOURS PUBLIC. DURÉE : ${details.duree || '5 min'}. PUBLIC : ${details.cible}. OBJECTIF : ${details.objectif}. SUJET : ${input}.`; 
        break;
      case 'langage': 
        userQuery = `RÉDIGE UNE FICHE DE LANGAGE. Inclus : Miroir, Mots Totémiques. CONSIGNE : ${details.objectif}. SUJET : ${input}.`; 
        break;
      case 'argumentaire': 
        userQuery = `RÉDIGE UNE NOTE DE SYNTHÈSE FACTUELLE. INTERLOCUTEUR : ${details.interlocuteur}. FOND : ${input}.`; 
        break;
      case 'mail': 
        userQuery = `RÉDIGE UN COURRIEL PERSONNALISÉ. INTERLOCUTEUR : ${details.interlocuteur}. OBJECTIF : ${details.objectif}. CONTEXTE : ${input}.`; 
        break;
      case 'social': 
        userQuery = `RÉDIGE UNE PUBLICATION POUR ${details.plateforme}. TON : ${details.objectif}. SUJET : ${input}.`; 
        break;
      case 'memoriser':
        if (details.methodeMemo === 'corps') {
          userQuery = `Expert en mémorisation (méthode loci corporelle). Crée un tableau Markdown : | Partie du corps | Mot-clé | Élément clé | Image mentale |. TEXTE : ${input}`;
        } else if (details.methodeMemo === 'crochets') {
          userQuery = `Expert en mémorisation (crochets d'Hérigone 1=Pinceau...). Tableau Markdown : | N° & Crochet | Mot-clé | Élément clé | Image mentale |. TEXTE : ${input}`;
        } else {
          userQuery = `Expert en mémorisation. Crée un système de balises émotionnelles. Tableau Markdown : | Point Clé | Émotion | Ancrage émotionnel |. TEXTE : ${input}`;
        }
        break;
      default: 
        userQuery = input;
    }

    const newHistory = [...chatHistory, { role: "user", parts: [{ text: userQuery }] }];
    callGemini(newHistory, systemPrompt);
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-[#e6eef6]"><Loader2 className="animate-spin text-[#0058be]" /></div>;
  if (!user) return <Auth />;
  if (user && (!profile || isEditingProfile)) return <Onboarding user={user} initialData={profile} onComplete={(data) => { setProfile(data); setIsEditingProfile(false); }} />;

  return (
    <div className="min-h-screen bg-[#e6eef6] font-sans flex flex-col antialiased">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Newsreader:ital,wght@0,400;1,400&display=swap'); .serif-text { font-family: 'Newsreader', serif; } .sans-text { font-family: 'Inter', sans-serif; }`}</style>
      <header className="fixed top-0 left-0 w-full z-[100] flex justify-between items-center px-6 h-16 bg-white/80 backdrop-blur-lg border-b border-slate-100">
        <div className="flex items-center gap-3">
          {(showResult || activeTab !== 'home') && (
            <button onClick={() => { setShowResult(false); if(activeTab !== 'docs') setActiveTab('home'); }} className="p-2 -ml-2 hover:bg-slate-100 rounded-full">
              <ArrowLeft size={20} />
            </button>
          )}
          {/* AJOUT DE L'IMAGE DU LOGO ICI */}
          <img 
            src="https://i.postimg.cc/k4v89QJf/logo_192.png" 
            alt="Logo" 
            className="w-8 h-8 rounded-lg shadow-sm object-cover" 
          />
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Argumentis</h1>
        </div>
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setIsEditingProfile(true)}>
          <div className="hidden md:block text-right mr-1">
            <p className="text-[10px] font-black text-[#0058be] uppercase">{profile?.city}</p>
            <p className="text-[11px] font-bold text-slate-700 truncate max-w-[150px]">{profile?.role}</p>
          </div>
          <UserCircle size={28} className="text-[#0058be]" />
          <button onClick={() => signOut(auth)} className="text-slate-400 hover:text-red-500 transition-colors ml-2"><LogOut size={20} /></button>
        </div>
      </header>

      <main className={`pt-20 px-6 mx-auto w-full transition-all duration-500 pb-40 ${showResult ? 'max-w-5xl' : 'max-w-3xl'}`}>
        {/* 1. TABLEAU DE BORD */}
        {!showResult && activeTab === 'home' && (
          <Dashboard profile={profile} setActiveTab={setActiveTab} setChatHistory={setChatHistory} setShowLegal={setShowLegal} archives={archives} setResult={setResult} setShowResult={setShowResult} handleDeleteArchive={handleDeleteArchive} />
        )}

        {/* 2. FORMULAIRE DE GÉNÉRATION (Qui avait disparu !) */}
        {!showResult && activeTab !== 'home' && activeTab !== 'docs' && (
          <GenerationForm activeTab={activeTab} docs={docs} selectedDocIds={selectedDocIds} setSelectedDocIds={setSelectedDocIds} details={details} setDetails={setDetails} input={input} setInput={setInput} showRef={showRef} setShowRef={setShowRef} isReadingPdf={isReadingPdf} handleRefFileUpload={async (e) => { const file = e.target.files[0]; if(!file) return; setIsReadingPdf(true); try { const txt = file.type === 'application/pdf' ? await extractTextFromPdf(file) : await file.text(); setReferenceText(prev => prev ? prev + "\n" + txt : txt); } catch(e) { alert("Erreur de lecture."); } setIsReadingPdf(false); }} referenceText={referenceText} setReferenceText={setReferenceText} handleGenerate={handleGenerate} loading={loading} />
        )}

        {/* 3. AFFICHAGE DU RÉSULTAT */}
        {showResult && (
          <ResultView showRaw={showRaw} setShowRaw={setShowRaw} copyToClipboard={() => { navigator.clipboard.writeText(result); setCopySuccess(true); setTimeout(()=>setCopySuccess(false), 2000); }} copySuccess={copySuccess} result={result} profile={profile} refineInput={refineInput} setRefineInput={setRefineInput} handleRefine={() => { const sys = buildSystemPrompt(); callGemini([...chatHistory, { role: "user", parts: [{ text: `AFFINER : ${refineInput}` }] }], sys); setRefineInput(''); }} loading={loading} />
        )}

        {/* 4. BASE DE SAVOIR (Une seule fois, avec la mise à jour intégrée !) */}
        {!showResult && activeTab === 'docs' && (
          <KnowledgeBase 
            docs={docs} 
            isAddingDoc={isAddingDoc} 
            setIsAddingDoc={setIsAddingDoc} 
            newDoc={newDoc} 
            setNewDoc={setNewDoc} 
            handleSaveDoc={handleSaveDoc} 
            handleDeleteDoc={handleDeleteDoc}
            handleUpdateDoc={handleUpdateDoc} 
          />
        )}
      </main>

      {!showResult && (
        <nav className="fixed bottom-0 left-0 w-full flex justify-around p-4 bg-white/90 backdrop-blur-xl rounded-t-[3rem] border-t border-slate-50 z-[100]">
          <button onClick={() => setActiveTab('home')} className={`p-4 rounded-2xl ${activeTab === 'home' ? 'bg-[#091426] text-white' : 'text-slate-400'}`}><Home size={22} /></button>
          <button onClick={() => setActiveTab('discours')} className={`p-4 rounded-2xl ${activeTab !== 'home' && activeTab !== 'docs' ? 'bg-[#091426] text-white' : 'text-slate-400'}`}><PenTool size={22} /></button>
          <button onClick={() => setActiveTab('docs')} className={`p-4 rounded-2xl ${activeTab === 'docs' ? 'bg-[#091426] text-white' : 'text-slate-400'}`}><Folder size={22} /></button>
        </nav>
      )}
    </div>
  );
};

export default App;
