import React from 'react';
import { ChevronRight, PenTool, BookOpen, ShieldCheck, Brain, Clock, Lock, FileText, CheckCircle2, MessageSquare } from 'lucide-react';

export const LandingPage = ({ onLoginClick }) => {
  return (
    <div className="min-h-screen bg-[#e6eef6] font-sans text-slate-800 selection:bg-blue-100">
      
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-slate-100 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://i.postimg.cc/k4v89QJf/logo_192.png" 
              alt="Argumentis Symbol" 
              className="w-8 h-8 rounded-lg shadow-sm"
            />
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Argumentis</h1>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#fonctionnement" className="hover:text-[#0058be] transition-colors">Comment ça marche ?</a>
            <a href="#cas-usage" className="hover:text-[#0058be] transition-colors">Cas d'usage</a>
            <a href="#securite" className="hover:text-[#0058be] transition-colors">Sécurité</a>
          </nav>
          <button onClick={onLoginClick} className="bg-[#0058be] text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-800 transition-colors shadow-md">
            Se connecter
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-6 md:pt-40 md:pb-28 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-blue-100 text-[#0058be] text-xs font-black uppercase tracking-widest mb-8 shadow-sm">
          <Brain size={16} />
          Un outil conçu par et pour les élus
        </div>
        <h1 className="text-4xl md:text-6xl font-light text-[#091426] mb-8 leading-tight serif-text">
          Votre plume stratégique,<br />
          <span className="font-bold italic text-[#0058be]">profilée pour votre territoire.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
          Argumentis est l'assistant de rédaction intuitif pour les décideurs publics. 
          Gagnez un temps précieux sur vos discours, notes de synthèse et publications, tout en gardant la maîtrise absolue de votre ligne politique.
        </p>
        
        {/* MODIFICATION ICI : Bouton Découvrir et lien S'inscrire */}
        <div className="flex flex-col items-center justify-center gap-4">
          <a href="#fonctionnement" className="w-full sm:w-auto bg-[#091426] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#0058be] transition-colors shadow-xl flex items-center justify-center gap-2">
            Découvrir l'outil <ChevronRight size={20} />
          </a>
          
          <div className="flex flex-col items-center gap-2 mt-2">
            <p className="text-sm text-slate-500 font-medium">✨ Aucune compétence technique requise.</p>
            <button 
              onClick={onLoginClick} 
              className="text-sm font-bold text-slate-400 hover:text-[#0058be] transition-colors underline decoration-slate-300 underline-offset-4"
            >
              Déjà convaincu ? S'inscrire ou se connecter
            </button>
          </div>
        </div>
      </section>

      {/* LES 4 ÉTAPES PÉDAGOGIQUES EN IMAGES */}
      <section id="fonctionnement" className="py-24 px-6 bg-white border-y border-slate-100 shadow-[0_4px_40px_rgba(0,0,0,0.03)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-black text-[#0058be] uppercase tracking-[0.3em] mb-3">Pédagogie</p>
            <h2 className="text-3xl md:text-4xl font-light text-[#091426] mb-4 serif-text">
              Comment ça marche en <span className="font-bold italic text-[#0058be]">4 étapes</span> ?
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Une méthode simple, étape par étape, pour transformer vos idées brutes en contenus institutionnels, tout en respectant l'ADN de votre mandat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white flex items-center justify-center hover:scale-105 transition-transform duration-300">
              <img src="https://i.postimg.cc/9QDHH2HX/Etape_1.png" alt="Étape 1 : Le Profilage" className="w-full h-auto object-contain" />
            </div>
            <div className="bg-white flex items-center justify-center hover:scale-105 transition-transform duration-300">
              <img src="https://i.postimg.cc/6p8xxKx9/Etape_2.png" alt="Étape 2 : La Base de Savoir" className="w-full h-auto object-contain" />
            </div>
            <div className="bg-white flex items-center justify-center hover:scale-105 transition-transform duration-300">
              <img src="https://i.postimg.cc/MpnJJwJp/Etape_3.png" alt="Étape 3 : La Génération" className="w-full h-auto object-contain" />
            </div>
            <div className="bg-white flex items-center justify-center hover:scale-105 transition-transform duration-300">
              <img src="https://i.postimg.cc/YCvBB7Bq/Etape_4.png" alt="Étape 4 : L'Affinage" className="w-full h-auto object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* CAS D'USAGE CONCRET */}
      <section id="cas-usage" className="py-24 bg-[#091426] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#0058be] font-black uppercase tracking-[0.3em] text-sm mb-4 bg-white/10 inline-block px-3 py-1 rounded-lg">Cas Pratique</p>
              <h2 className="text-3xl md:text-5xl font-light mb-8 leading-tight serif-text">
                De l'idée brute à <br/><span className="italic text-[#0058be] font-bold">l'action concrète.</span>
              </h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <CheckCircle2 className="text-[#0058be] shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-lg mb-1">Le besoin de l'élu</h4>
                    <p className="text-slate-400">Préparer une intervention pour l'inauguration d'une nouvelle pépinière d'entreprises, en valorisant l'accompagnement vers l'emploi.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CheckCircle2 className="text-[#0058be] shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-lg mb-1">La méthode Argumentis</h4>
                    <p className="text-slate-400">Sélection de la "Note de conjoncture" dans la Base de Savoir, choix du module "Discours", ton "Fédérateur".</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CheckCircle2 className="text-[#0058be] shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-lg mb-1">Le Résultat</h4>
                    <p className="text-slate-400">Un texte structuré, reprenant les vrais chiffres du territoire, prêt à être prononcé ou mémorisé.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white text-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-500 border border-slate-100">
              <div className="border-b border-slate-100 pb-6 mb-6 flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Profil Actif</p>
                  <p className="text-base font-black text-[#091426] uppercase leading-none mb-1">Maire Adjoint</p>
                  <p className="text-sm font-bold text-[#0058be] italic leading-none">L'Haÿ-les-Roses</p>
                </div>
                <div className="w-12 h-12 bg-[#e6eef6] rounded-2xl flex items-center justify-center text-[#0058be]">
                  <FileText size={20} />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[#091426] serif-text">Inauguration : Pôle Emploi & Commerces</h3>
              <p className="text-slate-600 mb-6 leading-relaxed font-serif text-lg italic bg-slate-50 p-6 rounded-2xl border border-slate-100">
                "Mesdames et messieurs, l'attractivité de L'Haÿ-les-Roses ne se décrète pas, elle se construit. Ce nouveau pôle est la traduction concrète de notre volonté d'accompagner chaque porteur de projet et chaque demandeur d'emploi vers la réussite..."
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                  <PenTool size={14} className="text-[#0058be]"/> Module : Discours
                </span>
                <span className="text-xs font-bold bg-[#0058be]/10 text-[#0058be] px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Clock size={14} /> Généré en 4s
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AVANTAGES */}
      <section id="securite" className="py-24 px-6 bg-[#e6eef6]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-50">
              <div className="w-16 h-16 mx-auto bg-[#e6eef6] text-[#0058be] rounded-2xl flex items-center justify-center mb-6">
                <Clock size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#091426]">Gain de temps décisif</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Divisez par trois le temps passé sur la structuration de vos documents. Concentrez-vous sur l'action politique et le terrain.</p>
            </div>
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-50">
              <div className="w-16 h-16 mx-auto bg-[#e6eef6] text-[#0058be] rounded-2xl flex items-center justify-center mb-6">
                <Lock size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#091426]">Données Sécurisées</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Vos données restent strictement confidentielles. L'intelligence artificielle ne s'entraîne jamais sur vos documents personnels ou sensibles.</p>
            </div>
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-50">
              <div className="w-16 h-16 mx-auto bg-[#e6eef6] text-[#0058be] rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#091426]">Ton Institutionnel</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Fini le texte "robotique" des assistants classiques. Argumentis est programmé pour utiliser l'élégance du langage public.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-black text-slate-300 uppercase tracking-tighter">Argumentis</h1>
            <span className="text-slate-300">|</span>
            <span className="font-bold text-slate-400 tracking-widest uppercase text-xs">© 2026</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-400 font-medium">
            <a href="#" className="hover:text-[#0058be] transition-colors">Mentions Légales</a>
            <a href="#" className="hover:text-[#0058be] transition-colors">Politique de Confidentialité</a>
            <a href="#" className="hover:text-[#0058be] transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};