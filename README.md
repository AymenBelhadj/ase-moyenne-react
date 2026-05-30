# ASE Moyenne React

Application web moderne pour calculer les moyennes du cycle **Automotive Software Engineering** : 1ère, 2ème et 3ème année.

## Fonctionnalités

- Calcul automatique par matière, TU, semestre et année.
- Moyennes provisoires divisées sur la somme de tous les coefficients, même si une seule matière est remplie.
- Validation des crédits avec compensation : si la moyenne TU est ≥ 8, tous les crédits de cette TU sont validés ; sinon seules les matières ≥ 8 comptent.
- Compensation annuelle par TU : TU1 S1 + TU1 S2, etc. Si la moyenne annuelle d'une TU est ≥ 8, tous ses crédits sont validés.
- Boutons ASE 2 et ASE 3 verrouillés provisoirement avec message popup drôle.
- Formules intégrées :
  - Module avec TP : `DS × 0,25 + TP × 0,25 + Examen × 0,5`
  - Module sans TP : `(DS + 2 × Examen) / 3`
  - Module avec projet : `DS × 0,25 + Projet × 0,25 + Examen × 0,5`
  - Module avec TP + projet : `DS × 0,25 + moyenne(TP, Projet) × 0,25 + Examen × 0,5` *(choix intuitif ajouté pour le cas où les deux options sont activées)*
  - Projet semestriel coefficient 4 : note unique.
  - TU : `somme(note × coefficient) / somme de tous les coefficients de la TU`.
- Sauvegarde automatique sur le PC de l’utilisateur avec cookies découpés en blocs + copie localStorage.
- Import/export JSON.
- Mode sombre / clair.
- Recherche par code ou matière.
- Calcul spécial 3ème année avec ou sans stage final/PFE.

## Installation locale

### 1. Installer Node.js

Installe une version récente de Node.js depuis le site officiel.

Vérifie l’installation :

```bash
node -v
npm -v
```

### 2. Installer les dépendances

Dans le dossier du projet :

```bash
npm install
```

### 3. Lancer l’application en développement

```bash
npm run dev
```

Ouvre l’adresse affichée dans le terminal, généralement :

```text
http://localhost:5173
```

### 4. Générer la version production

```bash
npm run build
```

Le dossier `dist/` sera généré.

### 5. Tester la version production localement

```bash
npm run preview
```

## Déploiement gratuit simple

### Option A — Vercel

1. Crée un compte Vercel.
2. Mets le projet sur GitHub.
3. Sur Vercel : **Add New Project** → importe le dépôt GitHub.
4. Vercel détecte Vite automatiquement.
5. Build command : `npm run build`.
6. Output directory : `dist`.
7. Clique sur **Deploy**.

Le fichier `vercel.json` est déjà inclus pour gérer correctement une SPA.

### Option B — Netlify

1. Crée un compte Netlify.
2. Mets le projet sur GitHub.
3. Sur Netlify : **Add new site** → **Import an existing project**.
4. Build command : `npm run build`.
5. Publish directory : `dist`.
6. Clique sur **Deploy**.

Le fichier `netlify.toml` et `public/_redirects` sont déjà inclus.

## Structure du projet

```text
ase-moyenne-react/
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
├── netlify.toml
├── public/
│   └── _redirects
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── styles.css
    ├── data/
    │   └── program.js
    └── utils/
        ├── calculations.js
        └── storage.js
```

## Modifier les matières ou coefficients

Tout est centralisé dans :

```text
src/data/program.js
```

Tu peux changer :

- le nom d’une matière ;
- son code ;
- son crédit/coefficient ;
- son unité TU ;
- le mode `singleGrade` pour une note unique.

## Notes importantes

- Les notes sont limitées automatiquement entre 0 et 20.
- Les moyennes incomplètes sont affichées comme prévisionnelles.
- Les cookies sont locaux au navigateur et au domaine. Si l’utilisateur change de navigateur ou d’ordinateur, il faut utiliser l’export/import JSON.

## Intro animée / Splash screen

Cette version contient une intro animée moderne qui s'affiche au chargement de l'application pendant environ 3,4 secondes.

### Images personnalisables

Remplace simplement ces fichiers dans le dossier `public/` en gardant les mêmes noms :

- `public/school-logo.svg` : logo de l'école, affiché en haut à gauche.
- `public/university-logo.svg` : logo de l'université, affiché en haut à droite.
- `public/intro-visual.svg` : grande image/illustration de l'intro.

Tu peux utiliser des fichiers `.png`, `.jpg` ou `.webp`, mais dans ce cas il faut aussi modifier les chemins dans `src/App.jsx` :

```jsx
<img src="/school-logo.png" alt="Logo de l'école" />
<img src="/university-logo.png" alt="Logo de l'université" />
<img src="/intro-visual.png" alt="Visuel Automotive Software Engineering" />
```

### Changer la durée de l'intro

Dans `src/App.jsx`, modifie :

```js
const INTRO_DURATION_MS = 3400;
```

Par exemple, pour 5 secondes :

```js
const INTRO_DURATION_MS = 5000;
```

### Texte affiché dans l'intro

Le nom de la filière, l'année universitaire et les phrases d'accueil se trouvent dans le composant `IntroScreen` dans `src/App.jsx`.


## Images de l’intro en JPG/PNG

Cette version utilise déjà des images classiques :

```text
public/school-logo.png
public/university-logo.png
public/intro-visual.jpg
```

Pour personnaliser l’intro, remplace simplement ces trois fichiers par tes vraies images en gardant exactement les mêmes noms.
Tu peux aussi utiliser `.jpg` ou `.png` librement, mais dans ce cas modifie les chemins dans `src/App.jsx`.

Exemple :

```jsx
<img src="/school-logo.png" alt="Logo de l'école" />
<img src="/university-logo.png" alt="Logo de l'université" />
<img src="/intro-visual.jpg" alt="Visuel Automotive Software Engineering" />
```

Conseil : évite les espaces dans les noms des fichiers. Utilise plutôt `school-logo.png`, `university-logo.png`, `intro-visual.jpg`.
