// Moteur narratif simple : charge des nœuds et gère l'historique de navigation.
// Un "nœud" = { id, text, choices: [{ label, next }] }
// Depuis que chaque combinaison âge x style a son propre graphe (voir src/data/stories.js),
// l'engine reçoit directement le graphe déjà sélectionné pour la partie en cours : il n'a plus
// à connaître l'âge ni le style, seulement le prénom du joueur (pour remplacer {prenom} via buildText).

const DEFAULT_PLAYER_NAME = 'Aventurier';

/**
 * Crée une instance du moteur narratif à partir d'un objet de nœuds.
 * @param {Object} nodes - dictionnaire { id: noeud } de l'histoire sélectionnée
 * @param {string} startId - id du nœud de départ
 * @returns {Object} API du moteur (getCurrentNode, choose, restart, restoreHistory, getHistory,
 *   isEnding, setPlayerName, getPlayerName)
 */
export function createNarrativeEngine(nodes, startId = 'start') {
  let history = [startId];
  let playerName = DEFAULT_PLAYER_NAME;

  function getCurrentNodeId() {
    return history[history.length - 1];
  }

  /**
   * Retourne le nœud courant tel quel (texte brut, non résolu).
   * C'est à l'appelant (typiquement `render.js`, via `buildText`) de remplacer {prenom}
   * dans le texte avant affichage.
   */
  function getCurrentNode() {
    const id = getCurrentNodeId();
    const node = nodes[id];
    if (!node) {
      throw new Error(`Nœud narratif introuvable pour l'id "${id}"`);
    }

    return node;
  }

  /**
   * Définit le prénom du joueur, utilisé pour remplacer {prenom} dans les textes.
   * @param {string} name
   */
  function setPlayerName(name) {
    if (name && name.trim()) {
      playerName = name.trim();
    }
  }

  function getPlayerName() {
    return playerName;
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
   * Réinitialise l'histoire au nœud de départ (même graphe).
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
    setPlayerName,
    getPlayerName,
  };
}
