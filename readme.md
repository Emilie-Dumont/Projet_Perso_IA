# NarrativePath

## 📖 Description

NarrativePath est une application web de fiction interactive sécurisée pour enfants et adolescents.

Elle permet à un utilisateur de vivre une aventure narrative en faisant des choix, tout en bénéficiant d’un contenu adapté à son âge et à son profil.

Le projet simule le comportement d’une intelligence artificielle générative grâce à un système de variations dynamiques du texte.

---

## 🎯 Objectifs

- Proposer une narration interactive
- Assurer un contenu adapté par tranche d’âge
- Offrir une expérience personnalisée
- Simuler une logique d’IA sans API externe

---

## ⚙️ Technologies utilisées

- Vite.js (frontend)
- JavaScript Vanilla
- Tailwind CSS
- JSON (données mock)
- localStorage (sauvegarde)

---

## 🧠 Fonctionnalités

### 🔹 Moteur narratif

- Système de nœuds (texte + choix)
- Navigation interactive
- Plusieurs fins possibles

### 🔹 Personnalisation

- Prénom intégré dans le récit
- Choix du style :
  - aventure
  - humour
  - fantastique

### 🔹 Adaptation par âge

- 6–12 ans : langage simple, ton positif
- 13–18 ans : ton plus complexe et immersif

### 🔹 Simulation IA

- Texte dynamique construit à partir :
  - d’un texte de base
  - d’une variation "âge"
  - d’une variation "style"

👉 Cela permet de simuler une génération d’histoire intelligente sans API externe.

### 🔹 Sauvegarde

- Progression sauvegardée avec localStorage
- Profil utilisateur conservé

---

## 📁 Structure du projet

Le projet est organisé en plusieurs dossiers :

- **src/data** : contient les données JSON (histoires, nœuds)
- **src/engine** : contient la logique du moteur narratif
- **src/ui** : contient le rendu et l’interface utilisateur

---

## 🔐 Sécurité

La sécurité est assurée par :

- adaptation du contenu selon l’âge
- absence de génération libre non contrôlée
- contraintes définies via des prompts simulés

Les prompts sont documentés dans :

documents/PROMPTS.md

---

## 🚀 Lancer le projet

```bash
npm install
npm run dev
``
```
