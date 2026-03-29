import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ExternalLink } from 'lucide-react';

export const formatResult = (text) => {
  if (!text) return <p className="italic text-slate-500">Aucun contenu généré.</p>;

  // Nettoyage préventif des balises de code markdown génériques souvent renvoyées par l'IA
  const cleanText = text.replace(/^```markdown\n/g, '').replace(/^```\n/g, '').replace(/\n```$/g, '');

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({node, ...props}) => <h1 className="text-3xl font-medium text-slate-900 mb-6 mt-8 leading-tight italic serif-text border-b border-slate-100 pb-4" {...props} />,
        h2: ({node, ...props}) => <h2 className="text-xl font-bold text-[#0058be] mb-4 mt-8 border-l-2 border-[#0058be] pl-4 serif-text" {...props} />,
        h3: ({node, ...props}) => <h3 className="text-lg font-bold text-slate-800 mb-3 mt-6 serif-text" {...props} />,
        p: ({node, ...props}) => <p className="mb-4 text-slate-700 leading-relaxed text-lg serif-text" {...props} />,
        strong: ({node, ...props}) => <strong className="font-bold text-slate-900" {...props} />,
        ul: ({node, ...props}) => <ul className="mb-4 space-y-2" {...props} />,
        ol: ({node, ...props}) => <ol className="mb-4 space-y-2 list-decimal ml-6 text-slate-700 text-lg serif-text" {...props} />,
        li: ({node, ...props}) => {
          // On vérifie si c'est une liste ordonnée ou non pour l'affichage de la puce
          const isOrdered = node.parent && node.parent.tagName === 'ol';
          if (isOrdered) return <li className="pl-2 mb-2">{props.children}</li>;
          
          return (
            <li className="flex gap-4 mb-3 ml-2 serif-text">
              <span className="text-[#0058be] text-xl leading-none">•</span>
              <span className="text-slate-700 leading-relaxed text-lg block">{props.children}</span>
            </li>
          );
        },
        table: ({node, ...props}) => (
          <div className="my-8 overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
            <table className="w-full text-left border-collapse sans-text text-sm" {...props} />
          </div>
        ),
        thead: ({node, ...props}) => <thead className="bg-slate-50" {...props} />,
        th: ({node, ...props}) => <th className="p-4 font-black uppercase text-[10px] tracking-widest text-slate-400 border-b border-slate-200" {...props} />,
        tbody: ({node, ...props}) => <tbody className="divide-y divide-slate-100" {...props} />,
        tr: ({node, ...props}) => <tr className="hover:bg-blue-50/30 transition-colors" {...props} />,
        td: ({node, ...props}) => <td className="p-4 text-slate-600 font-medium align-top leading-relaxed break-words min-w-[150px]" {...props} />,
        a: ({node, ...props}) => (
          <a target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#0058be] font-bold hover:underline bg-blue-50 px-3 py-1.5 rounded-lg text-xs" {...props}>
            {props.children} <ExternalLink size={12} />
          </a>
        ),
        code: ({node, ...props}) => <code className="bg-slate-100 text-[#0058be] px-1.5 py-0.5 rounded text-sm font-sans" {...props} />,
        pre: ({node, ...props}) => <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans p-6 bg-slate-50 rounded-xl my-4 overflow-x-auto border border-slate-100" {...props} />
      }}
    >
      {cleanText}
    </ReactMarkdown>
  );
};