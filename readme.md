# NarrativePath

## 📖 Description

NarrativePath est une application web de fiction interactive sécurisée pour enfants et adolescents.

Elle permet à un utilisateur de vivre une aventure narrative en faisant des choix, dans une histoire dont le contenu (vocabulaire, ton, enjeux) est déjà adapté à sa tranche d'âge et au style narratif choisi.

Le projet ne fait appel à aucune IA générative réelle : les histoires sont des données mock JSON écrites à l'avance pour chaque combinaison âge × style, ce qui permet de garantir un contenu maîtrisé et sécurisé sans dépendre d'une API externe.

---

## 🎯 Objectifs

- Proposer une narration interactive à choix multiples
- Garantir un contenu adapté et sécurisé par tranche d'âge
- Offrir une expérience personnalisée (prénom, style narratif)
- Illustrer une logique de sécurité "by design" sans API IA externe

---

## ⚙️ Technologies utilisées

- Vite.js (frontend uniquement, pas de backend)
- JavaScript Vanilla (pas de framework)
- Tailwind CSS (style)
- JSON (données mock des histoires)
- localStorage (sauvegarde de la progression)
- Web Speech API (synthèse vocale native du navigateur)

---

## 🧠 Fonctionnalités

### 🔹 Moteur narratif

- Système de nœuds (texte + 2-3 choix), géré par `src/engine/narrativeEngine.js`
- Historique des nœuds visités et des libellés de choix sélectionnés
- Plusieurs fins possibles par histoire (nœud sans choix)
- Bouton "Recommencer" toujours visible

### 🔹 Personnalisation

- Prénom du joueur intégré dans le récit (token `{prenom}` remplacé dans le texte)
- Choix du style narratif :
  - aventure
  - drôle
  - fantastique

### 🔹 Adaptation par âge

- 6–12 ans : langage simple, ton positif
- 13–18 ans : ton plus riche, enjeux narratifs plus complexes

Chaque combinaison âge × style correspond à une histoire entièrement écrite à l'avance (voir section Architecture ci-dessous) : il n'y a pas de génération de texte à la volée.

### 🔹 Illustrations et ambiance

- Une illustration SVG différente selon le style narratif choisi (aventure / drôle / fantastique), affichée au-dessus du texte de chaque nœud
- Un logo SVG affiché sur l'écran d'accueil (sélection de l'âge)
- Bouton "🔊 Écouter l'histoire" : lit le texte du nœud courant à voix haute via la synthèse vocale du navigateur (`fr-FR`)
- Effet de fade-in (fondu + léger glissement) à l'apparition de chaque écran

### 🔹 Résumé de l'aventure

- Sur un nœud de fin, si le joueur a fait au moins un choix, un encart "📜 Ton aventure en résumé" liste tous les libellés des choix effectués, dans l'ordre

### 🔹 Sauvegarde de la progression

- À chaque choix, la progression (combinaison âge/style + historique des nœuds visités) est sauvegardée dans `localStorage` (clé `narrativepath:progress`)
- Cette sauvegarde n'est restaurée que si l'âge et le style ressaisis à l'ouverture correspondent exactement à ceux sauvegardés, et seulement si la position sauvegardée n'est pas déjà une fin (sinon retour au nœud de départ)
- La sauvegarde est effacée dès qu'une fin est atteinte, ou dès qu'on clique sur "Recommencer"
- L'âge, le prénom et le style sont redemandés à **chaque** ouverture de l'application et à chaque clic sur "Recommencer" : rien n'est jamais pré-rempli automatiquement, aucun "profil utilisateur" n'est conservé entre deux sessions — seule la progression dans l'histoire l'est

---

## 🏗️ Architecture du moteur narratif

Contrairement à une génération de texte dynamique, chaque combinaison âge × style est une histoire **complètement indépendante** :

1. **6 histoires mock** sous `src/data/stories/` :
   `6-12_adventure.json`, `6-12_funny.json`, `6-12_fantasy.json`,
   `13-18_adventure.json`, `13-18_funny.json`, `13-18_fantasy.json`
   Chaque fichier est un graphe de nœuds complet avec son propre nœud `start`.
2. `src/data/stories.js` expose `selectStory(ageProfile, style)`, qui retourne le bon graphe de nœuds pour la combinaison demandée (avec repli sur `6-12` / `adventure` si la combinaison est inconnue).
3. `src/engine/narrativeEngine.js` reçoit ce graphe déjà sélectionné et expose une API : `getCurrentNode`, `choose`, `restart`, `restoreHistory`, `getHistory`, `getChosenLabels`, `isEnding`, `setPlayerName`, `getPlayerName`.
4. `src/engine/buildText.js` (`buildText`) ne fait qu'une seule chose : remplacer le token `{prenom}` par le prénom du joueur dans `node.text`. Le texte étant déjà écrit pour la bonne tranche d'âge et le bon style dans le fichier JSON correspondant, aucun assemblage dynamique de variations n'est nécessaire.

---

## 📁 Structure du projet

- **src/data** : données mock des histoires (`stories.js` + `stories/*.json`)
- **src/engine** : logique du moteur narratif (`narrativeEngine.js`, `buildText.js`)
- **src/ui** : rendu et interface utilisateur
  - `ageSelector.js` : écran de sélection de l'âge (avec logo)
  - `profileForm.js` : écran de saisie du prénom et du style narratif
  - `render.js` : affichage d'un nœud (illustration, texte, bouton vocal, choix ou fin avec résumé, bouton Recommencer)
  - `speech.js` : synthèse vocale (Web Speech API)
- **src/assets** : illustrations SVG (générées par IA) — `adventure.svg`, `funny.svg`, `fantasy.svg`, `logo.svg`
- **src/documents** : documents de pilotage et de cadrage du projet
- **src/style.css** : styles globaux (import Tailwind + animation fade-in)
- **src/main.js** : point d'entrée, orchestre les écrans et la sauvegarde de progression

---

## 🔐 Sécurité

La sécurité est assurée "by design" :

- aucune génération de texte libre : chaque histoire est un contenu mock écrit et validé à l'avance
- adaptation du contenu selon l'âge dès la conception de chaque histoire
- contraintes de sécurité définies via des prompts IA simulés, qui ont guidé la rédaction des histoires

Ces prompts sont documentés dans :

- `src/documents/Prompts.md`

---

## 📚 Documentation du projet

- `src/documents/Cahier des Charges  Projet Narrativ.txt` — cahier des charges du projet
- `src/documents/Méthode MoSCoW  NarrativePath.txt` — priorisation des fonctionnalités (Must/Should/Could/Won't have)
- `src/documents/Prompts.md` — prompts IA sécurisés par tranche d'âge (6–12 et 13–18)
- `src/documents/Journal-de-prompting.md` — traçabilité du pilotage de l'assistant IA durant le développement

---

## 🚀 Lancer le projet

```bash
npm install
npm run dev
```

Pour générer une version de production (dossier `dist/`) :

```bash
npm run build
```
