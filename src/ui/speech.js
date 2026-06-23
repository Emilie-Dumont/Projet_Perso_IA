// Synthèse vocale via l'API native Web Speech du navigateur (aucune dépendance externe).

/**
 * Lit à voix haute le texte donné, en français.
 * Annule toute lecture en cours avant de démarrer la nouvelle.
 * @param {string} text - texte déjà résolu (sans token {prenom}) à lire
 */
export function speak(text) {
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'fr-FR';
  utterance.rate = 0.95;
  utterance.pitch = 1;

  window.speechSynthesis.speak(utterance);
}

/**
 * Coupe immédiatement toute lecture en cours.
 */
export function stopSpeaking() {
  window.speechSynthesis.cancel();
}
