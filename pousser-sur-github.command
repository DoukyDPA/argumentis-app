#!/bin/bash
# ---------------------------------------------------------------
# Pousse la version actuelle d'Argumentis sur GitHub (branche main).
# Double-clique ce fichier, ou lance-le depuis le Terminal avec :
#   bash "pousser-sur-github.command"
# ---------------------------------------------------------------
set -e
cd "$(cd "$(dirname "$0")" && pwd)"
echo "Dossier de travail : $(pwd)"
echo ""

# 1. Repart d'un depot git propre (efface un eventuel .git casse).
rm -rf .git
git init -q
git remote add origin https://github.com/DoukyDPA/argumentis-app.git

# 2. Recupere l'etat actuel de GitHub sans toucher a tes fichiers.
echo "Recuperation de l'etat GitHub..."
git fetch origin -q
git reset --mixed origin/main

# 3. Prepare le commit.
git add -A
echo ""
echo "--- Fichiers qui seront envoyes ---"
git status --short
echo ""

git commit -q -m "Securise l'app: auth API, quota par compte, prompt verrouille, bascule Mistral, retour navigateur + travail local (bibliotheque partagee, firestore.rules)"

# 4. Envoie sur GitHub (une fenetre de connexion GitHub peut s'ouvrir).
echo "Envoi sur GitHub..."
git push origin main

echo ""
echo "Termine. Vercel va redeployer automatiquement dans la foulee."
echo "Tu peux fermer cette fenetre."
