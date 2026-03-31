// api/gemini.js

// Optionnel : Si tu es sur Vercel, cela étend le timeout
export const config = {
  maxDuration: 60, 
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { historyParams, systemInstruction } = req.body;
    const apiKey = process.env.VITE_GEMINI_API_KEY; 

    if (!apiKey) {
      return res.status(500).json({ error: "Clé API serveur manquante" });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {        
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: historyParams,
        systemInstruction: { parts: [{ text: systemInstruction }] }
      })
    });

    if (!response.ok) {
      // ON CAPTURE LA VRAIE ERREUR GOOGLE ICI AU LIEU DE LEVER UNE EXCEPTION
      const errorData = await response.json().catch(() => null);
      console.error("Détail erreur Google :", errorData);
      return res.status(response.status).json({ 
        error: errorData?.error?.message || `Erreur API Google : ${response.status}` 
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error("Erreur backend:", error);
    // ON RENVOIE LE MESSAGE D'ERREUR PRÉCIS
    return res.status(500).json({ error: error.message || "Erreur inattendue du serveur" });
  }
}
