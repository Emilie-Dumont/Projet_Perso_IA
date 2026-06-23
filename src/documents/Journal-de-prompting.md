# Journal de prompting — NarrativePath

Synthèse de la collaboration avec Claude (agent `NarrativePath-Agent` + assistant principal dans VS Code) pour la conception et le développement du projet NarrativePath. Source : `conversation_claude_vscode.txt` (historique complet exporté).

---

## 1. Création de l'agent NarrativePath-Agent

**Objectif** : créer un agent Claude Code dédié au projet, pour cadrer toutes les futures demandes de développement.

**Prompt clé** : `/create-agent` puis `/agent/NarrativePath-Agent.md` — commande non reconnue, suivie de questions de clarification (créer un fichier d'agent, pour un générateur de fiction interactive, au format "subagent" Claude Code).

**Itérations / corrections** : la première version générée était générique (narrative design pour un jeu RPG type quêtes/dialogues, en anglais). Elle ne correspondait pas au vrai projet. J'ai remplacé son contenu directement par une description précise : application JS Vanilla + Vite, fiction interactive sécurisée pour 6-18 ans, contraintes techniques explicites (pas de framework, Tailwind uniquement, JSON mock, sécurité par âge, moteur à nœuds).

**Ce qui a fonctionné / pas** : la version générique aurait conduit à du contenu hors-sujet (univers fantasy générique) si elle n'avait pas été corrigée immédiatement. Une description d'agent précise dès le départ aurait évité cet aller-retour.

---

## 2. Sélection du profil d'âge (6-12 / 13-18)

**Objectif** : ajouter un écran de choix d'âge avant le début de l'histoire, et adapter le texte affiché en conséquence.

**Prompt clé** : « Utilise l'agent NarrativePath-Agent et ajoute une sélection du profil d'âge (6-12 ou 13-18) au début de l'application, puis adapte le texte affiché selon l'âge choisi. »

**Itérations / corrections** : implémentation réussie dès la première passe — écran `ageSelector.js`, moteur narratif étendu pour résoudre un texte par âge, orchestration dans `main.js`. Vérifié avec `npm run dev` sans erreur.

**Ce qui a fonctionné** : bonne séparation dès le départ entre logique (moteur) et affichage (UI), qui a facilité toutes les évolutions suivantes.

---

## 3. Sauvegarde localStorage : ajoutée, puis retirée, puis réintroduite

**Objectif initial** : permettre de reprendre une histoire interrompue après fermeture ou rechargement de la page.

**Prompt clé** : « Ajoute la sauvegarde de progression avec localStorage. »

**Itération 1 — ajout** : l'historique des nœuds visités est sauvegardé après chaque choix et restauré au chargement ; le bouton "Recommencer" efface cette sauvegarde.

**Itération 2 — retrait** : après l'ajout du formulaire prénom/style, j'ai demandé que l'âge, le prénom et le style soient redemandés à **chaque** ouverture de page (pas seulement au premier lancement). Cette exigence rendait incohérente la persistance automatique de ces informations. Pour répondre à la demande, toute la persistance (âge, prénom, style, progression) a été supprimée.

**Le bug découvert** : peu après ce retrait, j'ai signalé que « l'histoire est toujours la même ». La cause réelle (avant le retrait) était que la progression sauvegardée était restaurée automatiquement à chaque chargement — donc une fois une fin atteinte, on était systématiquement ramené à cette même fin, quels que soient les nouveaux choix envisagés.

**Itération 3 — réintroduction ciblée** : lors de l'audit de conformité au cahier des charges, l'absence totale de `localStorage` est apparue comme un écart, le document l'exigeant explicitement. La sauvegarde a été réintroduite, mais de façon plus stricte : elle n'est restaurée que si la combinaison âge+style sauvegardée correspond exactement à celle choisie cette fois-ci, et seulement si la position sauvegardée n'est pas déjà une fin (sinon retour à `start`). Elle est effacée dès qu'une fin est atteinte ou que "Recommencer" est utilisé.

**Ce qui a fonctionné / pas** : la version finale concilie "tout redemander à l'ouverture" avec l'utilité réelle de la sauvegarde, sans réintroduire le bug initial. Les deux premières itérations étaient chacune cohérentes avec la demande du moment, mais incompatibles entre elles sans cette troisième passe.

---

## 4. Formulaire prénom + style narratif

**Objectif** : permettre de saisir un prénom et de choisir un style narratif (aventure, humour, fantastique) avant de démarrer l'histoire.

**Prompt clé** : « Utilise l'agent NarrativePath-Agent et ajoute un formulaire permettant de saisir le prénom et le style, puis adapte le texte des nœuds pour inclure le prénom et modifier légèrement le ton selon le style. »

**Itérations / corrections** : première version fonctionnelle (écran `profileForm.js`, token `{prenom}` substitué dans le texte, formule d'ouverture/fermeture fixe par style). Un bug de casse a été repéré et corrigé directement : quand `{prenom}` se trouvait en tout début de phrase, la mise en minuscule automatique du premier caractère (pensée pour enchaîner la formule de style) s'appliquait à la première lettre du **prénom** plutôt qu'à celle de la phrase d'origine (ex. « lou » au lieu de « Lou »). Corrigé en appliquant la touche de style avant la substitution du prénom plutôt qu'après.

**Ce qui a fonctionné / pas** : la fonctionnalité de base marchait, mais ce type de bug montre l'intérêt de vérifier visuellement le rendu plutôt que de se fier uniquement à l'absence d'erreur au démarrage.

---

## 5. Différenciation du contenu par style

**Objectif** : faire en sorte que le style choisi influence réellement le contenu de l'histoire, pas seulement une formule de politesse.

**Itérations / corrections** :
1. **Opener/connector fixes** : une phrase ajoutée au début et à la fin de **chaque** nœud selon le style. Défaut signalé : « chaque récit commence par *Comme dans un conte enchanté* » — répétitif et artificiel.
2. **Correctif "bookend"** : la formule d'ouverture limitée au nœud de départ, la formule de clôture aux fins uniquement. Amélioration partielle, mais le cœur du texte restait identique entre styles.
3. **baseText / tone / style composés dynamiquement** : sur demande très précise (structure de données détaillée fournie), passage à une fonction `buildText` qui assemble un texte de base, une phrase liée à l'âge et une phrase liée au style, appelée depuis `render.js`.
4. **Histoires totalement séparées** (voir section 7) : a rendu `tone`/`style` obsolètes — chaque histoire étant déjà spécifique à une combinaison, `buildText` a été simplifié pour ne plus faire que remplacer `{prenom}`.

**Ce qui a fonctionné / pas** : les itérations 1 à 3 amélioraient la perception sans changer la structure de l'histoire — le problème de fond (« toujours la même histoire ») n'a été résolu qu'à l'étape 7. Une demande de différenciation « de contenu » doit préciser si elle porte sur le texte ou sur la structure narrative elle-même.

---

## 6. Le bug « l'histoire est toujours la même » — cause réelle

**Symptôme rapporté** : peu importe les choix faits, l'expérience semble identique.

**Deux causes distinctes, identifiées à deux moments différents** :
- **Cause narrative** (section 5) : le contenu ne variait pas assez par style — seul le ton changeait, pas les événements de l'histoire.
- **Cause technique** (section 3) : la progression sauvegardée en `localStorage` était restaurée automatiquement à chaque chargement de page, y compris lorsqu'elle pointait déjà sur une fin. Une fois une fin atteinte, on y était systématiquement ramené lors des sessions suivantes.

**Diagnostic** : repéré en relisant précisément le flux de `showProfileFormStep()` dans `main.js`, qui appelait `engine.restoreHistory(savedHistory)` sans jamais vérifier si cette position était déjà une fin.

**Correction** : suppression temporaire de la persistance, puis réintroduction avec une garde explicite (« si la position restaurée est une fin, repartir à `start` »).

---

## 7. Passage à 6 histoires complètes indépendantes

**Objectif** : que chaque combinaison âge × style corresponde à une histoire avec une **structure de nœuds réellement différente** (nombre de branches, de fins, d'événements), pas seulement un texte différent sur le même squelette.

**Prompt clé** : demande détaillée précisant (1) des graphes de nœuds différents par combinaison, (2) une sélection dynamique de l'histoire selon l'âge et le style choisis, (3) une simplification du moteur en conséquence.

**Résultat** :
- 6 fichiers JSON indépendants (`src/data/stories/{age}_{style}.json`), chacun avec son propre nœud `start` et son propre graphe.
- Une fonction `selectStory(ageProfile, style)` qui choisit le bon graphe.
- `narrativeEngine.js` et `buildText.js` simplifiés (plus de résolution `tone`/`style` au niveau du nœud, puisque l'histoire entière est déjà spécifique à la combinaison).
- `main.js` restructuré pour créer le moteur narratif seulement une fois l'âge **et** le style connus (auparavant créé une seule fois au chargement).

**Validation** : script de validation automatique (ids uniques, présence du nœud `start`, tous les `next` valides) exécuté sur les 6 fichiers — 0 erreur.

---

## 8. Vérification de conformité au cahier des charges

**Objectif** : auditer le projet par rapport à `Cahier des Charges Projet Narrativ.txt` et à la Méthode MoSCoW.

**Méthode** : comparaison point par point (architecture technique, fonctionnalités, sécurité, rejouabilité) complétée par des scripts Node de validation automatique (structure JSON, comptage de choix par nœud).

**Écarts trouvés et corrigés** :
1. `localStorage` totalement absent alors que le cahier des charges l'exige explicitement dans l'architecture technique → corrigé (voir section 3, itération 3).
2. 21 nœuds intermédiaires n'avaient qu'un seul choix au lieu des 2 à 3 choix exigés → corrigé en ajoutant un choix supplémentaire cohérent à chacun, puis revalidé par script (0 erreur sur les 6 fichiers).

**Résultat final** : conformité complète aux exigences "Must have" et "Should have" du MoSCoW. Les bonus "Could have" (synthèse vocale, résumé d'aventure, mode adulte) restent volontairement non traités.

---

## Ce que j'ai appris sur le pilotage de l'IA

- **La précision du prompt change la nature du résultat, pas seulement sa qualité.** Une demande vague ("améliore le style") a produit une amélioration cosmétique (formules ajoutées au texte) ; une demande précise avec un exemple concret de structure de données a produit un vrai changement structurel (6 histoires distinctes).
- **Itérer par petites demandes ciblées aide à localiser les vraies causes.** Le bug "l'histoire est toujours la même" avait deux causes différentes ; les corriger une par une (plutôt que de tout réécrire d'un coup) a permis d'identifier précisément la cause technique (restauration de progression) qui aurait pu rester masquée derrière la cause narrative.
- **Toujours vérifier le résultat, pas seulement lire la réponse de l'IA.** Plusieurs problèmes (bug de casse sur le prénom, nœuds à choix unique, écart sur `localStorage`) n'étaient visibles qu'en testant l'application ou en validant les données par script — jamais en se fiant uniquement à l'absence d'erreur annoncée.
- **Confronter régulièrement le résultat au document de référence (cahier des charges) révèle des écarts invisibles à l'usage.** L'absence de `localStorage` ne se voyait pas en utilisant l'application ; elle n'est apparue qu'en relisant le cahier des charges ligne par ligne.
