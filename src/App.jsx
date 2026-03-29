import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth'; 
import { collection, onSnapshot, addDoc, deleteDoc, doc as firestoreDoc, getDoc } from 'firebase/firestore';
import { Home, Folder, ArrowLeft, UserCircle, LogOut, Loader2 } from 'lucide-react';

import { auth, db, APP_NAMESPACE } from './config/firebase';
import { KnowledgeBase } from './components/KnowledgeBase';
import { Onboarding } from './components/Onboarding';
import { Auth } from './components/Auth'; 
import { Dashboard } from './components/Dashboard';
import { Generator } from './components/Generator';

const App = () => {
  const [activeTab, setActiveTab] = useState('home'); 
  const [showLegal, setShowLegal] = useState(false);
  
  const [sessionUser, setSessionUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false); 

  const [docs, setDocs] = useState([]);
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', category: 'Référence', content: '' });

  // Auth & Profile Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setSessionUser(currentUser);
      if (currentUser) {
        try {
          const profileRef = firestoreDoc(db, 'artifacts', APP_NAMESPACE, 'users', currentUser.uid);
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists() && profileSnap.data().profile) {
            setProfile(profileSnap.data().profile);
          } else {
             setProfile(null); 
          }
        } catch (err) { console.error(err); }
      } else {
         setProfile(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Documents Listener
  useEffect(() => {
    if (!sessionUser || !profile) return;
    const docsCollection = collection(db, 'artifacts', APP_NAMESPACE, 'users', sessionUser.uid, 'documents');
    const unsub = onSnapshot(docsCollection, (snapshot) => {
      const fetched = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
      setDocs(fetched.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    });
    return () => unsub();
  }, [sessionUser, profile]);

  const handleSignOut = () => signOut(auth);

  if (authLoading) return <div className="min-h-screen bg-[#e6eef6] flex justify-center items-center"><Loader2 className="animate-spin text-[#0058be]" size={40} /></div>;
  if (!sessionUser) return <Auth />;
  if (sessionUser && (!profile || isEditingProfile)) return <Onboarding user={sessionUser} initialData={profile} onComplete={(data) => { setProfile(data); setIsEditingProfile(false); }} />;

  return (
    <div className="min-h-screen bg-[#e6eef6] font-sans text-[#171c1f] flex flex-col relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&display=swap');
        .serif-text { font-family: 'Newsreader', serif; }
        .sans-text { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full z-[100] flex justify-between items-center px-6 h-16 bg-white/80 backdrop-blur-lg border-b border-slate-100">
        <div className="flex items-center gap-3">
          {activeTab !== 'home' ? (
            <button onClick={() => setActiveTab('home')} className="p-2 -ml-2 hover:bg-slate-100 rounded-full">
              <ArrowLeft size={20} className="text-slate-900" />
            </button>
          ) : (
            <img src="https://i.postimg.cc/k4v89QJf/logo_192.png" alt="Argumentis" className="w-8 h-8 rounded-lg shadow-sm" />
          )}
          <h1 className="text-xl font-black tracking-tighter text-slate-900 uppercase">Argumentis</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div onClick={() => setIsEditingProfile(true)} className="flex items-center gap-3 cursor-pointer hover:opacity-80">
            <div className="hidden lg:flex flex-col items-end border-r pr-4 text-right">
               <span className="text-[10px] font-black text-[#0058be] uppercase">{profile?.city || 'Espace Privé'}</span>
               <span className="text-[11px] font-bold text-slate-700">{profile?.role || 'Utilisateur'}</span>
            </div>
            <UserCircle size={28} className="text-[#0058be]" />
          </div>
          <button onClick={handleSignOut} className="text-slate-400 hover:text-red-500 ml-2"><LogOut size={20} /></button>
        </div>
      </header>

      {/* MAIN */}
      <main className="pt-20 px-6 mx-auto w-full max-w-3xl pb-40">
        {activeTab === 'home' && <Dashboard profile={profile} setActiveTab={setActiveTab} setShowLegal={setShowLegal} />}
        
        {activeTab === 'docs' && (
          <KnowledgeBase docs={docs} isAddingDoc={isAddingDoc} setIsAddingDoc={setIsAddingDoc} newDoc={newDoc} setNewDoc={setNewDoc} 
            handleSaveDoc={async () => {
              if(!newDoc.title) return;
              await addDoc(collection(db, 'artifacts', APP_NAMESPACE, 'users', sessionUser.uid, 'documents'), { ...newDoc, createdAt: Date.now() });
              setIsAddingDoc(false); setNewDoc({ title: '', category: 'Référence', content: '' });
            }} 
            handleDeleteDoc={(id) => deleteDoc(firestoreDoc(db, 'artifacts', APP_NAMESPACE, 'users', sessionUser.uid, 'documents', id))} 
          />
        )}
        
        {activeTab !== 'home' && activeTab !== 'docs' && <Generator activeTab={activeTab} profile={profile} docs={docs} />}
      </main>

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around p-4 bg-white/90 backdrop-blur-xl rounded-t-[3rem] shadow-lg border-t border-slate-50 z-[100]">
        <button onClick={() => setActiveTab('home')} className={`p-4 rounded-2xl ${activeTab === 'home' ? 'bg-[#091426] text-white' : 'text-slate-400'}`}><Home size={22} /></button>
        <button onClick={() => setActiveTab('docs')} className={`p-4 rounded-2xl ${activeTab === 'docs' ? 'bg-[#091426] text-white' : 'text-slate-400'}`}><Folder size={22} /></button>
      </nav>

      {/* LEGAL MODAL */}
      {showLegal && (
        <div className="fixed inset-0 z-[200] bg-[#091426]/40 flex items-center justify-center p-4" onClick={() => setShowLegal(false)}>
          <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full" onClick={e=>e.stopPropagation()}>
            <h2 className="text-2xl font-black mb-6">Mentions Légales</h2>
            <div className="space-y-4 text-sm text-slate-600 h-64 overflow-y-auto pr-2">
              <p>Éditeur : Argumentis</p><p>Hébergement : Firebase (Europe)</p>
            </div>
            <button onClick={() => setShowLegal(false)} className="mt-8 w-full bg-[#0058be] text-white py-4 rounded-2xl">Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
