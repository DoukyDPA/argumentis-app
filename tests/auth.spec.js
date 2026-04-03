import { test, expect } from '@playwright/test';

const URL = 'http://localhost:5173';
const EMAIL = 'test@argumentis.dev';
const PASSWORD = 'Test1234!';

// TEST 1 : Connexion réussie
test('connexion avec un compte valide', async ({ page }) => {
  await page.goto(URL);

  // Cliquer sur le bouton "Se connecter" dans la navigation (exact)
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();

  // Remplir le formulaire
  await page.getByPlaceholder('vous@exemple.com').fill(EMAIL);
  await page.getByPlaceholder('••••••••').first().fill(PASSWORD);

  // Soumettre
  await page.getByRole('button', { name: /se connecter/i }).click();

  // Vérifier qu'on arrive sur le Dashboard
  await expect(page.getByText('Bonjour')).toBeVisible({ timeout: 10000 });
});

// TEST 2 : Inscription refusée avec un mauvais code bêta
test("inscription refusée avec un mauvais code bêta", async ({ page }) => {
  await page.goto(URL);

  // Aller en mode inscription
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await page.getByRole('button', { name: /pas encore de compte/i }).click();

  // Remplir le formulaire
  await page.getByPlaceholder('vous@exemple.com').fill('nouveau@test.dev');
  await page.getByPlaceholder('••••••••').first().fill('MotDePasse123!');
  await page.getByPlaceholder('••••••••').last().fill('MAUVAISCODE');

  // Soumettre
  await page.getByRole('button', { name: /s'inscrire/i }).click();

  // Vérifier que l'erreur s'affiche
  await expect(page.getByText("Code d'accès bêta invalide.")).toBeVisible();
});

// TEST 3 : Génération d'un discours
test('génération d\'un discours depuis le dashboard', async ({ page }) => {
  // Connexion
  await page.goto(URL);
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await page.getByPlaceholder('vous@exemple.com').fill(EMAIL);
  await page.getByPlaceholder('••••••••').first().fill(PASSWORD);
  await page.getByRole('button', { name: /se connecter/i }).click();
  await expect(page.getByText('Bonjour')).toBeVisible({ timeout: 10000 });

  // Cliquer sur le module "Discours"
  await page.getByRole('button', { name: /discours/i }).click();

  // Vérifier qu'on est sur le formulaire
  await expect(page.getByPlaceholder('Ex: 5 minutes')).toBeVisible();

  // Remplir les champs
  await page.getByPlaceholder('Ex: 5 minutes').fill('3 minutes');
  await page.getByPlaceholder('Ex: Citoyens, Partenaires...').fill('Citoyens');
  await page.getByPlaceholder('Ex: Convaincre, Informer, Fédérer...').fill('Inauguration');
  await page.getByPlaceholder('Texte source, notes en vrac ou message principal...').fill('Inauguration de la nouvelle bibliothèque municipale.');

  // Lancer la génération
  await page.getByRole('button', { name: /lancer la génération/i }).click();

  // Vérifier qu'un résultat apparaît (délai plus long car appel API)
  await expect(page.getByText(/Affiner/i)).toBeVisible({ timeout: 60000 });
});
