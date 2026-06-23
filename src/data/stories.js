// Point d'entrée unique pour accéder aux histoires mock.
// Chaque combinaison âge x style correspond à un graphe de nœuds indépendant
// (fichier JSON sous /data/stories), avec son propre "start" et ses propres ids.
// On regroupe ici les 6 imports + une fonction `selectStory` qui choisit le bon graphe.

import story6_12Adventure from './stories/6-12_adventure.json';
import story6_12Funny from './stories/6-12_funny.json';
import story6_12Fantasy from './stories/6-12_fantasy.json';
import story13_18Adventure from './stories/13-18_adventure.json';
import story13_18Funny from './stories/13-18_funny.json';
import story13_18Fantasy from './stories/13-18_fantasy.json';

// Histoire utilisée par défaut si la combinaison demandée n'existe pas
// (ne devrait pas arriver puisque les 6 combinaisons sont couvertes ci-dessous).
const FALLBACK_AGE_PROFILE = '6-12';
const FALLBACK_STYLE = 'adventure';

const STORIES = {
  '6-12': {
    adventure: story6_12Adventure,
    funny: story6_12Funny,
    fantasy: story6_12Fantasy,
  },
  '13-18': {
    adventure: story13_18Adventure,
    funny: story13_18Funny,
    fantasy: story13_18Fantasy,
  },
};

/**
 * Retourne le graphe de nœuds correspondant à la combinaison âge x style demandée.
 * Si la combinaison n'existe pas (cas anormal), replie sur l'histoire par défaut
 * (6-12 / adventure) plutôt que de planter l'application.
 * @param {string} ageProfile - "6-12" ou "13-18"
 * @param {string} style - "adventure" | "funny" | "fantasy"
 * @returns {Object} dictionnaire de nœuds { id: noeud }
 */
export function selectStory(ageProfile, style) {
  const storiesForAge = STORIES[ageProfile] || STORIES[FALLBACK_AGE_PROFILE];
  return storiesForAge[style] || storiesForAge[FALLBACK_STYLE];
}
