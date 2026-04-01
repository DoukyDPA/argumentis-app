import React, { useState } from 'react';
// On importe l'icône Key (clé) en plus des autres
import { Mail, Lock, Key, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

export const Auth = ({ onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Nouvelle variable pour stocker le code tapé par l'utilisateur
  const [accessCode, setAccessCode] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // --- SÉCURITÉ : VÉRIFICATION DU CODE PENDANT L'INSCRIPTION ---
    if (!isLogin && accessCode !== 'TEST2027') {
      setError("Code d'accès bêta invalide.");
      setLoading(false);
      return; // On arrête tout, le compte ne sera pas créé
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') setError("Identifiants incorrects.");
      else if (err.code === 'auth/email-already-in-use') setError("Cet e-mail est déjà utilisé.");
      else if (err.code === 'auth/weak-password') setError("Le mot de passe doit faire au moins 6 caractères.");
      else setError("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e6eef6] flex items-center justify-center p-6 relative">
      
      {/* Bouton pour revenir à la Landing Page */}
      {onBack && (
        <button 
          onClick={onBack} 
          className="absolute top-6 left-6 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#0058be] transition-colors bg-white px-4 py-2 rounded-full shadow-sm"
        >
          <ArrowLeft size={16} /> Retour à l'accueil
        </button>
      )}

      <div className="bg-white max-w-md w-full rounded-[2.5rem] p-10 shadow-xl border border-slate-50 text-center animate-in fade-in slide-in-from-bottom-8">
        <img 
          src="https://i.postimg.cc/k4v89QJf/logo_192.png" 
          alt="Argumentis Logo" 
          className="w-16 h-16 mx-auto mb-6 rounded-2xl shadow-sm object-cover bg-white" 
        />
        <h2 className="text-2xl font-black text-[#091426] mb-2 serif-text">
          {isLogin ? 'Connexion' : 'Créer un compte'}
        </h2>
        <p className="text-slate-500 text-sm mb-8">
          {isLogin ? "Accédez à votre assistant de rédaction stratégique." : "Saisissez le code d'accès pour rejoindre la bêta."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase px-1">Adresse E-mail</label>
            <div className="relative">
              <input 
                type="email" 
                required 
                className="w-full bg-[#f0f4f8] border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-[#0058be]/20" 
                placeholder="vous@exemple.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
              />
              <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase px-1">Mot de passe</label>
            <div className="relative">
              <input 
                type="password" 
                required 
                className="w-full bg-[#f0f4f8] border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-[#0058be]/20" 
                placeholder="••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />
              <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            </div>
          </div>

          {/* NOUVEAU : LE CHAMP CODE D'ACCÈS (Visible seulement pour l'inscription) */}
          {!isLogin && (
            <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
              <label className="text-[10px] font-black text-[#0058be] uppercase px-1">Code d'accès administrateur</label>
              <div className="relative">
                <input 
                  type="text" 
                  required={!isLogin} 
                  className="w-full bg-blue-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#0058be] shadow-inner focus:ring-2 focus:ring-[#0058be]/20" 
                  placeholder="Ex: TEST2027" 
                  value={accessCode} 
                  onChange={e => setAccessCode(e.target.value)} 
                />
                <Key className="absolute right-5 top-1/2 -translate-y-1/2 text-[#0058be]/50" size={18} />
              </div>
            </div>
          )}

          {error && <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-3 rounded-xl">{error}</p>}

          <button 
            type="submit" 
            // On désactive le bouton si l'email ou le mot de passe est vide, OU si on est en mode inscription et que le code est vide
            disabled={loading || !email || !password || (!isLogin && !accessCode)}
            className="w-full mt-4 bg-[#0058be] text-white rounded-2xl py-4 px-6 flex items-center justify-between shadow-xl disabled:opacity-50 transition-colors hover:bg-blue-800"
          >
            <span className="font-black uppercase text-sm">{isLogin ? 'Se connecter' : "S'inscrire"}</span>
            {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
          </button>
        </form>

        <button 
          onClick={() => { 
            setIsLogin(!isLogin); 
            setError(''); 
            setAccessCode(''); // On vide le code si on change de mode
          }}
          className="mt-8 text-xs font-bold text-slate-400 hover:text-[#0058be] transition-colors"
        >
          {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
        </button>
      </div>
    </div>
  );
};