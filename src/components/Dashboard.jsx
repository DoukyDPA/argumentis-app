import { Clock, FileText } from 'lucide-react'; // Importez de nouvelles icônes

export const Dashboard = ({ profile, setActiveTab, setChatHistory, setShowLegal, archives, setResult, setShowResult }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ... (Section Bienvenue et Grille des 6 modules inchangée) ... */}
      
      {/* NOUVELLE SECTION : DERNIÈRES GÉNÉRATIONS */}
      <section className="mt-16 mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Clock size={18} className="text-[#0058be]" />
          <h3 className="text-xs font-black text-[#091426] uppercase tracking-widest">
            Vos 10 dernières productions
          </h3>
        </div>

        {archives.length === 0 ? (
          <div className="p-8 bg-white/50 rounded-3xl border border-dashed border-slate-200 text-center text-slate-400 text-sm">
            Aucun texte encore archivé.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {archives.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setResult(item.content);
                  setShowResult(true);
                }}
                className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-50 hover:border-blue-100 hover:shadow-md transition-all group text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0058be]">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-[#091426] text-sm line-clamp-1">
                      {item.content.substring(0, 60)}...
                    </p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[9px] font-black uppercase text-[#0058be] bg-blue-50 px-2 py-0.5 rounded">
                        {/* On retrouve le label grâce à l'ID du module */}
                        {modules.find(m => m.id === item.type)?.label || 'Texte'}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                        {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[#0058be] font-bold text-xs">
                  Ouvrir →
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ... (Bouton Mentions légales) ... */}
    </div>
  );
};
