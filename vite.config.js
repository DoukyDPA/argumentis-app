import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Passerelle de développement : reproduit la fonction serverless /api/gemini
// (dossier api/ sur Vercel) pour que `npm run dev` fasse marcher la génération en local.
const devApiGemini = (env) => ({
  name: 'dev-api-gemini',
  configureServer(server) {
    server.middlewares.use('/api/gemini', async (req, res) => {
      const sendJson = (status, payload) => {
        res.statusCode = status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(payload));
      };

      if (req.method !== 'POST') {
        return sendJson(405, { error: 'Méthode non autorisée' });
      }

      try {
        let body = '';
        for await (const chunk of req) body += chunk;
        const { historyParams, systemInstruction } = JSON.parse(body || '{}');

        const apiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
          return sendJson(500, { error: 'Clé API serveur manquante (GEMINI_API_KEY dans .env)' });
        }

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: historyParams,
              systemInstruction: { parts: [{ text: systemInstruction }] }
            })
          }
        );

        const text = await response.text();
        if (!response.ok) {
          let message = `Erreur API Google : ${response.status}`;
          try {
            const parsed = JSON.parse(text);
            message = parsed?.error?.message || parsed?.error || message;
          } catch (_) { if (text) message = text; }
          return sendJson(response.status, { error: message });
        }
        res.statusCode = response.status;
        res.setHeader('Content-Type', 'application/json');
        res.end(text || JSON.stringify({ error: `Erreur API Google : ${response.status}` }));
      } catch (error) {
        console.error('Erreur passerelle /api/gemini :', error);
        sendJson(500, { error: error.message || 'Erreur inattendue du serveur' });
      }
    });
  }
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), devApiGemini(env)]
  };
});
