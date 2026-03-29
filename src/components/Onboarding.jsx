<form onSubmit={handleSubmit} className="space-y-8 text-left">
          
          {/* Section 1 : Identité et Fonction */}
          <div className="space-y-5 bg-[#f0f4f8] p-6 rounded-3xl">
            <h3 className="text-xs font-black text-[#0058be] uppercase tracking-widest flex items-center gap-2">
              <Building2 size={16} /> 1. Votre casquette actuelle
            </h3>
            <p className="text-xs text-slate-500 mb-4">Définissez le rôle que l'IA doit incarner aujourd'hui. Vous pourrez le modifier à tout moment.</p>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase px-1">Prénom / Nom</label>
              <div className="relative">
                <input type="text" required className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm" placeholder="Votre nom" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                <User className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase px-1">Fonction (Mandat, Métier...)</label>
              <div className="relative">
                <input type="text" className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm" placeholder="Ex: Maire adjoint, Directeur d'association, Auteur..." value={formData.role || ''} onChange={e => setFormData({...formData, role: e.target.value})} />
                <Building2 className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase px-1">Territoire ou Organisation</label>
              <div className="relative">
                <input type="text" className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm" placeholder="Ex: L'Haÿ-les-Roses, Val-de-Marne..." value={formData.city || ''} onChange={e => setFormData({...formData, city: e.target.value})} />
                <MapPin className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              </div>
            </div>
          </div>

          {/* Section 2 : Engagements */}
          <div className="space-y-5 bg-blue-50/50 border border-blue-100 p-6 rounded-3xl">
            <h3 className="text-xs font-black text-[#0058be] uppercase tracking-widest flex items-center gap-2">
              <Flag size={16} /> 2. Valeurs & Ligne directrice
            </h3>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase px-1">Sensibilité politique ou associative</label>
              <textarea 
                className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-medium shadow-sm resize-none h-24" 
                placeholder="Ex: Priorité au développement économique local, accompagnement vers l'emploi, engagement humaniste..." 
                value={formData.orientation || ''} 
                onChange={e => setFormData({...formData, orientation: e.target.value})} 
              />
            </div>
          </div>

          <button type="submit" disabled={!formData.firstName.trim() || loading} className="w-full mt-4 bg-[#0058be] text-white rounded-2xl py-4 px-6 flex items-center justify-between shadow-xl">
            <span className="font-black uppercase text-sm">{initialData ? 'Mettre à jour mon profil' : 'Commencer'}</span>
            {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
          </button>
        </form>