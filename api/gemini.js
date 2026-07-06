// api/gemini.js

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Optionnel : Si tu es sur Vercel, cela étend le timeout
export const config = {
  maxDuration: 60,
};

// Nombre maximal de générations par utilisateur et par jour.
const QUOTA_PER_DAY = parseInt(process.env.QUOTA_PER_DAY || '60', 10);

// Règles de sortie appliquées côté serveur. Le client ne peut pas les retirer.
const FIXED_OUTPUT_RULES = `

RÈGLES DE SORTIE STRICTES :
- Livre uniquement le texte final demandé, prêt à l'emploi. Rien d'autre.
- N'écris aucune phrase d'introduction qui commente la demande, le sujet ou ton rôle (ex. interdit : « En tant que votre plume… », « Je comprends l'importance de… »).
- N'écris aucune conclusion ni conseil sur l'usage du texte (ex. interdit : « En utilisant cette fiche, vous pourrez… »).
- Ne t'adresse jamais à l'utilisateur et ne le nomme pas. Pas de « Cher Daniel », pas de « vous pourrez ».
- Ne mentionne ni l'IA, ni Argumentis, ni le fait que ce soit une génération.
- Commence directement par la première ligne du livrable.`;

// --- Initialisation du SDK admin (une seule fois, réutilisée entre appels) ---
// Le compte de service est lu depuis la variable d'environnement FIREBASE_SERVICE_ACCOUNT
// (le JSON complet, en une seule ligne). Sans elle, le quota est simplement ignoré.
// Lit le compte de service, qu'il soit stocké en JSON brut ou en base64.
function parseServiceAccount() {
  const raw =
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
    process.env.FIREBASE_SERVICE_ACCOUNT ||
    '';
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    // La valeur est peut-être encodée en base64.
    try {
      return JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
    } catch (e2) {
      console.error('Compte de service illisible :', e2.message);
      return null;
    }
  }
}

function getAdminDb() {
  const svc = parseServiceAccount();
  if (!svc) return null;
  try {
    if (getApps().length === 0) {
      initializeApp({ credential: cert(svc) });
    }
    return getFirestore();
  } catch (e) {
    console.error('Init firebase-admin impossible :', e.message);
    return null;
  }
}

// Vérifie un jeton Firebase auprès de l'API Identity Toolkit.
// Renvoie l'enregistrement utilisateur si valide, null sinon.
async function verifyFirebaseToken(idToken) {
  const apiKey =
    process.env.VITE_FIREBASE_API_KEY ||
    process.env.FIREBASE_API_KEY ||
    process.env.FIREBASE_WEB_API_KEY;

  if (!apiKey || !idToken) return null;

  try {
    const r = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!r.ok) return null;
    const data = await r.json();
    return data?.users?.[0] || null;
  } catch (e) {
    console.error('Échec vérification token :', e);
    return null;
  }
}

// Incrémente le compteur du jour de façon atomique et refuse au-delà du quota.
// Renvoie { allowed, count, limit, enforced }.
async function checkQuota(uid) {
  const db = getAdminDb();
  if (!db) {
    // Quota non configuré : on laisse passer mais on le signale.
    return { allowed: true, enforced: false };
  }
  const dayKey = new Date().toISOString().slice(0, 10); // AAAA-MM-JJ (UTC)
  const ref = db.collection('usage').doc(`${uid}_${dayKey}`);

  try {
    const result = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const current = snap.exists ? snap.data().count || 0 : 0;
      if (current >= QUOTA_PER_DAY) {
        return { allowed: false, count: current };
      }
      tx.set(
        ref,
        {
          count: FieldValue.increment(1),
          uid,
          day: dayKey,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      return { allowed: true, count: current + 1 };
    });
    return { ...result, limit: QUOTA_PER_DAY, enforced: true };
  } catch (e) {
    console.error('Erreur quota :', e.message);
    // En cas de souci de base, on ne bloque pas l'utilisateur légitime.
    return { allowed: true, enforced: false };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // --- SÉCURITÉ : authentification obligatoire ---
    const authHeader = req.headers.authorization || '';
    const idToken = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : null;

    if (!idToken) {
      return res.status(401).json({ error: "Authentification requise." });
    }

    const userRecord = await verifyFirebaseToken(idToken);
    if (!userRecord) {
      return res
        .status(401)
        .json({ error: "Session invalide ou expirée. Reconnectez-vous." });
    }
    if (userRecord.disabled) {
      return res.status(403).json({ error: "Compte désactivé." });
    }

    // --- QUOTA : limite journalière par utilisateur ---
    const quota = await checkQuota(userRecord.localId);
    if (!quota.allowed) {
      return res.status(429).json({
        error: `Limite quotidienne atteinte (${QUOTA_PER_DAY} générations par jour). Réessayez demain.`,
      });
    }

    const { historyParams, systemInstruction } = req.body;
    const apiKey = process.env.MISTRAL_API_KEY;
    const model = process.env.MISTRAL_MODEL || 'mistral-medium-latest';

    if (!apiKey) {
      return res.status(500).json({ error: "Clé API serveur manquante" });
    }

    // Garde-fous basiques sur la charge utile.
    if (!Array.isArray(historyParams) || historyParams.length === 0) {
      return res.status(400).json({ error: "Requête invalide." });
    }
    const clientPrompt =
      typeof systemInstruction === 'string' ? systemInstruction : '';
    if (clientPrompt.length > 200000) {
      return res.status(413).json({ error: "Contexte trop volumineux." });
    }

    // Les règles de sortie sont ajoutées ici, côté serveur, quoi qu'envoie le client.
    const finalSystemInstruction = clientPrompt + FIXED_OUTPUT_RULES;

    // Conversion du format historique (Gemini : role/parts) vers le format Mistral (messages).
    const messages = [{ role: 'system', content: finalSystemInstruction }];
    for (const item of historyParams) {
      const role = item.role === 'model' ? 'assistant' : 'user';
      const content = Array.isArray(item.parts)
        ? item.parts.map((p) => p.text || '').join('\n')
        : String(item.content || '');
      messages.push({ role, content });
    }

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("Détail erreur Mistral :", errorData);
      return res.status(response.status).json({
        error:
          errorData?.message ||
          errorData?.error?.message ||
          `Erreur API Mistral : ${response.status}`,
      });
    }

    const mistral = await response.json();
    const text = mistral?.choices?.[0]?.message?.content || '';

    // On renvoie une forme compatible avec le client (structure de type Gemini),
    // pour ne rien changer côté App.jsx.
    const data = {
      candidates: [{ content: { parts: [{ text }] } }],
    };
    if (quota.enforced) {
      data._quota = { used: quota.count, limit: quota.limit };
    }
    return res.status(200).json(data);
  } catch (error) {
    console.error("Erreur backend:", error);
    // ON RENVOIE LE MESSAGE D'ERREUR PRÉCIS
    return res
      .status(500)
      .json({ error: error.message || "Erreur inattendue du serveur" });
  }
}
