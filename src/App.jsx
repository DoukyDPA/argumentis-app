import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth'; 
import { collection, onSnapshot, addDoc, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  PenTool, Loader2, UserCircle, LogOut, Home, Folder, ArrowLeft 
} from 'lucide-react';

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

  const [details, setDetails] = useState({
    duree: '', cible: '', objectif: '', interlocuteur: '', plateforme: 'LinkedIn', methodeMemo: 'crochets',
  });

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false); 

  const [docs, setDocs] = useState([]);
  const [selectedDocIds, setSelectedDocIds] = useState([]); // Changé pour sélection multiple
  const [archives, setArchives] = useState([]); // Nouvel état pour les archives
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', category: 'Référence', content: '' });

  // 1. Initialisation : Utilisateur, Profil et Mémoire
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, 'artifacts', APP_NAMESPACE, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().profile) {
            setProfile(docSnap.data().profile);
          }

          const historyRef = doc(db, 'artifacts', APP_NAMESPACE, 'users', currentUser.uid, 'context', 'history');
          const historySnap = await getDoc(historyRef);
          if (historySnap.exists() && historySnap.data().messages) {
            setChatHistory(historySnap.data().messages);
          }
        } catch (err) {
          console.error("Erreur d'initialisation :", err);
        }
      } else {
         setProfile(null);
         setChatHistory([]);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Chargement de la Base de Savoir
  useEffect(() => {
    if (!user || !profile) return;
    const docsRef = collection(db, 'artifacts', APP_NAMESPACE, 'users', user.uid, 'documents');
    const unsubscribe = onSnapshot(docsRef, (snapshot) => {
      const fetchedDocs = snapshot.docs.map(dItem => ({ id: dItem.id, ...dItem.data() }));
      fetchedDocs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setDocs(fetchedDocs);
    });
    return () => unsubscribe();
  }, [user, profile]);

  // 3. Chargement des Archives (10 derniers textes)
  useEffect(() => {
    if (!user) return;
    const archivesRef = collection(db, 'artifacts', APP_NAMESPACE, 'users', user.uid, 'archives');
    const unsubscribe = onSnapshot(archivesRef, (snapshot) => {
      const fetchedArchives = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      fetchedArchives.sort((a, b) => b.createdAt - a.createdAt);
      setArchives(fetchedArchives.slice(0, 10));
    });
    return () => unsubscribe();
  }, [user]);

  const updateAndSaveHistory = async (newHistory) => {
    const limitedHistory = newHistory.slice(-10);
    setChatHistory(limitedHistory); 
    if (user) {
      try {
        await setDoc(doc(db, 'artifacts', APP_NAMESPACE, 'users', user.uid, 'context', 'history'), {
          messages: limitedHistory
        }, { merge: true });
      } catch (err) {
        console.error("Erreur sauvegarde mémoire :", err);
      }
    }
  };

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
    setSelectedDocIds(prev => prev.filter(id => id !== docId));
  };

  const handleRefFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsReadingPdf(true);
    try {
      let extractedText = '';
      if (file.type === 'application/pdf') extractedText = await extractTextFromPdf(file);
      else {
        extractedText = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target.result);
          reader.readAsText(file);
        });
      }
      setReferenceText(prev => prev ? prev + "\n\n" + extractedText : extractedText);
    } catch (error) {
      alert("Erreur de lecture.");
    } finally {
      setIsReadingPdf(false);
    }
  };

  // MODIFICATION : Intégration de la Base de Savoir ponctuelle
  const buildSystemPrompt = () => {
    const activeDocs = docs.filter(d => selectedDocIds.includes(d.id));
    let systemPrompt = `Tu es Argumentis, l'assistant de rédaction expert de ${profile?.firstName || "l'utilisateur"}. `;
    
    if (profile?.role || profile?.city) {
      systemPrompt += `Il est ${profile?.role || 'élu'} ${profile?.city ? `à ${profile?.city}` : ''}. `;
    }
    if (profile?.orientation) {
      systemPrompt += `Sensibilité : ${profile.orientation}. `;
    }

    if (activeDocs.length > 0) {
      systemPrompt += `\n\nCONNAISSANCES DE RÉFÉRENCE (BASE DE SAVOIR) :`;
      activeDocs.forEach(doc => {
        systemPrompt += `\n- ${doc.title} : ${doc.content}`;
      });
    }

    systemPrompt += `\n\nDIRECTIVES : Ton institutionnel, élégant, calibré sur le profil ci-dessus.`;
    if (referenceText) systemPrompt += `\n\nMATÉRIAU SOURCE :\n${referenceText}`;
    
    return systemPrompt;
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
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Erreur...";
      const cleanText = text.replace(/^```[a-z]*\n/g, '').replace(/\n```$/g, '');
      
      setResult(cleanText);
      updateAndSaveHistory([...historyParams, { role: "model", parts: [{ text: cleanText }] }]);

      // ARCHIVAGE : Sauvegarde du texte produit
      if (user) {
        await addDoc(collection(db, 'artifacts', APP_NAMESPACE, 'users', user.uid, 'archives'), {
          content: cleanText,
          type: activeTab,
          createdAt: Date.now()
        });
      }
    } catch (error) {
      setResult(`⚠️ Erreur : ${error.message}`);
    }
    setShowResult(true);
    setLoading(false);
  };

  const handleGenerate = () => {
    const systemPrompt = buildSystemPrompt();
    let userQuery = "";
    switch(activeTab) {
      case 'discours': userQuery = `DISCOURS (${details.duree}). PUBLIC: ${details.cible}. SUJET: ${input}`; break;
      case 'langage': userQuery = `ÉLÉMENTS DE LANGAGE. OBJECTIF: ${details.objectif}. SUJET: ${input}`; break;
      case 'argumentaire': userQuery = `NOTE DE SYNTHÈSE. INTERLOCUTEUR: ${details.interlocuteur}. SUJET: ${input}`; break;
      case 'mail': userQuery = `MAIL. DESTINATAIRE: ${details.interlocuteur}. SUJET: ${input}`; break;
      case 'social': userQuery = `POST ${details.plateforme}. TON: ${details.objectif}. SUJET: ${input}`; break;
      case 'memoriser': userQuery = `MÉMORISATION (${details.methodeMemo}). TEXTE: ${input}`; break;
      default: userQuery = input;
    }
    const newHistory = [...chatHistory, { role: "user", parts: [{ text: userQuery }] }];
    callGemini(newHistory, systemPrompt);
  };

  const handleRefine = () => {
    if (!refineInput.trim()) return;
    const systemPrompt = buildSystemPrompt();
    const newHistory = [...chatHistory, { role: "user", parts: [{ text: `AFFINER : ${refineInput}` }] }];
    setRefineInput('');
    callGemini(newHistory, systemPrompt);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSignOut = () => signOut(auth);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-[#e6eef6]"><Loader2 className="animate-spin text-[#0058be]" /></div>;
  if (!user) return <Auth />;
  if (user && (!profile || isEditingProfile)) return <Onboarding user={user} initialData={profile} onComplete={(data) => { setProfile(data); setIsEditingProfile(false); }} />;

  return (
    <div className="min-h-screen bg-[#e6eef6] font-sans flex flex-col antialiased relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&family=Newsreader:ital,wght@0,400;1,400&display=swap');
        .serif-text { font-family: 'Newsreader', serif; }
        .sans-text { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full z-[100] flex justify-between items-center px-6 h-16 bg-white/80 backdrop-blur-lg border-b border-slate-100">
        <div className="flex items-center gap-3">
          {(showResult || activeTab !== 'home') && (
            <button onClick={() => { setShowResult(false); if(activeTab !== 'docs') setActiveTab('home'); }} className="p-2 -ml-2 hover:bg-slate-100 rounded-full"><ArrowLeft size={20} /></button>
          )}
          <h1 className="text-xl font-black tracking-tighter text-slate-900 uppercase">Argumentis</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex flex-col items-end text-right mr-2" onClick={() => setIsEditingProfile(true)}>
             <span className="text-[10px] font-black text-[#0058be] uppercase">{profile?.city}</span>
             <span className="text-[11px] font-bold text-slate-700">{profile?.role}</span>
          </div>
          <UserCircle size={28} className="text-[#0058be] cursor-pointer" onClick={() => setIsEditingProfile(true)} />
          <button onClick={handleSignOut} className="text-slate-400 hover:text-red-500"><LogOut size={20} /></button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className={`pt-20 px-6 mx-auto w-full transition-all duration-500 pb-40 ${showResult ? 'max-w-5xl' : 'max-w-3xl'}`}>
        
        {!showResult && activeTab === 'home' && (
          <Dashboard 
            profile={profile} 
            setActiveTab={setActiveTab} 
            setChatHistory={setChatHistory} 
            setShowLegal={setShowLegal}
            archives={archives} // Injection des archives
            setResult={setResult}
            setShowResult={setShowResult}
          />
        )}

        {!showResult && activeTab !== 'home' && activeTab !== 'docs' && (
          <GenerationForm
            activeTab={activeTab}
            docs={docs}
            selectedDocIds={selectedDocIds} // Changé pour multiple
            setSelectedDocIds={setSelectedDocIds}
            details={details}
            setDetails={setDetails}
            input={input}
            setInput={setInput}
            showRef={showRef}
            setShowRef={setShowRef}
            isReadingPdf={isReadingPdf}
            handleRefFileUpload={handleRefFileUpload}
            referenceText={referenceText}
            setReferenceText={setReferenceText}
            handleGenerate={handleGenerate}
            loading={loading}
          />
        )}

        {showResult && (
          <ResultView 
            showRaw={showRaw} setShowRaw={setShowRaw} copyToClipboard={copyToClipboard} copySuccess={copySuccess}
            result={result} profile={profile} refineInput={refineInput} setRefineInput={setRefineInput} handleRefine={handleRefine} loading={loading}
          />
        )}

        {!showResult && activeTab === 'docs' && (
          <KnowledgeBase docs={docs} isAddingDoc={isAddingDoc} setIsAddingDoc={setIsAddingDoc} newDoc={newDoc} setNewDoc={setNewDoc} handleSaveDoc={handleSaveDoc} handleDeleteDoc={handleDeleteDoc} />
        )}
      </main>

      {/* BOTTOM NAV */}
      {!showResult && (
        <nav className="fixed bottom-0 left-0 w-full flex justify-around p-4 bg-white/90 backdrop-blur-xl rounded-t-[3rem] shadow-lg border-t border-slate-50 z-[100]">
          <button onClick={() => setActiveTab('home')} className={`p-4 rounded-2xl ${activeTab === 'home' ? 'bg-[#091426] text-white' : 'text-slate-400'}`}><Home size={22} /></button>
          <button onClick={() => setActiveTab('discours')} className={`p-4 rounded-2xl ${activeTab !== 'home' && activeTab !== 'docs' ? 'bg-[#091426] text-white' : 'text-slate-400'}`}><PenTool size={22} /></button>
          <button onClick={() => setActiveTab('docs')} className={`p-4 rounded-2xl ${activeTab === 'docs' ? 'bg-[#091426] text-white' : 'text-slate-400'}`}><Folder size={22} /></button>
        </nav>
      )}

      {/* MODALE LÉGALE (Optionnelle, peut rester telle quelle) */}
      {showLegal && (
        <div className="fixed inset-0 z-[200] bg-[#091426]/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full">
            <h2 className="text-2xl font-black mb-4">Mentions Légales</h2>
            <p className="text-sm text-slate-600 mb-8">Vos données sont stockées de manière sécurisée et ne sont utilisées que pour vos générations.</p>
            <button onClick={() => setShowLegal(false)} className="w-full bg-[#0058be] text-white py-4 rounded-2xl font-bold">Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
