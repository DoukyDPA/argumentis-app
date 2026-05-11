import admin from 'firebase-admin';

// Initialisation conditionnelle indispensable pour les environnements Serverless (Vercel)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY))
    });
  } catch (error) {
    console.error('Erreur initialisation Firebase Admin:', error);
  }
}

export const config = {
  maxDuration: 60, 
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  // 1. Vérification de la présence du token Firebase
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Accès refusé. Non authentifié.' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    // 2. Validation cryptographique du token
    await admin.auth().verifyIdToken(idToken);

    // 3. Si on arrive ici, le visiteur est un utilisateur connecté certifié. On peut appeler Gemini.
    const { historyParams, systemInstruction } = req.body;
    
    // N'oubliez pas d'utiliser le nouveau nom de la variable d'environnement
    const apiKey = process.env.GEMINI_API_KEY; 

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
      const errorData = await response.json().catch(() => null);
      return res.status(response.status).json({ 
        error: errorData?.error?.message || `Erreur API Google : ${response.status}` 
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error("Erreur d'authentification ou backend:", error);
    return res.status(403).json({ error: "Token invalide ou erreur inattendue du serveur." });
  }
}
