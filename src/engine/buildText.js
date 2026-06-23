// Construction du texte affiché pour un nœud narratif.
// Depuis que chaque combinaison âge x style a son propre graphe d'histoire (voir
// src/data/stories.js), un nœud n'a plus besoin de "tone"/"style" imbriqués :
// son champ `text` est déjà écrit pour le bon public. Ce module se contente donc
// de remplacer le token {prenom} par le prénom du joueur.

const PRENOM_TOKEN = '{prenom}';

/**
 * Construit le texte final d'un nœud en remplaçant {prenom} par le prénom du joueur.
 * @param {Object} node - nœud narratif { id, text, choices }
 * @param {Object} context
 * @param {string} context.playerName - prénom du joueur
 * @returns {string} texte final, prêt à être affiché
 */
export function buildText(node, { playerName } = {}) {
  if (!node) {
    return '';
  }

  return (node.text || '').split(PRENOM_TOKEN).join(playerName || '');
}
