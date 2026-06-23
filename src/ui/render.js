// Rendu UI simple : affiche le nœud courant (texte + choix) et le bouton "Recommencer".
// Utilise uniquement des classes Tailwind pour le style.
// Le graphe de nœuds utilisé est déjà spécifique à la combinaison âge/style choisie
// (voir src/data/stories.js) : il ne reste plus qu'à remplacer {prenom} via `buildText`.

import { buildText } from '../engine/buildText.js';
import { speak, stopSpeaking } from './speech.js';
import adventureIllustration from '../assets/adventure.svg';
import funnyIllustration from '../assets/funny.svg';
import fantasyIllustration from '../assets/fantasy.svg';

// Illustration affichée en haut de l'écran d'histoire selon le style narratif choisi.
// Repli sur "adventure" si le style est absent ou inconnu.
const STYLE_ILLUSTRATIONS = {
  adventure: adventureIllustration,
  funny: funnyIllustration,
  fantasy: fantasyIllustration,
};
const FALLBACK_STYLE = 'adventure';

/**
 * Affiche le nœud narratif courant dans le conteneur donné.
 * @param {HTMLElement} container - élément DOM cible (ex: #app)
 * @param {Object} node - nœud courant brut { id, text, choices }
 * @param {Object} options
 * @param {Function} options.onChoose - callback(nextId) appelé au clic sur un choix
 * @param {Function} options.onRestart - callback() appelé au clic sur "Recommencer"
 * @param {string} options.playerName - prénom du joueur, pour remplacer {prenom}
 * @param {string} [options.style] - style narratif courant ("adventure" | "funny" | "fantasy")
 */
export function renderNode(container, node, { onChoose, onRestart, playerName, style }) {
  // On change de nœud (y compris via "Recommencer") : on coupe toute lecture vocale en cours.
  stopSpeaking();

  // Reset du conteneur avant chaque rendu
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  // Le fade-in est géré via la classe "fade-in" définie dans style.css :
  // on démarre invisible, puis on ajoute la classe juste après le montage dans le DOM.
  wrapper.className = 'max-w-2xl mx-auto mt-12 p-6 bg-white rounded-2xl shadow-md fade-in';

  // Illustration de style narratif, au-dessus du texte du nœud
  const illustrationSrc = STYLE_ILLUSTRATIONS[style] || STYLE_ILLUSTRATIONS[FALLBACK_STYLE];
  const illustrationEl = document.createElement('img');
  illustrationEl.src = illustrationSrc;
  illustrationEl.alt = `Illustration d'ambiance pour le style ${style || FALLBACK_STYLE}`;
  illustrationEl.className = 'w-full rounded-2xl mb-6 object-cover';
  wrapper.appendChild(illustrationEl);

  // Texte de la scène : le {prenom} du nœud est remplacé par le prénom du joueur
  const finalText = buildText(node, { playerName });

  const textEl = document.createElement('p');
  textEl.className = 'text-lg text-slate-800 leading-relaxed mb-6';
  textEl.textContent = finalText;
  wrapper.appendChild(textEl);

  // Bouton d'écoute du texte de la scène via la synthèse vocale du navigateur
  const speakBtn = document.createElement('button');
  speakBtn.className =
    'mb-6 px-4 py-2 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-medium transition-colors border border-indigo-200';
  speakBtn.textContent = "🔊 Écouter l'histoire";
  speakBtn.addEventListener('click', () => speak(finalText));
  wrapper.appendChild(speakBtn);

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

  // Déclenche la transition d'opacité une fois le wrapper monté dans le DOM
  // (le navigateur a besoin d'un repaint entre l'état initial et l'état final).
  requestAnimationFrame(() => {
    wrapper.classList.add('fade-in-visible');
  });
}
