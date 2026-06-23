// Écran de saisie du profil joueur (prénom + style narratif), affiché après le choix
// du profil d'âge et avant le début de l'histoire.

const STYLE_OPTIONS = [
  { style: 'adventure', label: 'Aventure' },
  { style: 'funny', label: 'Drôle' },
  { style: 'fantasy', label: 'Fantastique' },
];

/**
 * Affiche le formulaire prénom + style dans le conteneur donné.
 * @param {HTMLElement} container - élément DOM cible (ex: #app)
 * @param {Object} callbacks - { onSubmit({ name, style }) }
 */
export function renderProfileForm(container, callbacks) {
  const { onSubmit } = callbacks;

  let selectedStyle = STYLE_OPTIONS[0].style;

  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'max-w-2xl mx-auto mt-12 p-6 bg-white rounded-2xl shadow-md text-center';

  const title = document.createElement('h1');
  title.className = 'text-2xl font-bold text-slate-800 mb-2';
  title.textContent = 'Crée ton aventurier';
  wrapper.appendChild(title);

  const subtitle = document.createElement('p');
  subtitle.className = 'text-slate-600 mb-8';
  subtitle.textContent = 'Choisis ton prénom et le style de ton histoire :';
  wrapper.appendChild(subtitle);

  // Champ prénom
  const nameLabel = document.createElement('label');
  nameLabel.className = 'block text-left text-sm font-semibold text-slate-700 mb-2';
  nameLabel.textContent = 'Ton prénom';
  wrapper.appendChild(nameLabel);

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = 'Ex : Lou';
  nameInput.maxLength = 30;
  nameInput.className =
    'w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-800 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-300';
  wrapper.appendChild(nameInput);

  const errorEl = document.createElement('p');
  errorEl.className = 'text-sm text-red-500 mb-6 h-5';
  wrapper.appendChild(errorEl);

  // Choix du style narratif
  const styleLabel = document.createElement('p');
  styleLabel.className = 'block text-left text-sm font-semibold text-slate-700 mb-3';
  styleLabel.textContent = 'Style de l\'histoire';
  wrapper.appendChild(styleLabel);

  const stylesEl = document.createElement('div');
  stylesEl.className = 'flex flex-col sm:flex-row gap-4 justify-center mb-8';

  const styleButtons = [];

  STYLE_OPTIONS.forEach(({ style, label }) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label;
    btn.dataset.style = style;
    btn.addEventListener('click', () => {
      selectedStyle = style;
      updateStyleButtonStyles();
    });
    styleButtons.push(btn);
    stylesEl.appendChild(btn);
  });

  /**
   * Met à jour l'apparence des boutons de style pour refléter la sélection courante.
   */
  function updateStyleButtonStyles() {
    styleButtons.forEach((btn) => {
      const isSelected = btn.dataset.style === selectedStyle;
      btn.className = isSelected
        ? 'flex-1 px-4 py-4 rounded-xl bg-indigo-600 text-white font-semibold transition-colors border border-indigo-600'
        : 'flex-1 px-4 py-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-semibold transition-colors border border-indigo-200';
    });
  }

  updateStyleButtonStyles();
  wrapper.appendChild(stylesEl);

  // Bouton de validation
  const submitBtn = document.createElement('button');
  submitBtn.type = 'button';
  submitBtn.className =
    'w-full px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors';
  submitBtn.textContent = 'Commencer l\'aventure';
  submitBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();

    if (!name) {
      errorEl.textContent = 'Merci de saisir un prénom pour continuer.';
      nameInput.focus();
      return;
    }

    errorEl.textContent = '';
    onSubmit({ name, style: selectedStyle });
  });
  wrapper.appendChild(submitBtn);

  container.appendChild(wrapper);
  nameInput.focus();
}
