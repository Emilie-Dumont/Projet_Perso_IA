import './style.css';
import nodesData from './data/nodes.mock.json';
import { createNarrativeEngine } from './engine/narrativeEngine.js';
import { renderNode } from './ui/render.js';
import { renderAgeSelector } from './ui/ageSelector.js';
import { renderProfileForm } from './ui/profileForm.js';

// Point d'entrée de l'application NarrativePath
const appContainer = document.getElementById('app');

const AGE_PROFILE_STORAGE_KEY = 'narrativepath:ageProfile';
const PROGRESS_STORAGE_KEY = 'narrativepath:progress';
const PLAYER_NAME_STORAGE_KEY = 'narrativepath:playerName';
const STORY_STYLE_STORAGE_KEY = 'narrativepath:storyStyle';

// Moteur narratif : créé une seule fois, le profil d'âge par défaut sera mis à jour si besoin.
const engine = createNarrativeEngine(nodesData, 'start');

/**
 * Sauvegarde la progression courante (historique des nœuds visités) en localStorage,
 * pour permettre de reprendre l'histoire après un rechargement de la page.
 */
function saveProgress() {
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(engine.getHistory()));
}

/**
 * Efface la progression sauvegardée en localStorage.
 */
function clearProgress() {
  localStorage.removeItem(PROGRESS_STORAGE_KEY);
}

/**
 * Affiche le nœud narratif courant et branche les actions utilisateur.
 */
function displayStory() {
  const currentNode = engine.getCurrentNode();

  renderNode(appContainer, currentNode, {
    onChoose: (nextId) => {
      engine.choose(nextId);
      saveProgress();
      displayStory();
    },
    onRestart: () => {
      // Le profil d'âge déjà choisi est conservé : pas besoin de le redemander.
      engine.restart();
      clearProgress();
      displayStory();
    },
  });
}

/**
 * Démarre l'histoire avec le profil d'âge donné (et le mémorise pour la prochaine visite).
 * Une fois l'âge choisi, on passe à l'étape suivante : le formulaire prénom + style.
 * @param {string} profile - "6-12" ou "13-18"
 */
function startStoryWithAgeProfile(profile) {
  engine.setAgeProfile(profile);
  localStorage.setItem(AGE_PROFILE_STORAGE_KEY, profile);
  showProfileFormStep();
}

/**
 * Applique le profil joueur (prénom + style) à l'engine, le mémorise en localStorage,
 * puis démarre l'affichage de l'histoire.
 * @param {Object} profile - { name: string, style: string }
 */
function startStoryWithPlayerProfile({ name, style }) {
  engine.setPlayerProfile({ name, style });
  localStorage.setItem(PLAYER_NAME_STORAGE_KEY, name);
  localStorage.setItem(STORY_STYLE_STORAGE_KEY, style);
  displayStory();
}

/**
 * Affiche l'écran de saisie du prénom et du style narratif.
 */
function showProfileFormStep() {
  renderProfileForm(appContainer, {
    onSubmit: (profile) => startStoryWithPlayerProfile(profile),
  });
}

/**
 * Lit le profil joueur (prénom + style) sauvegardé en localStorage, s'il existe.
 * @returns {{ name: string, style: string }|null}
 */
function readSavedPlayerProfile() {
  const name = localStorage.getItem(PLAYER_NAME_STORAGE_KEY);
  const style = localStorage.getItem(STORY_STYLE_STORAGE_KEY);

  if (!name || !style) {
    return null;
  }

  return { name, style };
}

/**
 * Lit la progression sauvegardée en localStorage, si elle existe et qu'elle est lisible.
 * @returns {string[]|null} l'historique des ids de nœuds visités, ou null si absent/invalide
 */
function readSavedProgress() {
  const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Point de départ de l'app : trois étapes successives, chacune mémorisée en localStorage
 * pour ne pas être redemandée à chaque visite :
 *   1. profil d'âge (sécurité du contenu)
 *   2. profil joueur (prénom + style narratif)
 *   3. histoire (avec reprise de la progression sauvegardée si elle existe)
 */
function init() {
  const savedProfile = localStorage.getItem(AGE_PROFILE_STORAGE_KEY);

  if (savedProfile !== '6-12' && savedProfile !== '13-18') {
    renderAgeSelector(appContainer, {
      onSelectAge: (profile) => startStoryWithAgeProfile(profile),
    });
    return;
  }

  engine.setAgeProfile(savedProfile);

  const savedPlayerProfile = readSavedPlayerProfile();
  if (!savedPlayerProfile) {
    showProfileFormStep();
    return;
  }

  engine.setPlayerProfile(savedPlayerProfile);

  const savedHistory = readSavedProgress();
  if (savedHistory) {
    // restoreHistory valide elle-même les ids et repart à "start" si invalides.
    engine.restoreHistory(savedHistory);
  }

  displayStory();
}

init();
