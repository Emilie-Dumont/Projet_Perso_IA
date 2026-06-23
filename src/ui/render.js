// Rendu UI simple : affiche le nœud courant (texte + choix) et le bouton "Recommencer".
// Utilise uniquement des classes Tailwind pour le style.
// Le graphe de nœuds utilisé est déjà spécifique à la combinaison âge/style choisie
// (voir src/data/stories.js) : il ne reste plus qu'à remplacer {prenom} via `buildText`.

import { buildText } from '../engine/buildText.js';

/**
 * Affiche le nœud narratif courant dans le conteneur donné.
 * @param {HTMLElement} container - élément DOM cible (ex: #app)
 * @param {Object} node - nœud courant brut { id, text, choices }
 * @param {Object} options
 * @param {Function} options.onChoose - callback(nextId) appelé au clic sur un choix
 * @param {Function} options.onRestart - callback() appelé au clic sur "Recommencer"
 * @param {string} options.playerName - prénom du joueur, pour remplacer {prenom}
 */
export function renderNode(container, node, { onChoose, onRestart, playerName }) {
  // Reset du conteneur avant chaque rendu
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'max-w-2xl mx-auto mt-12 p-6 bg-white rounded-2xl shadow-md';

  // Texte de la scène : le {prenom} du nœud est remplacé par le prénom du joueur
  const finalText = buildText(node, { playerName });

  const textEl = document.createElement('p');
  textEl.className = 'text-lg text-slate-800 leading-relaxed mb-6';
  textEl.textContent = finalText;
  wrapper.appendChild(textEl);

  // Liste des choix
  const choicesEl = document.createElement('div');
  choicesEl.className = 'flex flex-col gap-3';

  if (node.choices && node.choices.length > 0) {
    node.choices.forEach((choice) => {
      const btn = document.createElement('button');
      btn.className =
        'w-full text-left px-4 py-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-medium transition-colors border border-indigo-200';
      btn.textContent = choice.label;
      btn.addEventListener('click', () => onChoose(choice.next));
      choicesEl.appendChild(btn);
    });
  } else {
    // Nœud de fin (choices vide) : le texte de fin est déjà inclus dans `node.text`,
    // on ajoute juste un repère visuel.
    const endEl = document.createElement('p');
    endEl.className = 'text-sm text-slate-500 italic';
    endEl.textContent = "Fin de l'histoire.";
    choicesEl.appendChild(endEl);
  }

  wrapper.appendChild(choicesEl);

  // Bouton Recommencer (toujours visible)
  const restartBtn = document.createElement('button');
  restartBtn.className =
    'mt-8 w-full px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition-colors';
  restartBtn.textContent = 'Recommencer';
  restartBtn.addEventListener('click', onRestart);
  wrapper.appendChild(restartBtn);

  container.appendChild(wrapper);
}
