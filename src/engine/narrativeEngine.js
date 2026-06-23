// Moteur narratif simple : charge des nœuds et gère l'historique de navigation.
// Un "nœud" = { id, text: { "6-12": "...", "13-18": "..." }, choices: [{ label, next }] }

import storyStyles from '../data/storyStyles.mock.json';

const PRENOM_TOKEN = '{prenom}';
const DEFAULT_PLAYER_NAME = 'Aventurier';

/**
 * Crée une instance du moteur narratif à partir d'un objet de nœuds.
 * @param {Object} nodes - dictionnaire { id: noeud }
 * @param {string} startId - id du nœud de départ
 * @param {string} ageProfile - profil d'âge initial ("6-12" ou "13-18")
 * @returns {Object} API du moteur (getCurrentNode, choose, restart, restoreHistory, getHistory,
 *   setAgeProfile, getAgeProfile, setPlayerProfile, getPlayerProfile)
 */
export function createNarrativeEngine(nodes, startId = 'start', ageProfile = '6-12') {
  let history = [startId];
  let currentAgeProfile = ageProfile;
  // Profil joueur : prénom affiché dans les nœuds + style narratif (touche de ton légère).
  let playerName = DEFAULT_PLAYER_NAME;
  let storyStyle = null;

  function getCurrentNodeId() {
    return history[history.length - 1];
  }

  /**
   * Retourne le nœud courant avec son texte déjà adapté au profil d'âge,
   * personnalisé avec le prénom du joueur et légèrement teinté par le style choisi.
   * Le reste de l'app (UI) n'a donc pas besoin de connaître la forme brute de `text`.
   */
  function getCurrentNode() {
    const id = getCurrentNodeId();
    const node = nodes[id];
    if (!node) {
      throw new Error(`Nœud narratif introuvable pour l'id "${id}"`);
    }

    const ageText = resolveTextForAge(node.text, currentAgeProfile);
    // Le style s'applique avant la substitution du prénom : sinon, quand {prenom} est
    // en tout début de phrase, la mise en minuscule du premier caractère (pour enchaîner
    // l'opener) retombe sur la première lettre du prénom au lieu de celle du texte.
    const styledText = applyStoryStyle(ageText, storyStyle, {
      isStartNode: id === startId,
      isEndingNode: node.choices.length === 0,
    });
    const personalizedText = applyPlayerName(styledText, playerName);

    return {
      ...node,
      text: personalizedText,
    };
  }

  /**
   * Change le profil d'âge actif (sans modifier la position dans l'histoire).
   * @param {string} profile - "6-12" ou "13-18"
   */
  function setAgeProfile(profile) {
    currentAgeProfile = profile;
  }

  function getAgeProfile() {
    return currentAgeProfile;
  }

  /**
   * Définit le profil joueur (prénom + style narratif).
   * @param {Object} profile - { name?: string, style?: string }
   */
  function setPlayerProfile({ name, style } = {}) {
    if (name && name.trim()) {
      playerName = name.trim();
    }
    if (style) {
      storyStyle = style;
    }
  }

  function getPlayerProfile() {
    return { name: playerName, style: storyStyle };
  }

  /**
   * Avance dans l'histoire en choisissant l'option "next".
   * @param {string} nextId - id du nœud suivant
   */
  function choose(nextId) {
    if (!nodes[nextId]) {
      throw new Error(`Impossible d'aller vers le nœud "${nextId}" : il n'existe pas.`);
    }
    history.push(nextId);
    return getCurrentNode();
  }

  /**
   * Réinitialise l'histoire au nœud de départ.
   */
  function restart() {
    history = [startId];
    return getCurrentNode();
  }

  /**
   * Remplace l'historique courant par un historique sauvegardé (ex: localStorage),
   * pour reprendre l'histoire exactement où le joueur l'avait laissée.
   * Chaque id doit exister dans `nodes`, sinon on repart proprement au nœud de départ.
   * @param {string[]} savedHistory - liste d'ids de nœuds visités, dans l'ordre
   */
  function restoreHistory(savedHistory) {
    const isValid =
      Array.isArray(savedHistory) &&
      savedHistory.length > 0 &&
      savedHistory.every((id) => Boolean(nodes[id]));

    history = isValid ? [...savedHistory] : [startId];
    return getCurrentNode();
  }

  /**
   * Retourne la liste des ids de nœuds visités (ordre chronologique).
   */
  function getHistory() {
    return [...history];
  }

  /**
   * Indique si le nœud courant est une fin (aucun choix disponible).
   */
  function isEnding() {
    return getCurrentNode().choices.length === 0;
  }

  return {
    getCurrentNode,
    choose,
    restart,
    restoreHistory,
    getHistory,
    isEnding,
    setAgeProfile,
    getAgeProfile,
    setPlayerProfile,
    getPlayerProfile,
  };
}

/**
 * Résout le texte d'un nœud selon le profil d'âge.
 * Reste compatible avec un ancien format où `text` serait une simple chaîne.
 * @param {Object|string} text - { "6-12": "...", "13-18": "..." } ou chaîne brute
 * @param {string} ageProfile - "6-12" ou "13-18"
 * @returns {string}
 */
function resolveTextForAge(text, ageProfile) {
  if (typeof text === 'string') {
    return text;
  }
  return text[ageProfile] || text['6-12'] || Object.values(text)[0] || '';
}

/**
 * Remplace toutes les occurrences du token {prenom} par le prénom du joueur.
 * @param {string} text
 * @param {string} name
 * @returns {string}
 */
function applyPlayerName(text, name) {
  return text.split(PRENOM_TOKEN).join(name);
}

/**
 * Ajoute une légère touche stylistique au texte, en "bookend" plutôt qu'à chaque nœud :
 * la formule d'ouverture n'apparaît que sur le nœud de départ, le connecteur de fin
 * seulement sur les fins. Les nœuds intermédiaires restent inchangés, pour éviter que
 * chaque scène commence par la même phrase. Si aucun style n'est défini ou inconnu,
 * le texte est retourné inchangé.
 * @param {string} text
 * @param {string|null} style - "adventure" | "funny" | "fantasy" | null
 * @param {Object} position - { isStartNode, isEndingNode }
 * @returns {string}
 */
function applyStoryStyle(text, style, { isStartNode = false, isEndingNode = false } = {}) {
  const touch = style && storyStyles[style];
  if (!touch) {
    return text;
  }

  let result = text;

  if (isStartNode && touch.opener) {
    result = touch.opener + result.charAt(0).toLowerCase() + result.slice(1);
  }

  if (isEndingNode && touch.connector) {
    result = `${result}${touch.connector}`;
  }

  return result;
}
