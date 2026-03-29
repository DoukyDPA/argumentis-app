import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, doc as fsDoc, getDoc } from 'firebase/firestore';
import { Home, Folder, ArrowLeft, UserCircle, LogOut, Loader2 } from 'lucide-react';

import { auth, db, APP_NAMESPACE } from './config/firebase';
import { KnowledgeBase } from './components/KnowledgeBase';
import { Onboarding } from './components/Onboarding';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { Generator } from './components/Generator';

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [sessionUser, setSessionUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [knowledgeDocs, setKnowledgeDocs] = useState([]);

  // Gestion de l'Auth
  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setSessionUser(u);
      if (u) {
        const snap = await getDoc(fsDoc(db, 'artifacts', APP_NAMESPACE, 'users', u.uid));
        if (snap.exists()) setUserProfile(snap.data().profile);
      }
      setAuthLoading(false);
    });
  }, []);

  // Sync Documents
  useEffect(() => {
    if (!sessionUser) return;
    return onSnapshot(collection(db, 'artifacts', APP_NAMESPACE, 'users', sessionUser.uid, 'documents'), (s) => {
      setKnowledgeDocs(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.createdAt - a.createdAt));
    });
  }, [sessionUser]);

  if (authLoading) return <div className="min-h-screen bg-[#e6eef6] flex items-center justify-center"><Loader2 className="animate-spin text-[#0058be]" size={40} /></div>;
  if (!sessionUser) return <Auth />;
  if (!userProfile || isEditing) return <Onboarding user={sessionUser} initialData={userProfile} onComplete={(p) => { setUserProfile(p); setIsEditing(false); }} />;

  return (
    <div className="min-h-screen bg-[#e6eef6] flex flex-col font-sans antialiased">
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-white/80 backdrop-blur-md border-b">
        <div className="flex items-center gap-3">
          {activeTab !== 'home' && <button onClick={() => setActiveTab('home')} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft size={20} /></button>}
          <h1 className="text-xl font-black uppercase tracking-tighter">Argumentis</h1>
        </div>
        <div className="flex items-center gap-4">
          <div onClick={() => setIsEditing(true)} className="cursor-pointer flex items-center gap-3">
            <div className="hidden md:block text-right text-[10px] font-bold">
              <p className="text-[#0058be] uppercase">{userProfile?.city}</p>
              <p className="text-slate-400">{userProfile?.role}</p>
            </div>
            <UserCircle size={28} className="text-[#0058be]" />
          </div>
          <button onClick={() => signOut(auth)} className="text-slate-300 hover:text-red-500"><LogOut size={20} /></button>
        </div>
      </header>

      <main className="pt-24 px-6 mx-auto w-full max-w-3xl pb-32">
        {activeTab === 'home' && <Dashboard profile={userProfile} onSelect={setActiveTab} />}
        {activeTab === 'docs' && <KnowledgeBase docs={knowledgeDocs} user={sessionUser} />}
        {!['home', 'docs'].includes(activeTab) && <Generator type={activeTab} profile={userProfile} docs={knowledgeDocs} />}
      </main>

      <nav className="fixed bottom-0 w-full flex justify-around p-4 bg-white/90 backdrop-blur-md border-t">
        <button onClick={() => setActiveTab('home')} className={`p-4 rounded-2xl ${activeTab === 'home' ? 'bg-[#091426] text-white' : 'text-slate-400'}`}><Home size={22} /></button>
        <button onClick={() => setActiveTab('docs')} className={`p-4 rounded-2xl ${activeTab === 'docs' ? 'bg-[#091426] text-white' : 'text-slate-400'}`}><Folder size={22} /></button>
      </nav>
    </div>
  );
};

export default App;
