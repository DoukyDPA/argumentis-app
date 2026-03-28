import React from 'react';
import { ExternalLink } from 'lucide-react';

export const formatResult = (text) => {
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
    
    if (inTable && tableRows.length > 0) elements.push(renderTable(tableRows, 'end'));
    if (elements.length === 0) return <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans p-6 bg-slate-50 rounded-xl">{cleanText}</pre>;
    
    return elements;
  } catch (err) {
    console.error("Erreur de parsing:", err);
    return (
      <div className="space-y-4">
         <p className="text-red-500 font-bold">Rendu visuel échoué. Voici le texte brut :</p>
         <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans p-6 bg-slate-50 rounded-xl">{text}</pre>
      </div>
    );
  }
};
