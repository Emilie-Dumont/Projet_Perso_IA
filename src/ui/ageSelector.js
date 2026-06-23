// Écran de sélection du profil d'âge, affiché avant le début de l'histoire.
// Permet d'adapter ensuite le vocabulaire des nœuds narratifs.

import logo from '../assets/logo.svg';

/**
 * Affiche l'écran de choix du profil d'âge dans le conteneur donné.
 * @param {HTMLElement} container - élément DOM cible (ex: #app)
 * @param {Object} callbacks - { onSelectAge(profile) } où profile = "6-12" ou "13-18"
 */
export function renderAgeSelector(container, callbacks) {
  const { onSelectAge } = callbacks;

  container.innerHTML = '';

  const wrapper = document.createElement('div');
  // "fade-in" : voir style.css pour la transition d'opacité au montage
  wrapper.className = 'max-w-2xl mx-auto mt-12 p-6 bg-white rounded-2xl shadow-md text-center fade-in';

  const logoEl = document.createElement('img');
  logoEl.src = logo;
  logoEl.alt = 'Logo NarrativePath';
  logoEl.className = 'mx-auto mb-6 h-20';
  wrapper.appendChild(logoEl);

  const title = document.createElement('h1');
  title.className = 'text-2xl font-bold text-slate-800 mb-2';
  title.textContent = 'Bienvenue dans NarrativePath';
  wrapper.appendChild(title);

  const subtitle = document.createElement('p');
  subtitle.className = 'text-slate-600 mb-8';
  subtitle.textContent = 'Pour adapter l\'histoire, dis-nous quel âge tu as :';
  wrapper.appendChild(subtitle);

  const choicesEl = document.createElement('div');
  choicesEl.className = 'flex flex-col sm:flex-row gap-4 justify-center';

  const ageOptions = [
    { profile: '6-12', label: '6 - 12 ans' },
    { profile: '13-18', label: '13 - 18 ans' },
  ];

  ageOptions.forEach(({ profile, label }) => {
    const btn = document.createElement('button');
    btn.className =
      'flex-1 px-4 py-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-semibold transition-colors border border-indigo-200';
    btn.textContent = label;
    btn.addEventListener('click', () => onSelectAge(profile));
    choicesEl.appendChild(btn);
  });

  wrapper.appendChild(choicesEl);
  container.appendChild(wrapper);

  // Déclenche la transition d'opacité une fois le wrapper monté dans le DOM.
  requestAnimationFrame(() => {
    wrapper.classList.add('fade-in-visible');
  });
}
