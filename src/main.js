import './style.css';
import { selectStory } from './data/stories.js';
import { createNarrativeEngine } from './engine/narrativeEngine.js';
import { renderNode } from './ui/render.js';
import { renderAgeSelector } from './ui/ageSelector.js';
import { renderProfileForm } from './ui/profileForm.js';

// Point d'entrée de l'application NarrativePath
const appContainer = document.getElementById('app');

const PROGRESS_STORAGE_KEY = 'narrativepath:progress';

// L'engine ne peut être créé qu'une fois l'âge ET le style connus, puisque ces deux
// informations déterminent quel graphe d'histoire utiliser (voir selectStory).
// Il est donc stocké ici et (re)créé à chaque soumission du formulaire de profil.
let engine = null;
let currentAgeProfile = null;
let currentStyle = null;

/**
 * Sauvegarde la progression courante (combinaison âge/style + historique des nœuds
 * visités) en localStorage, pour permettre de reprendre une histoire interrompue.
 */
function saveProgress() {
  const progress = {
    ageProfile: currentAgeProfile,
    style: currentStyle,
    history: engine.getHistory(),
  };
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}

/**
 * Efface la progression sauvegardée en localStorage.
 */
function clearProgress() {
  localStorage.removeItem(PROGRESS_STORAGE_KEY);
}

/**
 * Lit la progression sauvegardée en localStorage, si elle existe et qu'elle est lisible.
 * @returns {{ ageProfile: string, style: string, history: string[] }|null}
 */
function readSavedProgress() {
  const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    const isValid =
      parsed && typeof parsed.ageProfile === 'string' && typeof parsed.style === 'string' && Array.isArray(parsed.history);
    return isValid ? parsed : null;
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
    playerName: engine.getPlayerName(),
    style: currentStyle,
    onChoose: (nextId) => {
      engine.choose(nextId);
      // Une fin atteinte ne doit pas rester "reprenable" : on efface la sauvegarde
      // plutôt que de risquer de coincer un futur joueur sur une histoire déjà terminée.
      if (engine.isEnding()) {
        clearProgress();
      } else {
        saveProgress();
      }
      displayStory();
    },
    onRestart: () => {
      // "Recommencer" repart de zéro comme un nouveau joueur : âge, prénom et style
      // sont redemandés à chaque fois, et la progression sauvegardée est effacée.
      engine = null;
      clearProgress();
      init();
    },
  });
}

/**
 * Affiche l'écran de saisie du prénom et du style narratif. Une fois validé, on connaît
 * enfin la combinaison âge x style : on sélectionne l'histoire correspondante, on crée
 * l'engine pour cette histoire, puis on reprend la progression sauvegardée si elle
 * correspond à la même combinaison et ne pointe pas déjà sur une fin.
 * @param {string} ageProfile - "6-12" ou "13-18"
 */
function showProfileFormStep(ageProfile) {
  renderProfileForm(appContainer, {
    onSubmit: ({ name, style }) => {
      currentAgeProfile = ageProfile;
      currentStyle = style;

      const storyNodes = selectStory(ageProfile, style);
      engine = createNarrativeEngine(storyNodes, 'start');
      engine.setPlayerName(name);

      const saved = readSavedProgress();
      if (saved && saved.ageProfile === ageProfile && saved.style === style) {
        engine.restoreHistory(saved.history);
        if (engine.isEnding()) {
          // La sauvegarde pointait sur une histoire déjà terminée : on repart à zéro.
          engine.restart();
        }
      }

      displayStory();
    },
  });
}

/**
 * Point de départ de l'app : à chaque ouverture (ou "Recommencer"), on redemande
 * systématiquement le profil d'âge puis le profil joueur (prénom + style), puis on
 * démarre (ou reprend) l'histoire correspondant à la combinaison choisie.
 */
function init() {
  renderAgeSelector(appContainer, {
    onSelectAge: (ageProfile) => {
      showProfileFormStep(ageProfile);
    },
  });
}

init();
