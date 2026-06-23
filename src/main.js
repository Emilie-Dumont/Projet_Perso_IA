import './style.css';
import nodesData from './data/nodes.mock.json';
import { createNarrativeEngine } from './engine/narrativeEngine.js';
import { renderNode } from './ui/render.js';
import { renderAgeSelector } from './ui/ageSelector.js';
import { renderProfileForm } from './ui/profileForm.js';

// Point d'entrée de l'application NarrativePath
const appContainer = document.getElementById('app');

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
      // "Recommencer" repart de zéro comme un nouveau joueur : âge, prénom et style
      // sont redemandés à chaque fois, et la progression sauvegardée est effacée.
      engine.restart();
      clearProgress();
      init();
    },
  });
}

/**
 * Affiche l'écran de saisie du prénom et du style narratif, puis démarre l'histoire
 * une fois validé (en reprenant la progression sauvegardée si elle existe et reste valide).
 */
function showProfileFormStep() {
  renderProfileForm(appContainer, {
    onSubmit: ({ name, style }) => {
      engine.setPlayerProfile({ name, style });

      const savedHistory = readSavedProgress();
      if (savedHistory) {
        // restoreHistory valide elle-même les ids et repart à "start" si invalides.
        engine.restoreHistory(savedHistory);
      }

      displayStory();
    },
  });
}

/**
 * Point de départ de l'app : à chaque ouverture de page, on redemande systématiquement
 * le profil d'âge puis le profil joueur (prénom + style), avant d'afficher l'histoire
 * (avec reprise de la progression sauvegardée si elle existe).
 */
function init() {
  renderAgeSelector(appContainer, {
    onSelectAge: (profile) => {
      engine.setAgeProfile(profile);
      showProfileFormStep();
    },
  });
}

init();
