// api/gemini.js
export default async function handler(req, res) {
  // On n'accepte que les requêtes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { historyParams, systemInstruction } = req.body;
    
    // LA CLÉ EST ICI, TOTALEMENT INVISIBLE POUR LE NAVIGATEUR
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
      throw new Error(`Erreur API Google : ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error("Erreur backend:", error);
    return res.status(500).json({ error: "Erreur lors de la génération" });
  }
}
