import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth'; 
import { collection, onSnapshot, addDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { 
  PenTool, Loader2, UserCircle, LogOut, Home, Folder, ArrowLeft 
} from 'lucide-react';

import { auth, db, APP_NAMESPACE } from './config/firebase';
import { KnowledgeBase } from './components/KnowledgeBase';
import { Onboarding } from './components/Onboarding';
import { Auth } from './components/Auth'; 
import { Dashboard } from './components/Dashboard';
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
  const [selectedDocId, setSelectedDocId] = useState('');
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', category: 'Référence', content: '' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, 'artifacts', APP_NAMESPACE, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().profile) {
            setProfile(docSnap.data().profile);
          } else {
             setProfile(null); 
          }
        } catch (err) {
          console.error("Erreur lors de la lecture du profil:", err);
        }
      } else {
         setProfile(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !profile) return;
    try {
      const docsRef = collection(db, 'artifacts', APP_NAMESPACE, 'users', user.uid, 'documents');
      const unsubscribe = onSnapshot(docsRef, (snapshot) => {
        const fetchedDocs = snapshot.docs.map(dItem => ({ id: dItem.id, ...dItem.data() }));
        fetchedDocs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setDocs(fetchedDocs);
        setSelectedDocId(prev => (fetchedDocs.length > 0 && !prev) ? fetchedDocs[0].id : prev);
      });
      return () => unsubscribe();
    } catch (err) {
      console.error("Erreur Firestore:", err);
    }
  }, [user, profile]);

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

  const handleRefFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("⚠️ Le fichier est trop volumineux (limite : 5 Mo).");
      return;
    }
    
    setIsReadingPdf(true);
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
      setReferenceText(prev => prev ? prev + "\n\n" + extractedText : extractedText);
    } catch (error) {
      alert("Erreur lors de la lecture du fichier.");
    } finally {
      setIsReadingPdf(false);
      e.target.value = null;
    }
  };

  const buildSystemPrompt = () => {
    const activeDoc = docs.find(d => d.id === selectedDocId);
    let systemPrompt = `Tu es Argumentis, la plume et l'assistant de rédaction expert de ${profile?.firstName || "l'utilisateur"}. `;
    
    if (profile?.role || profile?.city) {
      systemPrompt += `Il exerce la fonction de ${profile?.role || 'professionnel'} ${profile?.city ? `à ${profile?.city}` : ''}. `;
    }
    if (profile?.orientation) {
      systemPrompt += `Sa ligne directrice et sa sensibilité politique/associative sont : ${profile.orientation}. `;
    }

    systemPrompt += `\nDIRECTIVES STRICTES DE PERSONNIFICATION :
- Tu dois IMPÉRATIVEMENT adapter le fond (priorités thématiques, arguments) et la forme (ton, champ lexical) pour qu'ils reflètent exactement son rôle et son bord politique ou idéologique. 
- Incarne cette nuance : un élu de gauche, un maire de droite, ou un dirigeant d'association s'expriment différemment et ne défendent pas les mêmes piliers stratégiques. Tes propositions doivent être calibrées sur MESURE.
- Le ton doit être institutionnel, élégant mais accessible et tourné vers l'action.
- Évite le jargon complexe.`;

    if (activeDoc) systemPrompt += `\nCONTEXTE PRIORITAIRE ("${activeDoc.title}") : "${activeDoc.content}"`;
    if (referenceText) systemPrompt += `\n\nMATÉRIAU SOURCE :\n"""\n${referenceText}\n"""\nINSTRUCTION : Prends impérativement en compte ce texte.`;
    
    return systemPrompt;
  };

  const callGemini = async (historyParams, systemInstruction) => {
    setLoading(true);
    try {
      const response = await fetch('/api/gemini', {        
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          historyParams,
          systemInstruction
        })
      });
      
      if (!response.ok) throw new Error(`Erreur serveur (${response.status})`);
      
      const data = await response.json();
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Erreur...";
      const cleanText = text.replace(/^```[a-z]*\n/g, '').replace(/\n```$/g, '');
      
      setResult(cleanText);
      setChatHistory([...historyParams, { role: "model", parts: [{ text: cleanText }] }]);
    } catch (error) {
      setResult(`⚠️ Erreur : ${error.message}\nL'API interne n'a pas pu répondre.`);
    }
    setShowResult(true);
    setLoading(false);
  };

  const handleGenerate = () => {
    const systemPrompt = buildSystemPrompt();
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

    const initialHistory = [{ role: "user", parts: [{ text: userQuery }] }];
    setChatHistory(initialHistory);
    callGemini(initialHistory, systemPrompt);
  };

  const handleRefine = () => {
    if (!refineInput.trim()) return;
    const systemPrompt = buildSystemPrompt();
    const newUserMessage = { 
      role: "user", 
      parts: [{ text: `CONSIGNE D'AFFINAGE : ${refineInput}. Réponds uniquement avec la nouvelle version du texte mis à jour, prêt à l'emploi, sans blabla d'introduction.` }] 
    };
    
    const newHistory = [...chatHistory, newUserMessage];
    setRefineInput('');
    callGemini(newHistory, systemPrompt);
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

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erreur lors de la déconnexion", error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#e6eef6] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#0058be]" size={40} />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (user && (!profile || isEditingProfile)) {
    return (
      <Onboarding 
        user={user} 
        initialData={profile}
        onComplete={(data) => {
          setProfile(data);
          setIsEditingProfile(false);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#e6eef6] font-sans text-[#171c1f] flex flex-col antialiased relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&display=swap');
        .serif-text { font-family: 'Newsreader', serif; }
        .sans-text { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full z-[100] flex justify-between items-center px-6 h-16 bg-white/80 backdrop-blur-lg border-b border-slate-100">
        <div className="flex items-center gap-3">
          {(showResult || (activeTab !== 'home' && activeTab !== 'docs')) ? (
            <button onClick={() => { 
              setShowResult(false); 
              if(activeTab !== 'docs' && activeTab !== 'home') {
                setActiveTab('home');
                setChatHistory([]);
              } 
            }} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-all">
              <ArrowLeft size={20} className="text-slate-900" />
            </button>
          ) : (
            <img src="https://i.postimg.cc/k4v89QJf/logo_192.png" alt="Argumentis" className="w-8 h-8 rounded-lg shadow-sm object-cover bg-white" />
          )}
          <h1 className="text-xl font-black tracking-tighter text-slate-900 uppercase sans-text">Argumentis</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => setIsEditingProfile(true)}
            title="Modifier mon profil"
          >
            <div className="hidden lg:flex flex-col items-end border-r border-slate-100 pr-4 text-right">
               <span className="text-[10px] font-black text-[#0058be] uppercase">{profile?.city || 'Espace Privé'}</span>
               <span className="text-[11px] font-bold text-slate-700 truncate max-w-[12rem]">{profile?.role || 'Utilisateur'}</span>
            </div>
            <UserCircle size={28} className="text-[#0058be]" />
          </div>
          
          <button onClick={handleSignOut} className="text-slate-400 hover:text-red-500 transition-colors ml-2" title="Se déconnecter">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className={`pt-20 px-6 mx-auto w-full transition-all duration-500 pb-40 ${showResult ? 'max-w-5xl' : 'max-w-xl md:max-w-3xl'}`}>
        
        {!showResult && activeTab === 'home' && (
          <Dashboard profile={profile} setActiveTab={setActiveTab} setChatHistory={setChatHistory} setShowLegal={setShowLegal} />
        )}

        {!showResult && activeTab !== 'home' && activeTab !== 'docs' && (
          <GenerationForm
            activeTab={activeTab}
            docs={docs}
            selectedDocId={selectedDocId}
            setSelectedDocId={setSelectedDocId}
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
          <button onClick={() => { setActiveTab('home'); setInput(''); setChatHistory([]); }} className={`p-4 rounded-2xl flex flex-col items-center ${activeTab === 'home' ? 'bg-[#091426] text-white' : 'text-slate-400'}`}><Home size={22} /></button>
          <button onClick={() => { setActiveTab('discours'); setChatHistory([]); }} className={`p-4 rounded-2xl flex flex-col items-center ${activeTab !== 'home' && activeTab !== 'docs' ? 'bg-[#091426] text-white' : 'text-slate-400'}`}><PenTool size={22} /></button>
          <button onClick={() => { setActiveTab('docs'); setChatHistory([]); }} className={`p-4 rounded-2xl flex flex-col items-center ${activeTab === 'docs' ? 'bg-[#091426] text-white' : 'text-slate-400'}`}><Folder size={22} /></button>
        </nav>
      )}

      {/* MODALE MENTIONS LÉGALES */}
      {showLegal && (
        <div className="fixed inset-0 z-[200] bg-[#091426]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-[#091426] mb-6 serif-text">Mentions Légales</h2>
            <div className="space-y-4 text-sm text-slate-600 h-64 overflow-y-auto pr-2">
              <p><strong>Éditeur de l'application :</strong> Argumentis</p>
              <p><strong>Hébergement :</strong> Firebase (Google LLC), hébergé en Europe.</p>
              <p><strong>Propriété intellectuelle :</strong> Le contenu généré et la structure de l'application sont protégés par les lois en vigueur sur la propriété intellectuelle.</p>
              <p><strong>Confidentialité &amp; RGPD :</strong> Vos données de profil et vos documents sont stockés de manière sécurisée et chiffrée. Ils ne sont utilisés que pour la génération de vos textes par l'IA et ne sont pas partagés à des tiers à des fins commerciales. Vous disposez d'un droit d'accès, de modification et de suppression de vos données directement depuis votre espace profil.</p>
            </div>
            <button onClick={() => setShowLegal(false)} className="mt-8 w-full bg-[#0058be] text-white font-bold py-4 rounded-2xl hover:bg-blue-800 transition-colors">
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;