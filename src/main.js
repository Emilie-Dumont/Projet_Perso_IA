import './style.css';
import nodesData from './data/nodes.mock.json';
import { createNarrativeEngine } from './engine/narrativeEngine.js';
import { renderNode } from './ui/render.js';
import { renderAgeSelector } from './ui/ageSelector.js';

// Point d'entrée de l'application NarrativePath
const appContainer = document.getElementById('app');

const AGE_PROFILE_STORAGE_KEY = 'narrativepath:ageProfile';

// Moteur narratif : créé une seule fois, le profil d'âge par défaut sera mis à jour si besoin.
const engine = createNarrativeEngine(nodesData, 'start');

/**
 * Affiche le nœud narratif courant et branche les actions utilisateur.
 */
function displayStory() {
  const currentNode = engine.getCurrentNode();

  renderNode(appContainer, currentNode, {
    onChoose: (nextId) => {
      engine.choose(nextId);
      displayStory();
    },
    onRestart: () => {
      // Le profil d'âge déjà choisi est conservé : pas besoin de le redemander.
      engine.restart();
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
 * Point de départ de l'app : si un profil d'âge est déjà mémorisé, on lance l'histoire
 * directement, sinon on affiche l'écran de sélection d'âge.
 */
function init() {
  const savedProfile = localStorage.getItem(AGE_PROFILE_STORAGE_KEY);

  if (savedProfile === '6-12' || savedProfile === '13-18') {
    startStoryWithAgeProfile(savedProfile);
    return;
  }

  renderAgeSelector(appContainer, {
    onSelectAge: (profile) => startStoryWithAgeProfile(profile),
  });
}

init();
