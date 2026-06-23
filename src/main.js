import './style.css';
import nodesData from './data/nodes.mock.json';
import { createNarrativeEngine } from './engine/narrativeEngine.js';
import { renderNode } from './ui/render.js';
import { renderAgeSelector } from './ui/ageSelector.js';

// Point d'entrée de l'application NarrativePath
const appContainer = document.getElementById('app');

const AGE_PROFILE_STORAGE_KEY = 'narrativepath:ageProfile';
const PROGRESS_STORAGE_KEY = 'narrativepath:progress';

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
 * @param {string} profile - "6-12" ou "13-18"
 */
function startStoryWithAgeProfile(profile) {
  engine.setAgeProfile(profile);
  localStorage.setItem(AGE_PROFILE_STORAGE_KEY, profile);
  displayStory();
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
 * Point de départ de l'app : si un profil d'âge est déjà mémorisé, on lance l'histoire
 * directement (en reprenant la progression sauvegardée si elle existe et reste valide),
 * sinon on affiche l'écran de sélection d'âge.
 */
function init() {
  const savedProfile = localStorage.getItem(AGE_PROFILE_STORAGE_KEY);

  if (savedProfile === '6-12' || savedProfile === '13-18') {
    engine.setAgeProfile(savedProfile);

    const savedHistory = readSavedProgress();
    if (savedHistory) {
      // restoreHistory valide elle-même les ids et repart à "start" si invalides.
      engine.restoreHistory(savedHistory);
    }

    displayStory();
    return;
  }

  renderAgeSelector(appContainer, {
    onSelectAge: (profile) => startStoryWithAgeProfile(profile),
  });
}

init();
