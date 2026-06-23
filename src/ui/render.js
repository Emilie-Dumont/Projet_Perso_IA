// Rendu UI simple : affiche le nœud courant (texte + choix) et le bouton "Recommencer".
// Utilise uniquement des classes Tailwind pour le style.

/**
 * Affiche le nœud narratif courant dans le conteneur donné.
 * @param {HTMLElement} container - élément DOM cible (ex: #app)
 * @param {Object} node - nœud courant { id, text, choices }
 * @param {Object} callbacks - { onChoose(nextId), onRestart() }
 */
export function renderNode(container, node, callbacks) {
  const { onChoose, onRestart } = callbacks;

  // Reset du conteneur avant chaque rendu
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'max-w-2xl mx-auto mt-12 p-6 bg-white rounded-2xl shadow-md';

  // Texte de la scène
  const textEl = document.createElement('p');
  textEl.className = 'text-lg text-slate-800 leading-relaxed mb-6';
  textEl.textContent = node.text;
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
    const endEl = document.createElement('p');
    endEl.className = 'text-sm text-slate-500 italic';
    endEl.textContent = "C'est la fin de cette histoire.";
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
